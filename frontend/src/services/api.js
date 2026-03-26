const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch autocomplete suggestions
export const fetchSuggestions = async (query) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/suggestions?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }

    const data = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

// Add a new word to the database
export const addWord = async (word) => {
  try {
    const response = await fetch(`${API_BASE_URL}/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      throw new Error('Failed to add word');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding word:', error);
    throw error;
  }
};

// Health check
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
