import feedparser
import json
import hashlib
import boto3
from rake_nltk import Rake
from decimal import Decimal
import re
import requests
from lxml.html import parse


CATEGORIES = ["politics"]        

# Start DynamoDB resource
dynamodb = boto3.resource('dynamodb')

# Removes html from the description
# Used in keyword searching so it doesn't look inside HTML
def remove_html(text):
    return re.search(r"([^<]+)", text).group(1)

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

        for item in feed['entries']:
            if ('published' in item):
                rake = Rake() # start nlp 
                desc = remove_html(item['description'])
                rake.extract_keywords_from_text(desc)
                
                keywords = []
                for kw in rake.get_ranked_phrases_with_scores():
                    keywords.append(
                        {
                            'keyword': kw[1],
                            'score': Decimal(str(kw[0]))
                        }
                    )
                stories.append(
                    {
                        'source': source_name, 
                        'title': item['title'], 
                        'description': desc,
                        'link': item['link'], 
                        'orig_link': item['id'],
                        'keywords': keywords,
                        'publish_date': item['published'],
                        'article_id': generate_hash(source_name, item['title'], item['link'])
                    }
                )
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