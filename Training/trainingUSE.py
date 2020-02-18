import re
import os, sys
os.environ["TF_CPP_MIN_LOG_LEVEL"] = '1'
import tensorflow as tf
tf.get_logger().setLevel('ERROR')
import tensorflow_hub as hub
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json
import urllib
from pymongo import MongoClient
from datetime import datetime, timedelta

#performs the cosine similarity between two vectors
def cos_sim(vectors):
    return cosine_similarity(vectors)

def get_most_sim(sentence, compare_sentences, sim_matrix, topN=6):
    index = compare_sentences.index(sentence)
    sim_row = np.array(sim_matrix[index, :])
    indices = sim_row.argsort()[-topN:][::-1][1:]
   
    return [{'description': compare_sentences[i], 'similarity_score': sim_row[i]} for i in indices]

# Removes html from the description
# Used in keyword searching so it doesn't look inside HTML
def remove_html(text):
    tmp = re.sub("<[^>]*>", "", text)
    tmp = re.sub(r"[\(\n)+\(\t)+]+", "", tmp)
    return tmp

# Opens the mongoDB client connection
def openMongoClient():
    # connectionDetails.json is formatted as follows:
    # {
    #     "user": <USERNAME>
    #     "password": <PASSWORD>
    # }   
    with open("connectionDetails.json", "r") as conn:
        config = json.load(conn)
        user = urllib.parse.quote(config['user'])
        pwd = urllib.parse.quote(config['password'])
        return MongoClient("mongodb+srv://{}:{}@newsaggregator-0ys1l.mongodb.net/test?retryWrites=true&w=majority".format(user, pwd))


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
        {"publish_date": {"$gte": datetime.utcnow() - timedelta(days=days_back) } }, { "description": 1, 'title': 1, 'publish_date': 1 }
        ).sort('publish_date', -1):
        # Add the item to the dictionary
        if ('description' not in item):
            print(item)
        else:
            items.append(item['title'] + ' ' + item['description'])
    return items

def main():        
    module_url = "https://tfhub.dev/google/universal-sentence-encoder/4"
    embed = hub.load(module_url)
    client = openMongoClient()
    docs = get_articles(client)
    sentences_embeddings = embed(docs)

    sim_matrix = cos_sim(np.array(sentences_embeddings))
    for i in range(50): 
        sentence = docs[i]
        print("======================================================")
        print()
        print("SENTENCE: " + sentence)
        most_sim = get_most_sim(sentence, docs, sim_matrix)
        print("MOST SIMILAR")
        
        for x in range(len(most_sim)):
            print(most_sim[x]['description'])
            print("SCORE: " + str(most_sim[x]['similarity_score']))
            print()

if __name__ == "__main__":
    main()

