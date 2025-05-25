import { useState } from 'react';
import { useAppSettings } from './useAppSettings';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

const SEARCH_API_URL = 'https://api.duckduckgo.com/';

export function useWebSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const { webSearchEnabled } = useAppSettings();

  const searchWeb = async (query: string): Promise<SearchResult[]> => {
    if (!webSearchEnabled) return [];

    setIsSearching(true);
    try {
      const response = await fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(query)}&format=json`);
      const data = await response.json();

      return data.RelatedTopics.map((topic: any) => ({
        title: topic.Text?.split(' - ')[0] || '',
        snippet: topic.Text || '',
        url: topic.FirstURL || '',
      })).slice(0, 5);
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