import gensim
from gensim.similarities import Similarity
from gensim.corpora import Dictionary
from gensim.models import TfidfModel
import nltk
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer
import urllib.parse
import json
from pymongo import MongoClient
import re
import os.path
import csv

INDEX_FILE_NAME = "./data/test.index"
DICTIONARY_FILE_NAME = "./data/dictionary.dict"
TFIDF_FILE_PATH = "./data/tfidf.tfidf"
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
    if not os.path.exists("./data"):
        os.mkdir("./data")
    if not os.path.isfile(INDEX_FILE_NAME):
        client = openMongoClient()
        coll = client['NewsAggregator'].news_stories
        items = []
        for item in coll.find({}, { "description": 1 }):
            items.append((item['_id'], item['description']))

        if os.path.exists("./data/docs.csv"):
            append_write = "a"
        else:
            append_write = "w"

        with open("./data/docs.csv", append_write, encoding="utf8", newline="") as docs_file:
            writer = csv.writer(docs_file)
            for item in items:
                writer.writerow([item[0], item[1]])

        docs = [[lemmatizer.lemmatize(w, get_wordnet_pos(w)) for w in nltk.word_tokenize(pre_process(text)) if w not in stopword_set]
                    for article_id, text in items]

    
        dictionary = Dictionary(docs)
        corpus = [dictionary.doc2bow(doc) for doc in docs]
        tf_idf = gensim.models.TfidfModel(corpus)
        sims = gensim.similarities.Similarity(INDEX_FILE_NAME, corpus,num_features=len(dictionary))
    else:
        items = []
        with open("./data/docs.csv", "r", encoding="utf8", newline="") as docs_file:
            reader = csv.reader(docs_file)
            items = [(row[0], row[1]) for row in reader]

        dictionary = Dictionary().load(DICTIONARY_FILE_NAME)
        sims = Similarity.load(INDEX_FILE_NAME)
        tf_idf = TfidfModel.load(TFIDF_FILE_PATH)

    sims.save(INDEX_FILE_NAME)
    tf_idf.save(TFIDF_FILE_PATH)
    dictionary.save(DICTIONARY_FILE_NAME)

    testStr = input("What sentence would you like to test against? ")
    testStr = pre_process(testStr)
    query_doc = [lemmatizer.lemmatize(w, get_wordnet_pos(w)) for w in nltk.word_tokenize(testStr) if w not in stopword_set]
    query_doc_bow = dictionary.doc2bow(query_doc)
    query_doc_tf_idf = tf_idf[query_doc_bow]
    sim = sims[query_doc_tf_idf]
    
    simListSorted = sorted(enumerate(sim), key=lambda item: -item[1])
    print("\nSIMILAR STORIES\n")
    for i in range(10):
        print("DESC: {}".format(items[simListSorted[i][0]][1]))
        print("SCORE: {}\n".format(simListSorted[i][1]))
    
    
if __name__ == "__main__":
    main()