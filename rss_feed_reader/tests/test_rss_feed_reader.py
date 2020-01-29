import unittest
import rss_feed_reader as rss

class TestRssReader(unittest.TestCase):
    def test_get_keywords(self):
        self.assertIsNotNone(rss.get_keywords("this is a test"))
    
    def test_article_images(self):
        self.assertCountEqual(rss.getArticleImages({}), [])

if __name__ == "__main__":
    unittest.main()