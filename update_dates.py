from pymongo import MongoClient, UpdateOne
from datetime import datetime
import urllib.parse
import json

def openMongoClient():
    with open("connectionDetails.json", "r") as conn:
        config = json.load(conn)
        user = urllib.parse.quote(config['user'])
        pwd = urllib.parse.quote(config['password'])
        return MongoClient("mongodb+srv://{}:{}@newsaggregator-0ys1l.mongodb.net/test?retryWrites=true&w=majority".format(user, pwd))

def main():
    client = openMongoClient()
    coll = client['NewsAggregator'].news_stories
    arr = []
    bulk = coll.initialize_unordered_bulk_op()

    for item in coll.find({}):
        date = item['publish_date']
        real_date = None
        try:
            real_date = datetime.strptime(date, "%a, %d %b %Y %H:%M:%S %z")
        except Exception as e:
            real_date = datetime.strptime(date, "%a, %d %b %Y %H:%M:%S %Z")
        
        arr.append((item['_id'], real_date))
    counter = 0
    for (i, j) in arr:
        bulk.find({ '_id': i }).update({"$set": { "publish_date": j}})
        counter += 1

        if (counter == 500):
            bulk.execute()
            bulk = coll.initialize_unordered_bulk_op()
            counter = 0

    if (counter > 0):
        bulk.execute()
if __name__ == "__main__":
    main()