import feedparser
import json
import hashlib
import boto3

CATEGORIES = ["politics"]        

dynamodb = boto3.resource('dynamodb')

def generate_hash(source, title, published):
    combined_str = "{}{}{}".format(source, title, published)
    hash_object = hashlib.sha512(combined_str.encode())
    hex_digest = hash_object.hexdigest()
    return hex_digest

def parse_feed(source_name, feed_info):
    try:
        feed = feedparser.parse(feed_info["url"])
        stories = []

        for item in feed['entries']:
            if ('published' in item):
                stories.append(
                    {
                        'source': source_name, 
                        'title': item['title'], 
                        'description': item['description'], 
                        'link': item['link'], 
                        'orig_link': item['id'],
                        'publish_date': item['published'],
                        'article_id': generate_hash(source_name, item['title'], item['published'])
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

    with table.batch_writer() as batch:
        
        for story in data_to_push:
            batch.put_item(
                Item={
                    'article_id': story['article_id'],
                    'source': story['source'], 
                    'title': story['title'], 
                    'description': story['description'], 
                    'link': story['link'],
                    'orig_link': story['orig_link'], 
                    'publish_date': story['publish_date']
                }
            )

if __name__ == "__main__":
    main()          