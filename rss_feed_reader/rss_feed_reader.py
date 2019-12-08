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
# from sklearn.feature_extraction.text import CountVectorizer
# from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
# from sklearn.feature_extraction.text import TfidfTransformer
import logging
import urllib
from dateutil import parser
from text_processing import pre_process, remove_html, get_similar_articles, articles_to_docs, create_corpus, create_dictionary
from gensim.similarities import Similarity
from gensim.models import TfidfModel
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
# ** Credit to https://www.freecodecamp.org/news/how-to-extract-keywords-from-text-with-tf-idf-and-pythons-scikit-learn-b2a0f3d7e667/
# ** for the code and explanation of how to implement this

# generate the tf_idf for all of the documents
# returns the transformer, feature names and the count vectorizer
# def generate_tf_idf(docs):
#     cv = CountVectorizer(max_df=0.85, stop_words=ENGLISH_STOP_WORDS, max_features=10000)
#     word_count_vector = cv.fit_transform(docs)
#     transformer = TfidfTransformer(smooth_idf=True, use_idf=True)
#     transformer.fit(word_count_vector)
#     feature_names = cv.get_feature_names()

#     return (transformer, feature_names, cv)

# Sorts a coo matrix based on the score it received    
# def sort_coo(coo_matrix):
#     tuples = zip(coo_matrix.col, coo_matrix.data)
#     return sorted(tuples, key=lambda x: (x[1], x[0]), reverse=True)

# # Extracts the top (n) keywords from a list of keywords
# def extract_topn_from_vector(feature_names, sorted_items, topn=10):
#     sorted_items = sorted_items[:topn]

#     scores = []
#     feature_vals = []

#     for idx, score in sorted_items:
#         # Keep track of feature name and its corresponding score
#         scores.append(round(score, 3))
#         feature_vals.append(feature_names[idx])

#     #create a tuples of feature,score
#     #results = zip(feature_vals,score_vals)
#     results= {}
#     for idx in range(len(feature_vals)):
#         results[feature_vals[idx]]=scores[idx]
    
#     return results

# # Returns a list of keywords for a specific document
# def get_keywords(cv, transformer, feature_names, text):
#     # generate tf_idf for the text
#     tf_idf_vector = transformer.transform(cv.transform([text]))

#     # sort the tf_idf vectors by desc order of scores
#     sorted_items = sort_coo(tf_idf_vector.tocoo())

#     # extract only the top 10
#     keywords = extract_topn_from_vector(feature_names, sorted_items, 15)

#     # Convert keywords array into something useful in DynamoDB
#     kw_obj_arr = []
#     for k in keywords:
#         kw_obj_arr.append(
#             {
#                 'keyword': k,
#                 'score': Decimal(keywords[k]).__round__(3)
#             }
#         )

#     return kw_obj_arr

# Generates the 512 character source, title and url

def generate_hash(source, title, url):
    combined_str = "{}{}{}".format(source, title, url)
    hash_object = hashlib.sha512(combined_str.encode())
    hex_digest = hash_object.hexdigest()
    
    return hex_digest

#returns an array of image urls
def getArticleImages(item):
    images = []
    if (hasattr(item, 'media_content')):
        media_content = item.media_content
        for media in media_content:
            if ('medium' in media  and media['medium'] == 'image'):
                images.append(media['url'])
            else: 
                pass
        return images
    return []

def get_articles(client, days_back=7):
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
    
    for item in coll.find({ "publish_date": { "$gte": datetime.utcnow() - timedelta(days=10) } }, { "description": 1, "publish_date": 1 }):
        # Add the item to the dictionary
        items.append((item['_id'], item['description'], item['publish_date']))
    
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
                # pre process the description to remove unnecessary characters
                # desc_for_kw_processing = pre_process(item['description'])

                # remove the html tags from the description
                # this description is used in the UI, so keep case and special characters in it.
                desc = remove_html(item['description'])

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
                            'article_id': generate_hash(source_name, item['title'], item['link']),
                            'images': getArticleImages(item),
                            'bias': feed_info['bias']
                        }
                    )
                    
                    # docs.append(desc_for_kw_processing)
        
        # (transformer, feature_names, cv) = generate_tf_idf(docs)
        # for story in stories:
        #     story['keywords_w_scores'] = get_keywords(cv, transformer, feature_names, story['description'])
        #     for kw in story['keywords_w_scores']:
        #         story['keywords'].append(kw['keyword'])

    except Exception as error:
        logger.error(error.with_traceback())
        results[idx] = []
    
    results[idx] = stories

def get_article(client, article_id):
    """

    Retrieves an article from the DB if it exists.
    """
    return client['NewsAggregator'].news_stories.find({"_id": article_id}, {"similar_articles": 1}).limit(1)

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
            resp = get_article(client, story['article_id'])
            item = None
            for i in resp:
                item = i

            # If the item does not exist in the DB or its similar articles list has 2 or less items
            #   then update/insert the item in the DB
            
            if ( item is None or "similar_articles" not in item or (len(item["similar_articles"]) < 3)):
                similar_articles = get_similar_articles(
                    pre_process(story['description']),
                    similarity_matrix,
                    tf_idf,
                    dictionary,
                    articles, 
                    publish_date=story["publish_date"],
                    topn=5
                )
                ops.append(
                    UpdateOne({"_id": story['article_id']}, 
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
