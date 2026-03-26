class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Insert a word into the Trie
  insert(word) {
    let node = this.root;
    for (let char of word.toLowerCase()) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  // Search for a word in the Trie
  search(word) {
    let node = this.root;
    for (let char of word.toLowerCase()) {
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    return node.isEndOfWord;
  }

  // Get all suggestions starting with a prefix
  getSuggestions(prefix) {
    let node = this.root;
    const suggestions = [];

    // Navigate to the end of the prefix
    for (let char of prefix.toLowerCase()) {
      if (!node.children[char]) {
        return suggestions;
      }
      node = node.children[char];
    }

    // DFS to find all words starting with this prefix
    this._dfs(node, prefix, suggestions);
    return suggestions;
  }

  _dfs(node, currentWord, suggestions, maxSuggestions = 10) {
    if (suggestions.length >= maxSuggestions) return;

    if (node.isEndOfWord) {
      suggestions.push(currentWord);
    }

    for (let char in node.children) {
      this._dfs(node.children[char], currentWord + char, suggestions, maxSuggestions);
    }
  }
}

module.exports = Trie;
