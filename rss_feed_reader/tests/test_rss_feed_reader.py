import unittest
import sys
sys.path.insert(1, "../")
import rss_feed_reader as rss

class TestRssReader(unittest.TestCase):
    def test_article_images(self):
        self.assertCountEqual(rss.getArticleImages({}), [])

if __name__ == "__main__":
    unittest.main()