export interface SearchResult {
  meta: {
    title: string;
    [key: string]: any;
  };
  excerpt: string;
  content?: string; // If available, otherwise we use excerpt
  url: string;
}

/**
 * Generates a summary from search results using Google Gemini API.
 * 
 * STRICT LIMITS:
 * - Context: Top 3 results only.
 * - Output: Max 150 tokens (~100 words).
 * - System Prompt: "Answer ONLY from context".
 */
export async function generateSearchSummary(
  query: string,
  results: SearchResult[],
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  if (results.length === 0) {
    return "No results found to summarize.";
  }

  // 1. Strict Context Selection: Top 3 results only
  const topResults = results.slice(0, 3);

  // 2. Prepare Context Text (limited to avoid huge prompts)
  const contextText = topResults.map((r, i) => {
    return `Result ${i + 1}:\nTitle: ${r.meta.title}\nURL: ${r.url}\nContent: ${r.excerpt.replace(/<[^>]*>/g, '')}`; 
  }).join("\n\n");

  // 3. Strict System Prompt
  const prompt = `
You are a helpful documentation assistant for Mangesh's website.
Your task is to answer the user's query based ONLY on the provided search results.

Query: "${query}"

Search Results found:
${contextText}

Instructions:
1. Answer the query using ONLY the information from the Search Results above.
2. If the answer is not in the Search Results, strictly reply with: "I cannot find the answer in the search results."
3. Keep your answer concise (under 100 words).
4. Do not invent information or use outside knowledge.
5. Cite the source URL if relevant.

Answer:
`;

  // 4. Call Gemini API
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: 150, // Strict limit ~100 words
            temperature: 0.3,     // Low temperature for factual consistency
          }
        }),
      }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate summary");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return text || "No summary generated.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
