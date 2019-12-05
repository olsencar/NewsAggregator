import gensim
import nltk
nltk.download('wordnet')
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer
import re
from pymongo import MongoClient
import pprint
import json
import urllib.parse
import operator
# stopwords = nltk.download('stopwords')
stopword_set = set(stopwords.words('english'))
lemma = WordNetLemmatizer()
special_chars = re.compile(r"[^a-z ]+")

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
    #remove special characters
    text = text.lower()
    text = special_chars.sub("", text)
    text = re.sub(r"\s{2,}", " ", text)
    text = text.rstrip()

    return text

def openMongoClient():
    with open("connectionDetails.json", "r") as conn:
            config = json.load(conn)
            user = urllib.parse.quote(config['user'])
            pwd = urllib.parse.quote(config['password'])
            return MongoClient("mongodb+srv://{}:{}@newsaggregator-0ys1l.mongodb.net/test?retryWrites=true&w=majority".format(user, pwd))

def main():
    model = gensim.models.Doc2Vec.load("doc2vec.model")
    s = input("What text would you like to find matches to? ")

    test = pre_process(s)
    print("PRE-PROCCESED: {}\n".format(test))
    words = [lemma.lemmatize(word, get_wordnet_pos(word)) for word in nltk.word_tokenize(test)]
    words = list(set(words).difference(stopword_set))
    print("AFTER LEMMATIZE: {}\n".format(" ".join(words)))

    vec = model.infer_vector(words)
    most_sim = model.docvecs.most_similar([vec])

    articles_to_search_for = []
    for (i, j) in most_sim:
        print("{} : {}\n".format(i, j))


    client = openMongoClient()
    db = client['NewsAggregator']
    coll = db.news_stories
    arr = []
    for item in coll.find({ "_id": { "$in" : articles_to_search_for }}):
        score = 0
        for (i, j) in most_sim:
            if (item['_id'] == i):
                score = j
                arr.append(
                    {
                        "_id": item['_id'],
                        "desc": item['description'],
                        "title": item['title'],
                        "score": score
                    }
                )
                break
    arr.sort(key=operator.itemgetter('score'), reverse=True)
    for obj in arr:
        print("TITLE: {}".format(obj['title']))
        print("DESC: {}".format(obj['desc']))
        print("SCORE: {}\n".format(obj['score']))
if __name__ == "__main__":
    main()