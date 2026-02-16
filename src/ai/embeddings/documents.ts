// Cherokee Bank - AI Document Embeddings
// Generates and stores vector embeddings for banking documents, FAQs, and policies

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    category: string;
    title: string;
    pageNumber?: number;
  };
  embedding?: number[];
}

// In-memory store (production would use Pinecone, Weaviate, or pgvector)
const documentStore: Map<string, DocumentChunk> = new Map();

/**
 * Generate embedding vector for text using OpenAI Embeddings API
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (OPENAI_API_KEY) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    const data = await response.json();
    return data.data?.[0]?.embedding || generateMockEmbedding(text);
  }

  return generateMockEmbedding(text);
}

/**
 * Generate a simple mock embedding for development
 */
function generateMockEmbedding(text: string): number[] {
  const dimension = 1536;
  const embedding: number[] = [];
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed += text.charCodeAt(i);
  }
  for (let i = 0; i < dimension; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    embedding.push((seed / 0x7fffffff) * 2 - 1);
  }
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map((v) => v / magnitude);
}

/**
 * Chunk a long document into smaller segments
 */
export function chunkDocument(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50,
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

/**
 * Index a document by generating embeddings for each chunk
 */
export async function indexDocument(
  content: string,
  metadata: { source: string; category: string; title: string },
): Promise<DocumentChunk[]> {
  const chunks = chunkDocument(content);
  const indexed: DocumentChunk[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);
    const doc: DocumentChunk = {
      id: `${metadata.source}_chunk_${i}`,
      content: chunks[i],
      metadata: { ...metadata, pageNumber: i + 1 },
      embedding,
    };

    documentStore.set(doc.id, doc);
    indexed.push(doc);
  }

  return indexed;
}

/**
 * Pre-load banking knowledge base
 */
export async function initializeKnowledgeBase(): Promise<void> {
  const bankingDocs = [
    {
      content: `Cherokee Bank offers multi-currency digital wallets supporting USD, EUR, GBP, and CHERO (₵). 
        Users can create wallets, deposit funds, withdraw, and convert between currencies at competitive rates.
        The platform charges 0.5% for currency conversions and 0.1% for peer-to-peer transfers.
        Daily limits are $10,000 per wallet and monthly limits are $100,000 unless upgraded via KYC verification.`,
      metadata: { source: 'banking-guide', category: 'wallets', title: 'Wallet Operations Guide' },
    },
    {
      content: `Cherokee Bank's KYC (Know Your Customer) process requires two forms of identification:
        1. Government-issued ID (Passport, Driver's License, or National ID)
        2. Proof of Address (Utility Bill, Bank Statement - less than 3 months old)
        Optional: Selfie verification for enhanced security.
        Verification typically completes within 1-2 business days.
        Verified accounts have higher transaction limits and access to premium features.`,
      metadata: { source: 'kyc-policy', category: 'compliance', title: 'KYC Verification Policy' },
    },
    {
      content: `Cryptocurrency trading on Cherokee Bank supports BTC (Bitcoin), ETH (Ethereum), and USDT (Tether).
        Trading fees are 1.5% per transaction. Crypto wallets are generated with unique addresses.
        Users can buy crypto with fiat currencies and sell crypto back to fiat.
        All crypto transactions undergo AML screening and risk analysis.`,
      metadata: { source: 'crypto-guide', category: 'crypto', title: 'Crypto Trading Guide' },
    },
    {
      content: `Cherokee Bank security features include:
        - AES-256 encryption for all sensitive data
        - JWT-based authentication with refresh token rotation
        - Two-Factor Authentication (TOTP)
        - IP-based rate limiting and geo-blocking
        - Real-time fraud detection powered by AI
        - CSRF protection on all state-changing operations
        - SOC 2 Type II compliance framework`,
      metadata: { source: 'security-policy', category: 'security', title: 'Security Overview' },
    },
  ];

  for (const doc of bankingDocs) {
    await indexDocument(doc.content, doc.metadata);
  }

  console.log(`Knowledge base initialized with ${documentStore.size} document chunks`);
}

/**
 * Get all indexed documents
 */
export function getIndexedDocuments(): DocumentChunk[] {
  return Array.from(documentStore.values());
}

/**
 * Clear the document store
 */
export function clearDocumentStore(): void {
  documentStore.clear();
}
