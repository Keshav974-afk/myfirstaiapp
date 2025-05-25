// Update the handleWebSearch function in the ChatScreen component

const handleWebSearch = async () => {
  if (!webSearchEnabled) return;

  try {
    setIsLoading(true);
    const results = await searchWeb(message);
    
    if (results.length > 0) {
      // Format search results for the AI
      const searchContext = results
        .map(r => `${r.title}\n${r.snippet}\nSource: ${r.url}`)
        .join('\n\n');

      // Add search results to the message
      const messageWithContext = `
        Web search results for "${message}":
        ${searchContext}
        
        Based on these search results, please provide a response to: ${message}
      `;

      // Send the enhanced message to the AI
      await sendMessage(messageWithContext);
    } else {
      await sendMessage(message);
    }
  } catch (error) {
    console.error('Web search error:', error);
    setError('Failed to perform web search');
  } finally {
    setIsLoading(false);
  }
};