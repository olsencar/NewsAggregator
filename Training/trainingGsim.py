from gensim.corpora import Dictionary
from gensim.similarities import Similarity
from gensim.models import TfidfModel
import nltk
# nltk.data.path.append("./nltk_data")
nltk.data.path.append("/tmp")
nltk.download('stopwords', download_dir="/tmp")
nltk.download('punkt', download_dir="/tmp")
nltk.download('averaged_perceptron_tagger', download_dir="/tmp")
nltk.download('wordnet', download_dir="/tmp")
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer
from datetime import datetime, timedelta
import re
import urllib
import json
from pymongo import MongoClient
from numpy import float64, float32, int64, int32
from sys import platform

special_chars = re.compile(r"[^a-z ]+")
lemmatizer = WordNetLemmatizer()
stopword_set = set(stopwords.words('english'))

if platform.startswith("linux"):
    INDEX_FILE_NAME = "/tmp/temp.index" 
else:
    INDEX_FILE_NAME = "./temp.index" 

def pre_process(text, html=False):
    """

    Pre-processes a piece of text by removing all characters except for a-z and the space character.

    :param text: 
        The piece of `text` to pre-process.
    
    :param html:
        True if `text` contains HTML. False by default.
    
    :return:
        Returns the pre-processed text.
    """
    
    #remove special characters
    text = text.lower()
    text = special_chars.sub("", text)
    text = re.sub(r"\s{2,}", " ", text)
    text = text.strip()

    return text

# Determines if the word is an adjective, noun, verb or adverb
def get_wordnet_pos(word):
    # Map POS tag to first character lemmatize() accepts
    tag = nltk.pos_tag([word])[0][1][0].upper()
    tag_dict = {"J": wordnet.ADJ,
                "N": wordnet.NOUN,
                "V": wordnet.VERB,
                "R": wordnet.ADV}

    return tag_dict.get(tag, wordnet.NOUN)


def articles_to_docs(articles):
    """

    Creates an array of bag-of-words. 
        Each element in the outer array represents an article and is an array.
        This array element is a list of words that is in the article's description.
    
    `articles` : 
        A list of articles (see get_articles return type)
    
    Returns :
        A list of words for each article.
    """
    docs = [[lemmatizer.lemmatize(w, get_wordnet_pos(w)) for w in nltk.word_tokenize(pre_process(article['title'] + ' ' + article['description'])) if w not in stopword_set]
                for article in articles]
    return docs

def create_dictionary(docs):
    """

    Creates a `gensim.Corpora.Dictionary` from a list of words for each article.

    `docs` : 
        A list of words for each article. See (articles_to_docs() for the return type)
    
    Returns : 
        A gensim.Corpora.Dictionary.
    """
    return Dictionary(docs)

def create_corpus(dictionary, docs):
    """

    Creates the corpus for the articles.
        Creates a list of bag-of-words for each article. BoW format = list of (token_id, token_count) tuples

    `dictionary` :
        A gensim.Corpora.Dictionary.
    
    `docs` : 
        A list of words for each article.

    Returns :
        A list of bag-of-words for each article.
    """
    return [dictionary.doc2bow(doc) for doc in docs]

def correct_encoding(value):
    """Correct the encoding of python values so they can be encoded to mongodb
    inputs
    -------
    dictionary : dictionary instance to add as document
    output
    -------
    Returns : new value with (hopefully) corrected encodings"""


    if isinstance(value, int64) or isinstance(value, int32):
        newValue = int(value)

    if isinstance(value, float64) or isinstance(value, float32):
        newValue = float(value)

    return newValue

def get_similar_articles(text, similarity_matrix, tf_idf, dictionary, articles, topn=10, publish_date=datetime.utcnow(), prefer_recent_articles=True):
    """

    Gets the `topn` similar articles to a piece of text.

    `text` : 
        The text to find similarities to.
    
    `similarity_matrix` : 
        The similarity matrix generated using gensim.similarities.Similarity.

    `tf_idf` : 
        The TF-IDF model to use on the text.

    `dictionary` : 
        The dictionary of words extracted from each article.

    `articles` : 
        An array of articles containing (article_id, description, publish_date) 

    `topn` : 
        This parameter defines the amount of similar articles that you want returned.
    
    `publish_date` : 
        The publish date of the article. Defaults to current UTC time.

    `prefer_recent_articles` : 
        Setting this parameter to true modifies the similarity score by subtracting score from articles that have a publish date that is further away from the given article's publish date.
    
    Returns :
        Top N list of similar articles with their score. (article_id, score)
    """
    query_doc = [lemmatizer.lemmatize(w, get_wordnet_pos(w)) for w in nltk.word_tokenize(text) if w not in stopword_set]
    query_doc_bow = dictionary.doc2bow(query_doc)
    query_doc_tf_idf = tf_idf[query_doc_bow]
    similarities = similarity_matrix[query_doc_tf_idf]

    if (prefer_recent_articles):
        for i in range(len(similarities)):
            if (similarities[i] > 0.00):
                datediff = (datetime.utcnow() - articles[i]['publish_date']).days
                similarities[i] = similarities[i] - pow((datediff * .05), 3)

    simListSorted = sorted(enumerate(similarities), key=lambda item: -item[1])
    
    topSims = []
    for i in range(topn):
        topSims.append(articles[simListSorted[i][0]])
        topSims[i]['similarity_score'] = correct_encoding(simListSorted[i][1])

    return topSims

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
        {"publish_date": {"$gte": datetime.utcnow() - timedelta(days=days_back) } }, { "description": 1, "title": 1, "publish_date": 1 }).sort('publish_date', -1):
        # Add the item to the dictionary
        if ('description' not in item):
            print(item)
        else:
            items.append(item)
    return items

client = openMongoClient()
articles = get_articles(client)
docs = articles_to_docs(articles)
dictionary = create_dictionary(docs)
corpus = create_corpus(dictionary, docs)
tf_idf = TfidfModel(corpus)
similarity_matrix = Similarity(INDEX_FILE_NAME, corpus, num_features=len(dictionary))

for i in range(50): 
    sentence = articles[i]['title'] + ' ' + articles[i]['description']
    print("======================================================")
    print()
    print("SENTENCE: " + sentence)
    similar_articles = get_similar_articles(
                        pre_process(sentence),
                        similarity_matrix,
                        tf_idf,
                        dictionary,
                        articles, 
                        prefer_recent_articles=False,
                        topn=5
                    )
    print("MOST SIMILAR")
    for x in range(len(similar_articles)):
        print(similar_articles[x]['description'])
        print("SCORE: " + str(similar_articles[x]['similarity_score']))
        print()