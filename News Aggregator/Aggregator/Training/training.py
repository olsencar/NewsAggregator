import pandas as pd
import nltk
nltk.download('punkt')
nltk.download('wordnet')
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer
import gensim
import re
import logging
from pymongo import MongoClient
import json
import csv
import urllib.parse
import pprint

logging.basicConfig(level=logging.INFO)
lemmatizer = WordNetLemmatizer()
# stopwords = nltk.download('stopwords')
stopword_set = set(stopwords.words('english'))
# pre process the text to remove unnecessary characters and words
def pre_process(text):
    # remove html tags
    text = remove_html(text)

    #remove special characters
    text = re.sub("(\\d)+"," ",text)

    text = re.sub(r"[^A-Za-z0-9(),!.?\'`]", " ", text )
    text = re.sub(r"\'s", " 's ", text )
    text = re.sub(r"\'ve", " 've ", text )
    text = re.sub(r"n\'t", " 't ", text )
    text = re.sub(r"\'re", " 're ", text )
    text = re.sub(r"\'d", " 'd ", text )
    text = re.sub(r"\'ll", " 'll ", text )
    text = re.sub(r",", " ", text )
    text = re.sub(r"\.", " ", text )
    text = re.sub(r"!", " ", text )
    text = re.sub(r"\(", " ( ", text )
    text = re.sub(r"\)", " ) ", text )
    text = re.sub(r"\?", " ", text )
    text = re.sub(r"\s{2,}", " ", text )

    # convert to lowercase
    text = text.lower()
    return text

# Removes html from the description
# Used in keyword searching so it doesn't look inside HTML
def remove_html(text):
    tmp = re.sub("<[^>]*>", "", text)
    tmp = re.sub(r"[\(\n)+\(\t)+]+", "", tmp)
    return tmp

class LabeledLineSentence(object):
    def __init__(self, doc_list, labels_list):
        self.labels_list = labels_list
        self.doc_list = doc_list
    def __iter__(self):
        for idx, doc in enumerate(self.doc_list):
            yield gensim.models.doc2vec.LabeledSentence(doc, [self.labels_list[idx]])

def get_wordnet_pos(word):
    """Map POS tag to first character lemmatize() accepts"""
    tag = nltk.pos_tag([word])[0][1][0].upper()
    tag_dict = {"J": wordnet.ADJ,
                "N": wordnet.NOUN,
                "V": wordnet.VERB,
                "R": wordnet.ADV}

    return tag_dict.get(tag, wordnet.NOUN)

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


#retrieves all documents from dynamodb
def get_all_docs():
    # Start DynamoDB resource
    client = openMongoClient()
    db = client['NewsAggregator']
    collection = db.news_stories

    with open("docs.csv", "a", encoding="utf8", newline="") as docs:
        rows = []
        for doc in collection.find({}):
            rows.append([doc['_id'], doc['source_name'], doc['title'], doc['description'], doc['rss_link'], doc['orig_link'], doc['publish_date']])
        writer = csv.writer(docs)
        writer.writerows(rows)

def main():            
    docLabels = []
    # colNames = ["Column1","article_id","category","description","link","orig_link","publish_date","source_name","title"]
    get_all_docs()
    docs = pd.read_csv(filepath_or_buffer="docs.csv", delimiter=",", skipinitialspace=True, usecols=["article_id", "description"])

    docLabels = [row[0] for idx, row in docs.iterrows()]

    data = []
    for idx, row in docs.iterrows():
        if (idx != 0):
            text = pre_process(row[1])
            words = [lemmatizer.lemmatize(word, get_wordnet_pos(word)) for word in nltk.word_tokenize(text)]
            words = list(set(words).difference(stopword_set))
            data.append(words)

    it = LabeledLineSentence(data, docLabels)

    model = gensim.models.Doc2Vec(min_count=1)
    model.build_vocab(it)
    # model.build_vocab(it)

    model.train(it, total_examples=model.corpus_count, epochs=15)

    model.save("doc2vec.model")


if __name__ == "__main__":
    main()

