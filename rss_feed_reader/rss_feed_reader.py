#!/usr/bin/python3
from gevent import monkey as curious_george
curious_george.patch_all(thread=False, select=False)
import feedparser
import json
import hashlib
from pymongo import MongoClient, UpdateOne, ReturnDocument
import grequests
from threading import Thread
import os
import logging
import urllib
from dateutil import parser
from text_processor.TextProcessor import TextProcessor
from datetime import datetime, timedelta
from sys import platform
import itertools

logger = logging.getLogger("rss_feed_reader")
hdlr = logging.FileHandler('rss_reader.log')
formatter = logging.Formatter('%(asctime)s - %(levelname)s : %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)
CATEGORIES = ["politics"] 
REJECT_SIMILARITY = 0.68      

#returns an array of image urls
def getArticleImages(item):
    images = []
    if (hasattr(item, 'media_content')):
        media_content = item.media_content
        for media in media_content:
            if ('medium' in media and (media['medium'].startswith('image'))):
                images.append(media['url'])
            else: 
                pass
        return images
    elif (hasattr(item, 'enclosures') and len(item.enclosures) > 0):
        image = item.enclosures[0]
        if ('type' in image and image['type'].startswith("image")):
            images.append(image['url'])
            return images
    return []

def get_articles(client, days_back=10):
    """

    Gets articles from the past `days_back` to now from MongoDB

    `client` : A `MongoClient` object that has been instantiated.

    `days_back` :
        This parameter defines how many days back to search in the DB. This is 7 by default.

    Returns:
        A List of articles as triplets (_id, description, publish_date)
    """
    coll = client['NewsAggregator'].news_stories
    items = []

    for item in coll.find(
        {"publish_date": {"$gte": datetime.utcnow() - timedelta(days=days_back) } }, { "similar_articles": 0 }):
        # Add the item to the dictionary
        if ('description' not in item):
            print(item)
        else:
            items.append(item)
    return items


# Parse the feed
def parse_feed(source_name, feed_info, text, results, givenTags, idx):
    try:
        feed = feedparser.parse(text)
        stories = []
        
        for item in feed['entries']:
            # only parse if the item has a publish date
            if ('published' in item and 'description' in item):
                # remove the html tags from the description
                # this description is used in the UI, so keep case and special characters in it.
                desc = TextProcessor.remove_html(item['description'])                    
                tags = []
                if (feed_info['hasTags']):
                    politics = False
                    for tag in item.get('tags', []):
                        if ('term' in tag and tag is not None and tag.term.lower() == 'politics'):
                            politics = True
                        tags.append(tag.term)
                    # If we did not find a politics tag, then this article
                    # is not about politics and we should not process it.
                    if (not politics):
                        continue
                    givenTags[idx].extend(tags)
                
                # only add if we have a news story with a description
                if (len(desc) > 10):
                    stories.append(
                        {
                            'source_name': source_name, 
                            'title': item['title'], 
                            'description': desc,
                            'rss_link': item['link'], 
                            'orig_link': item['id'] if 'id' in item else None,
                            'category': feed_info['category'],
                            'publish_date': parser.parse(item['published']),
                            'images': getArticleImages(item),
                            'tags': tags,
                            'bias': feed_info['bias']
                        }
                    )
                    
    except Exception as error:
        logger.exception('Exception while parsing feeds')
        results[idx] = []
    
    results[idx] = stories

def get_article(client, title, description, source):
    """

    Retrieves an article from the DB if it exists.
    """
    return client['NewsAggregator'].news_stories.find({
        "title": title,
        "description": description,
        "source_name": source
    }, {"similar_articles": 1}).limit(1)


# Gets tags for articles which are not given tags by the source
def getArticleTags(hasTags, title, description, tags):
    if (hasTags):
        return None

    newTags = []
    for tag in tags:
        if tag in title + ' ' + description:
            newTags.append(tag)
    return newTags


# Opens the mongoDB client connection
def openMongoClient():
    with open("config.json", "r") as conn:
        config = json.load(conn)
        try:
            user = urllib.parse.quote(config['readWrite']['user'])
            pwd = urllib.parse.quote(config['readWrite']['password'])
            return MongoClient("mongodb+srv://{}:{}@newsaggregator-0ys1l.mongodb.net/test?retryWrites=true&w=majority".format(user, pwd))
        except Exception as e:
            logger.exception("MongoDB Connection")
            exit()


# combines the new and old articles together for text processing
def combine_old_and_new_articles(old_articles, new_articles):
    new_articles = list(itertools.chain.from_iterable(new_articles))
    old_article_descs = set(map(lambda a: a['title'] + ' ' + a['description'], old_articles))
    return_articles = old_articles
    # If new article does not exist in old articles, then add it
    for art in new_articles:
        if art['title'] + ' ' + art['description'] not in old_article_descs:
            return_articles.append(art)

    return return_articles
def main():
    feeds = []

    with open("./rss_feed_config.json", "r") as rss_feeds:
        data = json.load(rss_feeds)
        # for each source in the data sources
        for source in data["sources"]:
            source_name = source["source"]
            # for each feed in the source
            for feed in source["feeds"]:
                # If feed category exists in the constant CATEGORIES list, then get the RSS feed
                if (CATEGORIES.__contains__(feed["category"])):
                    feeds.append((source_name, feed))
    
    # Concurrently send the HTTP requests
    # Set Mozilla User agent to avoid 403 errors
    reqs = [grequests.get(feed[1]['url'], headers={'User-Agent': 'Mozilla/5.0'}) for feed in feeds]
    resps = grequests.map(reqs)

    # Generate the results array
    results = [[] for x in feeds]

    # Generate the tags array
    source_tags = [[] for x in feeds]

    # array to store the threads
    threads = []
    # Create a thread for each feed and start parsing
    for i in range(len(feeds)):
        if (resps[i].ok):
            process = Thread(target=parse_feed, args=[feeds[i][0], feeds[i][1], resps[i].text, results, source_tags, i])
            process.start()
            threads.append(process)
        else:
            logger.warning("Status code {}: {} | {}".format(resps[i].status_code, feeds[i][0], resps[i].text))

    # Now wait for the processes to finish before uploading to db
    for process in threads:
        process.join()

    # combine list of lists into one list. 
    # For each source in source_tags, and for each tag in that source, return the tag

    tags = set(itertools.chain.from_iterable(source_tags))

    client = openMongoClient()
    
    db = client['NewsAggregator']
    sourceIdx = 0
    for source in results:
        for story in source:
            newTags = getArticleTags(feeds[sourceIdx][1]['hasTags'], story['title'], story['description'], tags)
            if newTags is not None:
                story['tags'] = newTags

            resp = db.news_stories.find_one_and_update({ "title": story['title'], "description": story["description"], "source_name": story["source_name"] }, 
                { 
                    "$set": {
                        'title': story['title'],
                        'description': story['description'],
                        'source_name': story['source_name'],
                        'category': story['category'],
                        'rss_link': story['rss_link'],
                        'orig_link': story['orig_link'],
                        'publish_date': story['publish_date'],
                        'images': story['images'],
                        'tags': story['tags'],
                        'bias': story['bias']
                    } 
                }, 
                upsert=True,
                return_document=ReturnDocument.AFTER,
                projection={'_id': True}
            )
            story['_id'] = resp['_id']
        sourceIdx += 1
    
    articles = get_articles(client)
    new_articles = combine_old_and_new_articles(articles, results)
    #instantiate our text processor class
    tp = TextProcessor(new_articles)

    # Loop through the results, and upload each story
    ops = []
    insertQty = 0
    sourceIdx = 0
    for source in results:
        for story in source:
            if ("similar_articles" not in source or (len(source["similar_articles"]) > 0 and source["similar_articles"][0]["similarity_score"] < REJECT_SIMILARITY)):
                similar_articles = tp.get_similar_articles(story, new_articles, publish_date=story['publish_date'])
                if ("similar_articles" in source):
                    similar_articles.extend(source["similar_articles"])
                    similar_articles = sorted(similar_articles, key=lambda article: article["similarity_score"], reverse=True)[:5]

                ops.append(
                    UpdateOne({ "_id": story['_id'] }, 
                        { 
                            "$set": {
                                'similar_articles': similar_articles,
                            } 
                        }, 
                        upsert=False
                    )
                )
            if ( len(ops) == 1000):
                try:
                    response = db.news_stories.bulk_write(ops, ordered=False)
                    insertQty += response.upserted_count
                    ops = []
                except Exception as e:
                    logger.error(e)
        sourceIdx += 1
    if (len(ops) > 0):
        try:
            response = db.news_stories.bulk_write(ops, ordered=False)
            insertQty += response.upserted_count
        except Exception as e:
            logger.error(e)
    print("Inserted {} articles".format(insertQty))
    logger.info("Inserted {} articles".format(insertQty))

def lambda_handler(event, context):
    main()
    return {
        "statusCode": 200,
        "body": json.dumps("Finished Successfully")
    }
if __name__ == "__main__":
    main()          
