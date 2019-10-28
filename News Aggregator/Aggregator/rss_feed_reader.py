import feedparser
import json
import hashlib
import boto3
from rake_nltk import Rake
from decimal import Decimal
import re
import requests
from lxml.html import parse
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from sklearn.feature_extraction.text import TfidfTransformer

CATEGORIES = ["politics"]        

# Start DynamoDB resource
dynamodb = boto3.resource('dynamodb')

#****************************************************
# EXTRACTION OF KEYWORDS
#****************************************************
# ** Credit to https://www.freecodecamp.org/news/how-to-extract-keywords-from-text-with-tf-idf-and-pythons-scikit-learn-b2a0f3d7e667/
# ** for the code and explanation of how to implement this

# pre process the text to remove unnecessary characters and words
def pre_process(text):
    # remove html tags
    text = remove_html(text)

    #remove special characters
    text = re.sub("(\\d)+"," ",text)

    # convert to lowercase
    text = text.lower()
    return text

# Removes html from the description
# Used in keyword searching so it doesn't look inside HTML
def remove_html(text):
    tmp = re.sub("<[^>]*>", "", text)
    tmp = re.sub(r"[\(\n)+\(\t)+]+", "", tmp)
    return tmp

# generate the tf_idf for all of the documents
# returns the transformer, feature names and the count vectorizer
def generate_tf_idf(docs):
    cv = CountVectorizer(max_df=0.85, stop_words=ENGLISH_STOP_WORDS, max_features=10000)
    word_count_vector = cv.fit_transform(docs)
    transformer = TfidfTransformer(smooth_idf=True, use_idf=True)
    transformer.fit(word_count_vector)
    feature_names = cv.get_feature_names()

    return (transformer, feature_names, cv)

# Sorts a coo matrix based on the score it received    
def sort_coo(coo_matrix):
    tuples = zip(coo_matrix.col, coo_matrix.data)
    return sorted(tuples, key=lambda x: (x[1], x[0]), reverse=True)

# Extracts the top (n) keywords from a list of keywords
def extract_topn_from_vector(feature_names, sorted_items, topn=10):
    sorted_items = sorted_items[:topn]

    scores = []
    feature_vals = []

    for idx, score in sorted_items:
        # Keep track of feature name and its corresponding score
        scores.append(round(score, 3))
        feature_vals.append(feature_names[idx])

    #create a tuples of feature,score
    #results = zip(feature_vals,score_vals)
    results= {}
    for idx in range(len(feature_vals)):
        results[feature_vals[idx]]=scores[idx]
    
    return results

# Returns a list of keywords for a specific document
def get_keywords(cv, transformer, feature_names, text):
    # generate tf_idf for the text
    tf_idf_vector = transformer.transform(cv.transform([text]))

    # sort the tf_idf vectors by desc order of scores
    sorted_items = sort_coo(tf_idf_vector.tocoo())

    # extract only the top 10
    keywords = extract_topn_from_vector(feature_names, sorted_items, 15)

    # Convert keywords array into something useful in DynamoDB
    kw_obj_arr = []
    for k in keywords:
        kw_obj_arr.append(
            {
                'keyword': k,
                'score': Decimal(keywords[k]).__round__(3)
            }
        )

    return kw_obj_arr

# Generates the 512 character source, title and url
def generate_hash(source, title, url):
    combined_str = "{}{}{}".format(source, title, url)
    hash_object = hashlib.sha512(combined_str.encode())
    hex_digest = hash_object.hexdigest()
    return hex_digest

def parse_feed(source_name, feed_info):
    try:
        feed = feedparser.parse(feed_info["url"])
        stories = []

        docs = []
        for item in feed['entries']:
            # only parse if the item has a publish date
            if ('published' in item):
                # pre process the description to remove unnecessary characters
                desc_for_kw_processing = pre_process(item['description'])

                # remove the html tags from the description
                # this description is used in the UI, so keep case and special characters in it.
                desc = remove_html(item['description'])

                stories.append(
                    {
                        'source': source_name, 
                        'title': item['title'], 
                        'description': desc,
                        'link': item['link'], 
                        'orig_link': item['id'],
                        'keywords': [],
                        'publish_date': item['published'],
                        'article_id': generate_hash(source_name, item['title'], item['link'])
                    }
                )
                docs.append(desc_for_kw_processing)
        
        (transformer, feature_names, cv) = generate_tf_idf(docs)
        for story in stories:
            story['keywords'] = get_keywords(cv, transformer, feature_names, story['description'])

    except Exception as error:
        print(error.with_traceback())
        exit()
    return stories


def main():
    data_to_push = []

    with open("./rss_feed_config.json", "r") as rss_feeds:
        data = json.load(rss_feeds)
        # for each source in the data sources
        for source in data["sources"]:
            source_name = source["source"]
            # for each feed in the source
            for feed in source["feeds"]:
                # If feed category exists in the constant CATEGORIES list, then get the RSS feed
                if (CATEGORIES.__contains__(feed["category"])):
                    data_to_push.extend(parse_feed(source_name, feed))

    table = dynamodb.Table('news_stories')

        
    for story in data_to_push:
        # the update_item function performs an upsert if the item does not exist
        table.update_item(
            Key={
                'article_id': story['article_id']
            },
            UpdateExpression="set source_name = :source, title = :title, description = :description, link = :link, keywords = :keywords, orig_link = :orig_link, publish_date = :publish_date",
            ConditionExpression="attribute_not_exists(article_id) OR article_id = :article_id",
            ExpressionAttributeValues={
                ':article_id': story['article_id'],
                ':source': story['source'], 
                ':title': story['title'], 
                ':description': story['description'], 
                ':link': story['link'],
                ':keywords': story['keywords'],
                ':orig_link': story['orig_link'], 
                ':publish_date': story['publish_date']
            }
        )

if __name__ == "__main__":
    main()          