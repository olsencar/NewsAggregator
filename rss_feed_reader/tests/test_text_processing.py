import unittest
import sys
sys.path.append('../')
import text_processing
from numpy import float64, float32, int64, int32

class TestTextProcessing(unittest.TestCase):
    def test_correct_encoding(self):
        self.assertIsInstance(
            text_processing.correct_encoding(int32(213432)),
            int
        )
        self.assertIsInstance(
            text_processing.correct_encoding(int64(213432)),
            int
        )
        self.assertIsInstance(
            text_processing.correct_encoding(float32(0.0043389)),
            float
        )
        self.assertIsInstance(
            text_processing.correct_encoding(float64(0.324324243)),
            float
        )
    
    def test_remove_html(self):
        test_html = "<div class='test'>This is a test</div>"
        self.assertEqual("This is a test", text_processing.remove_html(test_html))
        test_html = "This is test <div class='test2'>2</div>"
        self.assertEqual("This is test 2", text_processing.remove_html(test_html))

    
    def test_pre_process(self):
        self.assertEqual(text_processing.pre_process("23 ABCDEF this is !a test"), "abcdef this is a test")
        self.assertEqual(text_processing.pre_process("<>"), "")

if __name__ == "__main__":
    unittest.main()
