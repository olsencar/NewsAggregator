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
from text_processing import pre_process, remove_html, get_similar_articles, articles_to_docs, create_corpus, create_dictionary
from gensim.similarities import Similarity
from gensim.models import TfidfModel
from gensim.summarization import keywords
from datetime import datetime, timedelta
from sys import platform

logger = logging.getLogger()
logger.setLevel(logging.INFO)
CATEGORIES = ["politics"]

# If we are running this on AWS, we want to write to /tmp/
if platform.startswith("linux"):
    INDEX_FILE_NAME = "/tmp/temp.index" 
else:
    INDEX_FILE_NAME = "./temp.index"        

#****************************************************
# EXTRACTION OF KEYWORDS
#****************************************************

# Returns a list of keywords for a specific document
def get_keywords(text):
    return keywords(text, split=True)

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
    
    for item in coll.find({ "publish_date": { "$gte": datetime.utcnow() - timedelta(days=days_back) } }, { "similar_articles": 0 }):
        # Add the item to the dictionary
        if ('description' not in item):
            print(item)
        else:
            items.append(item)
    
    return items

# Parse the feed 
def parse_feed(source_name, feed_info, text, results, idx):
    try:
        feed = feedparser.parse(text)
        stories = []

        docs = []
        for item in feed['entries']:
            # only parse if the item has a publish date
            if ('published' in item):
                # remove the html tags from the description
                # this description is used in the UI, so keep case and special characters in it.
                desc = remove_html(item['description'])                    
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
                else:
                     # pre process the description to remove unnecessary characters
                    desc_for_kw_processing = pre_process(item['description'], True)
                    tags = get_keywords(desc_for_kw_processing)

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
                    
                    docs.append(desc_for_kw_processing)
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

# Opens the mongoDB client connection
def openMongoClient():
    decrypted_user = boto3.client('kms').decrypt(CiphertextBlob=b64decode(os.environ['user']))['Plaintext']
    decrypted_pw = boto3.client('kms').decrypt(CiphertextBlob=b64decode(os.environ['password']))['Plaintext']
    user = urllib.parse.quote(decrypted_user)
    pwd = urllib.parse.quote(decrypted_pw)
    return MongoClient("mongodb+srv://{}:{}@newsaggregator-0ys1l.mongodb.net/test?retryWrites=true&w=majority".format(user, pwd))

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

    # array to store the threads
    threads = []
    # Create a thread for each feed and start parsing
    for i in range(len(feeds)):
        if (resps[i].ok):
            process = Thread(target=parse_feed, args=[feeds[i][0], feeds[i][1], resps[i].text, results, i])
            process.start()
            threads.append(process)
        else:
            logger.warning("Status code {}: {} | {}".format(resps[i].status_code, feeds[i][0], resps[i].text))

    # Now wait for the processes to finish before uploading to db
    for process in threads:
        process.join()

    client = openMongoClient()
    
    db = client['NewsAggregator']
    
    # Generate the similarity matrix index
    articles = get_articles(client)
    docs = articles_to_docs(articles)
    dictionary = create_dictionary(docs)
    corpus = create_corpus(dictionary, docs)
    tf_idf = TfidfModel(corpus)
    similarity_matrix = Similarity(INDEX_FILE_NAME, corpus, num_features=len(dictionary))

    # Loop through the results, and upload each story
    ops = []
    insertQty = 0
    for source in results:
        for story in source:
            resp = get_article(client, story['title'], story['description'], story['source'])
            item = None
            for i in resp:
                item = i

            # If the item does not exist in the DB or its similar articles list has 2 or less items
            #   then update/insert the item in the DB
            
            if ( item is None or "similar_articles" not in item or item["similar_articles"][0]["similarity_score"] < 0.2):
                similar_articles = get_similar_articles(
                    pre_process(story['description']),
                    similarity_matrix,
                    tf_idf,
                    dictionary,
                    articles, 
                    publish_date=story["publish_date"],
                    topn=5
                )
                if ("similar_articles" in item):
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
