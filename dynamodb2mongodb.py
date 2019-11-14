from pymongo import MongoClient
import boto3
import ast
import json
import decimal
import urllib.parse
# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

def openMongoClient():
    with open("connectionDetails.json", "r") as conn:
        config = json.load(conn)
        user = urllib.parse.quote(config['user'])
        pwd = urllib.parse.quote(config['password'])
        return MongoClient("mongodb+srv://{}:{}@newsaggregator-0ys1l.mongodb.net/test?retryWrites=true&w=majority".format(user, pwd))


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('news_stories')

client = openMongoClient()
db = client['NewsAggregator']

response = table.scan()
results = []
results.extend(response['Items'])

while response.get('LastEvaluatedKey', False):
    response = table.scan(ExclusiveStartKey=response.get('LastEvaluatedKey'))
    results.extend(response["Items"])

print("Preparing to insert {} documents".format(len(results)))
print("BEFORE INSERT")
print("\tLength: {}".format(db.news_stories.count_documents({})))
docs = []

for doc in results:    
    docs.append(
       {
            '_id': doc['article_id'],
            'title': doc['title'],
            'description': doc['description'],
            'source_name': doc['source_name'],
            'category': doc['category'],
            'rss_link': doc['link'],
            'orig_link': doc['orig_link'],
            'publish_date': doc['publish_date']
       } 
    )

db.news_stories.insert_many(docs)
print("AFTER INSERT")
print("\tLength: {}".format(db.news_stories.count_documents({})))
