import unittest
import sys
sys.path.insert(1, '../')
from text_processor.TextProcessor import TextProcessor
from numpy import float64, float32, int64, int32

class TestTextProcessing(unittest.TestCase):
    def test_correct_encoding(self):
        self.assertIsInstance(
            TextProcessor.correct_encoding(int32(213432)),
            int
        )
        self.assertIsInstance(
            TextProcessor.correct_encoding(int64(213432)),
            int
        )
        self.assertIsInstance(
            TextProcessor.correct_encoding(float32(0.0043389)),
            float
        )
        self.assertIsInstance(
            TextProcessor.correct_encoding(float64(0.324324243)),
            float
        )
    
    def test_remove_html(self):
        test_html = "<div class='test'>This is a test</div>"
        self.assertEqual("This is a test", TextProcessor.remove_html(test_html))
        test_html = "This is test <div class='test2'>2</div>"
        self.assertEqual("This is test 2", TextProcessor.remove_html(test_html))

    
    def test_pre_process(self):
        self.assertEqual(TextProcessor.pre_process("This is a test (testing)?"), "This is a test ?")
        self.assertEqual(TextProcessor.pre_process("[This is a test testing]?"), "?")
        self.assertEqual(TextProcessor.pre_process("<>", True), "")

if __name__ == "__main__":
    unittest.main()
