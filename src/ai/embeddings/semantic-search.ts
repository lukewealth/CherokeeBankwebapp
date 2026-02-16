// Cherokee Bank - AI Semantic Search over Embeddings
import { generateEmbedding, getIndexedDocuments, type DocumentChunk } from './documents';

export interface SearchResult {
  document: DocumentChunk;
  score: number;
  rank: number;
}

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Search indexed documents by semantic similarity
 */
export async function semanticSearch(
  query: string,
  options: {
    topK?: number;
    minScore?: number;
    category?: string;
  } = {},
): Promise<SearchResult[]> {
  const { topK = 5, minScore = 0.3, category } = options;

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Get all indexed documents
  let documents = getIndexedDocuments();

  // Filter by category if specified
  if (category) {
    documents = documents.filter((doc) => doc.metadata.category === category);
  }

  // Compute similarities
  const results: SearchResult[] = documents
    .filter((doc) => doc.embedding)
    .map((doc) => ({
      document: { ...doc, embedding: undefined },
      score: cosineSimilarity(queryEmbedding, doc.embedding!),
      rank: 0,
    }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r, index) => ({ ...r, rank: index + 1 }));

  return results;
}

/**
 * Generate a contextual answer using retrieved documents
 * Implements RAG (Retrieval Augmented Generation)
 */
export async function ragAnswer(
  query: string,
  options: { topK?: number; category?: string } = {},
): Promise<{ answer: string; sources: SearchResult[] }> {
  const results = await semanticSearch(query, { ...options, topK: options.topK || 3 });

  if (results.length === 0) {
    return {
      answer: 'I could not find relevant information in our knowledge base for your question. Please contact support for assistance.',
      sources: [],
    };
  }

  // Build context from top results
  const context = results.map((r) => r.document.content).join('\n\n');

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are Cherokee Bank's AI assistant. Answer questions based ONLY on the provided context. If the context doesn't contain the answer, say so. Be concise and accurate.\n\nContext:\n${context}`,
            },
            { role: 'user', content: query },
          ],
          max_tokens: 400,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || context;

      return { answer, sources: results };
    } catch {
      return { answer: results[0].document.content, sources: results };
    }
  }

  // Fallback: return the most relevant document content
  return {
    answer: results[0].document.content,
    sources: results,
  };
}

/**
 * Search with hybrid approach (keyword + semantic)
 */
export async function hybridSearch(
  query: string,
  options: { topK?: number; category?: string } = {},
): Promise<SearchResult[]> {
  const semanticResults = await semanticSearch(query, options);

  // Also perform keyword search
  const keywords = query.toLowerCase().split(/\s+/);
  const documents = getIndexedDocuments();

  const keywordResults: SearchResult[] = documents
    .map((doc) => {
      const content = doc.content.toLowerCase();
      const matchCount = keywords.filter((k) => content.includes(k)).length;
      const keywordScore = matchCount / keywords.length;
      return {
        document: { ...doc, embedding: undefined },
        score: keywordScore,
        rank: 0,
      };
    })
    .filter((r) => r.score > 0);

  // Merge and deduplicate
  const merged = new Map<string, SearchResult>();

  for (const result of semanticResults) {
    merged.set(result.document.id, result);
  }

  for (const result of keywordResults) {
    const existing = merged.get(result.document.id);
    if (existing) {
      existing.score = existing.score * 0.7 + result.score * 0.3; // Weighted blend
    } else {
      merged.set(result.document.id, { ...result, score: result.score * 0.3 });
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, options.topK || 5)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
