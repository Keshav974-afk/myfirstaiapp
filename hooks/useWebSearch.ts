import { useState } from 'react';
import { useAppSettings } from './useAppSettings';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export function useWebSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const { webSearchEnabled } = useAppSettings();

  const searchWeb = async (query: string): Promise<SearchResult[]> => {
    if (!webSearchEnabled) return [];

    setIsSearching(true);
    try {
      // Use the browser's built-in search functionality
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      const html = await response.text();

      // Parse the search results
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const searchResults: SearchResult[] = [];

      // Extract search results
      const results = doc.querySelectorAll('.g');
      results.forEach((result) => {
        const titleElement = result.querySelector('h3');
        const linkElement = result.querySelector('a');
        const snippetElement = result.querySelector('.VwiC3b');

        if (titleElement && linkElement && snippetElement) {
          searchResults.push({
            title: titleElement.textContent || '',
            url: linkElement.href,
            snippet: snippetElement.textContent || '',
          });
        }
      });

      return searchResults;
    } catch (error) {
      console.error('Web search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchWeb,
    isSearching,
  };
}