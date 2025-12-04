import unittest

from lib.trie import Trie


class TestTrie(unittest.TestCase):
    def setUp(self):
        self.trie = Trie()
        self.words = [
            "apple",
            "application",
            "banana",
            "bandana",
            "band",
            "can",
            "candy",
        ]
        for word in self.words:
            self.trie.insert(word)

    def test_search_full_word(self):
        for word in self.words:
            result = self.trie.search(word)
            self.assertIn(word, result)

    def test_search_substring(self):
        test_cases = {
            "app": ["apple", "application"],
            "ban": ["banana", "bandana", "band"],
            "and": ["bandana", "band", "candy"],
            "can": ["can", "candy"],
        }
        for substring, expected in test_cases.items():
            result = self.trie.search(substring)
            for word in expected:
                self.assertIn(word, result)

    def test_search_nonexistent(self):
        result = self.trie.search("xyz")
        self.assertEqual(result, [])

    def test_too_short_substring(self):
        result = self.trie.search("ap")
        self.assertEqual(result, [])

    def test_short_word_insertion(self):
        self.trie.insert("at")
        result = self.trie.search("at")
        self.assertIn("at", result)

    def test_serialize_deserialize(self):
        import io

        fd = io.BytesIO()
        self.trie.serialize(fd)
        fd.seek(0)
        new_trie = Trie.deserialize(fd)

        for word in self.words:
            result = new_trie.search(word)
            self.assertIn(word, result)

        test_cases = {
            "app": ["apple", "application"],
            "ban": ["banana", "bandana", "band"],
            "and": ["bandana", "band", "candy"],
            "can": ["can", "candy"],
        }
        for substring, expected in test_cases.items():
            result = new_trie.search(substring)
            for word in expected:
                self.assertIn(word, result)
