#!/usr/bin/python3
try:
    import unzip_requirements
except ImportError:
    pass
import logging
logger = logging.getLogger("TextProcessor")
logger.setLevel(logging.WARNING)
import re
from datetime import datetime
from numpy import float64, float32, int64, int32
import tensorflow_hub as tf_hub
import tensorflow as tf
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


special_chars = re.compile(r"[\(\[].*?[\)\]]")

class TextProcessor:
    def __init__(self, articles):
        self.module_url = "https://tfhub.dev/google/universal-sentence-encoder/4"
        self.create_sentence_embeddings(articles)


    def create_sentence_embeddings(self, articles):
        """

        Creates a list of sentence embeddings for each article
        
        `articles` : 
            A list of article dictionaries
        
        Returns :
            A list of words for each article.
        """
        self.article_texts = self.get_article_texts(articles)
        embed = tf_hub.load(self.module_url)
        self.sentence_embeddings = embed(self.article_texts)
        self.similarity_matrix = cosine_similarity(np.array(self.sentence_embeddings))
    
    @classmethod
    def get_article_texts(self, articles):
        """
        
        Retrieves only the title and description from each article

        Returns : list of article title + article descriptions
        """
        return list(map(lambda article: self.pre_process(article['title'] + ' ' + article['description'], False), articles))

    @staticmethod
    def correct_encoding(value):
        """
        
        Correct the encoding of python values so they can be encoded to mongodb
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

    @staticmethod
    def remove_html(text):
        """

        Removes HTML tags and strings in between the tags from the `text` parameter.

        :param text: 
            The text to remove HTML tags from.

        :return:
            Returns the `text` with the HTML removed from it.
        """

        tmp = re.sub("<[^>]*>", "", text)
        tmp = re.sub(r"[\(\n)+\(\t)+]+", "", tmp)
        return tmp

    @staticmethod
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
        
        # remove html tags
        if (html):
            text = TextProcessor.remove_html(text)
        #remove special characters
        text = special_chars.sub("", text)
        text = re.sub(r"\s{2,}", " ", text)
        text = text.strip()

        return text


    def get_similar_articles(self, article, articles, topn=5, publish_date=datetime.utcnow(), prefer_recent_articles=True):
        """

        Gets the `topn` similar articles to a piece of text.

        `article` : 
            The article to find similarities to
        
        `articles` : 
            List of article objects that include the article to search for

        `topn` : 
            This parameter defines the amount of similar articles that you want returned.
        
        `publish_date` : 
            The publish date of the article. Defaults to current UTC time.

        `prefer_recent_articles` : 
            Setting this parameter to true modifies the similarity score by subtracting score from articles that have a publish date that is further away from the given article's publish date.
        
        Returns :
            List of article objects that are similar
        """
        article_text = self.pre_process(article['title'] + ' ' + article['description'])
        index = self.article_texts.index(article_text)
        sim_row = np.array(self.similarity_matrix[index, :])


        if (prefer_recent_articles):
            for i in range(len(sim_row)):
                if (sim_row[i] > 0.00):
                    datediff = abs((publish_date.date() - articles[i]['publish_date'].date()).days)
                    sim_row[i] = sim_row[i] - pow((datediff * .05), 3)

        indices = sim_row.argsort()[-topn:][::-1][1:]

        top_sims = []
        cnt = 0
        for i in indices:
            top_sims.append(articles[i])
            top_sims[cnt]['similarity_score'] = self.correct_encoding(sim_row[i])
            cnt += 1

        return top_sims
