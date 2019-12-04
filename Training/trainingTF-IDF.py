import gensim
from gensim.similarities import Similarity
from gensim.corpora import Dictionary
from gensim.models import TfidfModel
import nltk
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer
import urllib.parse
import json
from pymongo import MongoClient
import re
import os.path
import csv
from datetime import datetime, timedelta

INDEX_FILE_NAME = "/tmp/index.index"
special_chars = re.compile(r"[^a-z ]+")
lemmatizer = WordNetLemmatizer()
# stopwords = nltk.download('stopwords')
stopword_set = set(stopwords.words('english'))
def get_wordnet_pos(word):
    """Map POS tag to first character lemmatize() accepts"""
    tag = nltk.pos_tag([word])[0][1][0].upper()
    tag_dict = {"J": wordnet.ADJ,
                "N": wordnet.NOUN,
                "V": wordnet.VERB,
                "R": wordnet.ADV}

    return tag_dict.get(tag, wordnet.NOUN)
# pre process the text to remove unnecessary characters and words
def pre_process(text):
    # remove html tags
    # text = remove_html(text)
    #remove special characters
    text = text.lower()
    text = special_chars.sub("", text)
    text = re.sub(r"\s{2,}", " ", text)
    text = text.rstrip()

    return text

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

def main():
    client = openMongoClient()
    coll = client['NewsAggregator'].news_stories
    items = []
    
    for item in coll.find({ "publish_date": { "$gte": datetime.utcnow() - timedelta(days=10) } }, { "description": 1, "publish_date": 1 }):
        # Add the item to the dictionary
        items.append((item['_id'], item['description'], item['publish_date']))

    docs = [[lemmatizer.lemmatize(w, get_wordnet_pos(w)) for w in nltk.word_tokenize(pre_process(text)) if w not in stopword_set]
                for article_id, text, date in items]


    dictionary = Dictionary(docs)
    corpus = [dictionary.doc2bow(doc) for doc in docs]
    tf_idf = gensim.models.TfidfModel(corpus)
    sims = gensim.similarities.Similarity(INDEX_FILE_NAME, corpus,num_features=len(dictionary))
    

    testStr = input("What sentence would you like to test against? ")
    testStr = pre_process(testStr)
    query_doc = [lemmatizer.lemmatize(w, get_wordnet_pos(w)) for w in nltk.word_tokenize(testStr) if w not in stopword_set]
    query_doc_bow = dictionary.doc2bow(query_doc)
    query_doc_tf_idf = tf_idf[query_doc_bow]
    sim = sims[query_doc_tf_idf]

    for i in range(len(sim)):
        if (sim[i] > 0.00):
            datediff = (datetime.utcnow() - items[i][2]).days
            sim[i] = sim[i] - pow((datediff * .05), 3)


    simListSorted = sorted(enumerate(sim), key=lambda item: -item[1])
    print("\nSIMILAR STORIES\n")
    for i in range(10):
        print("DESC: {}".format(items[simListSorted[i][0]][1]))
        print("PUBLISHED: {}".format(items[simListSorted[i][0]][2]))
        print("SCORE: {}\n".format(simListSorted[i][1]))
if __name__ == "__main__":
    main()