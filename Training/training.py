import pandas as pd
import nltk
# Uncomment the below lines if you get an error about downloading the packages
# nltk.download('punkt')
# nltk.download('wordnet')
# nltk.download('averaged_perceptron_tagger')
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
import time
from multiprocessing import Pool
from multiprocessing import cpu_count

special_chars = re.compile(r"[^a-z ]+")

logging.basicConfig(level=logging.INFO)
# stopwords = nltk.download('stopwords')
stopword_set = set(stopwords.words('english'))

# pre process the text to remove unnecessary characters and words
def pre_process(text):
    # remove html tags
    text = remove_html(text)
    #remove special characters
    text = text.lower()
    text = special_chars.sub("", text)
    text = re.sub(r"\s{2,}", " ", text)
    text = text.rstrip()

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
            yield gensim.models.doc2vec.TaggedDocument(doc, [self.labels_list[idx]])

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
            rows.append([doc['_id'], doc['description']])
        writer = csv.writer(docs)
        writer.writerows(rows)

def pre_process_docs(idx, row):
    lemmatizer = WordNetLemmatizer()
    text = pre_process(row[1])
    words = [lemmatizer.lemmatize(word, get_wordnet_pos(word)) for word in nltk.word_tokenize(text)]
    words = list(set(words).difference(stopword_set))
    return words

def main():            
    docLabels = []
    # colNames = ["Column1","article_id","category","description","link","orig_link","publish_date","source_name","title"]
    get_all_docs()

    # Read from training docs
    nrows = 80000
    print("Reading {} rows from training set...".format(nrows))
    docs = pd.read_csv(filepath_or_buffer="docs.csv", delimiter=",", skipinitialspace=True,usecols=[0, 1], nrows=nrows, header=None)
    print("Done reading rows")
    print("First row:")
    print(docs.loc[0,:])
    # set the labels for the documents
    docLabels = [row[0] for idx, row in docs.iterrows()]

    data = []
    cores_used = 1
    if (cpu_count() > 12):
        cores_used = 10
    elif (cpu_count() > 8):
        cores_used = 6
    elif (cpu_count() > 1):
        cores_used = cpu_count() - 1
    
    print("Pre-processing the data using {} cores".format(cores_used))
    start = time.time()
    with Pool(processes=cores_used) as pool:
        data = pool.starmap(pre_process_docs, docs.iterrows())
    stop = time.time()

    #statistics on time spent
    print("\nTook {} seconds to finish pre-processing".format(stop - start))
    it = LabeledLineSentence(data, docLabels)

    model = gensim.models.Doc2Vec(min_count=1,workers=cores_used)
    print("Building the vocabulary")
    start = time.time()
    model.build_vocab(it)
    stop = time.time()
    print("Took {} seconds to build the vocab".format(stop - start))

    print("Training the model")
    model.train(it, total_examples=model.corpus_count, epochs=15)

    print("Saving model")
    model.save("doc2vec.model")

if __name__ == "__main__":
    main()

