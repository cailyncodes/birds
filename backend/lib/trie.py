import pickle


class Trie:
    """
    A Trie (prefix tree) that supports insertion and searching of words by
    their prefixes and non-prefix substrings of a given n_gram_length.
    """

    def __init__(self):
        self.children: dict[str, Trie] = {}
        # All full words associated with the key at this node
        self.words: set[str] = set()

    def _insert_key(self, key: str, word: str) -> None:
        node = self
        for ch in key.lower():
            if ch not in node.children:
                node.children[ch] = Trie()
            node = node.children[ch]
        node.words.add(word)

    def insert(self, word: str) -> None:
        """
        Insert the word into the trie such that ANY substring of the word
        with length >= 3 becomes a key that returns the full word.
        """
        n = len(word)

        # Add the entire word as a searchable key
        self._insert_key(word, word)

        # Add all substrings of length >= 3
        for i in range(n):
            for j in range(i + 3, n + 1):
                substring = word[i:j]
                self._insert_key(substring, word)

    def search(self, key: str) -> list[str]:
        """
        Return all full words associated with this key.
        """
        node = self
        for ch in key.lower():
            if ch not in node.children:
                return []
            node = node.children[ch]
        return list(node.words)

    def serialize(self, fd) -> None:
        """
        Serialize the Trie to a file descriptor.
        """
        pickle.dump(self, fd)

    @staticmethod
    def deserialize(fd) -> "Trie":
        """
        Deserialize a Trie from a file descriptor.
        """
        return pickle.load(fd)
