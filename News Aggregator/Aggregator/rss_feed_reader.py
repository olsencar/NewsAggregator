import feedparser
import json
import csv

CATEGORIES = ["politics"]        

# Checks to see if list contains value
def contains(list, val):
    for item in list:
        if (item == val):
            return True
    return False

def parse_feed(source_name, feed_info):
    try:
        feed = feedparser.parse(feed_info["url"])

        with open('./stories.csv', 'a', newline='') as stories:
            for item in feed.entries:
                writer = csv.writer(stories, delimiter='|', quotechar='"', quoting=csv.QUOTE_MINIMAL)
                writer.writerow([source_name, item['title'], item['description'], item['link'], item['published']])

    except Exception as error:
        print(error)
        return


def main():
    with open("./rss_feed_config.json", "r") as rss_feeds:
        data = json.load(rss_feeds)
        
        # for each source in the data sources
        for source in data["sources"]:
            source_name = source["source"]
            for feed in source["feeds"]:
                # If feed category exists in the constant CATEGORIES list, then get the RSS feed
                if (contains(CATEGORIES, feed['category'])):
                    parse_feed(source_name, feed)

if __name__ == "__main__":
    main()          