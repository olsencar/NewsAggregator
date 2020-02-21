#!/usr/bin/python3
from gevent import monkey
monkey.patch_all(select=False, thread=False)
import feedparser
import json
import hashlib
from pymongo import MongoClient, UpdateOne
import grequests
from threading import Thread
import os
import boto3
from base64 import b64decode
import logging
import urllib
from dateutil import parser
from text_processor.TextProcessor import TextProcessor
from datetime import datetime, timedelta
from sys import platform
import itertools

logger = logging.getLogger("rss_feed_reader")
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
            if ('published' in item):
                # remove the html tags from the description
                # this description is used in the UI, so keep case and special characters in it.
                desc = TextProcessor.remove_html(item['description'])                    
                tags = []
                if (feed_info['hasTags']):
                    politics = False
                    for tag in item.get('tags', []):
                        if (tag.term.lower() == 'politics'):
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
                            'source': source_name, 
                            'title': item['title'], 
                            'description': desc,
                            'link': item['link'], 
                            'orig_link': item['id'],
                            'category': feed_info['category'],
                            'publish_date': parser.parse(item['published']),
                            'images': getArticleImages(item),
                            'tags': tags,
                            'bias': feed_info['bias']
                        }
                    )
                    
    except Exception as error:
        logger.error(error.with_traceback())
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
    # decrypted_user = boto3.client('kms').decrypt(CiphertextBlob=b64decode(os.environ['user']))['Plaintext']
    # decrypted_pw = boto3.client('kms').decrypt(CiphertextBlob=b64decode(os.environ['password']))['Plaintext']
    # user = urllib.parse.quote(decrypted_user)
    # pwd = urllib.parse.quote(decrypted_pw)
    # return MongoClient("mongodb+srv://{}:{}@newsaggregator-0ys1l.mongodb.net/test?retryWrites=true&w=majority".format(user, pwd))
    with open("connectionDetails.json", "r") as conn:
        config = json.load(conn)
        user = urllib.parse.quote(config['user'])
        pwd = urllib.parse.quote(config['password'])
        return MongoClient("mongodb+srv://{}:{}@newsaggregator-0ys1l.mongodb.net/test?retryWrites=true&w=majority".format(user, pwd))


# combines the new and old articles together for text processing
def combine_old_and_new_articles(old_articles, new_articles):
    new_articles = list(itertools.chain.from_iterable(new_articles))
    old_article_descs = set(map(lambda a: a['description'], old_articles))
    return_articles = old_articles
    # If new article does not exist in old articles, then add it
    for art in new_articles:
        if art['description'] not in old_article_descs:
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
            resp = get_article(client, story['title'], story['description'], story['source'])
            item = None
            for i in resp:
                item = i
            
            newTags = getArticleTags(feeds[sourceIdx][1]['hasTags'], story['title'], story['description'], tags)
            if newTags is not None:
                story['tags'] = newTags
            # If the item does not exist in the DB or its similar articles list has 2 or less items
            #   then update/insert the item in the DB
            
            if ( item is None or "similar_articles" not in item or (len(item["similar_articles"]) > 0 and item["similar_articles"][0]["similarity_score"] < REJECT_SIMILARITY)):
                similar_articles = tp.get_similar_articles(story, new_articles, publish_date=story['publish_date'])
                if (item is not None and "similar_articles" in item):
                    similar_articles.extend(item["similar_articles"])
                    similar_articles = sorted(similar_articles, key=lambda article: article["similarity_score"], reverse=True)[:5]

                ops.append(
                    UpdateOne({ "title": story['title'], "description": story["description"], "source_name": story["source"] }, 
                        { 
                            "$set": {
                                'title': story['title'],
                                'description': story['description'],
                                'source_name': story['source'],
                                'category': story['category'],
                                'rss_link': story['link'],
                                'orig_link': story['orig_link'],
                                'publish_date': story['publish_date'],
                                'similar_articles': similar_articles,
                                'images': story['images'],
                                'tags': story['tags'],
                                'bias': story['bias']
                            } 
                        }, 
                        upsert=True
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
