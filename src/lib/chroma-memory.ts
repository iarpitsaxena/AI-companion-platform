import { featureFlags } from "@/lib/feature-flags";

interface MemoryQueryInput {
  userId: string;
  companionId: string;
  text: string;
  limit?: number;
}

interface MemoryStoreInput {
  userId: string;
  companionId: string;
  conversationId: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  }>;
}

const CHROMA_BASE_URL = process.env.NEXT_PUBLIC_CHROMA_URL?.replace(/\/$/, "");
const CHROMA_COLLECTION =
  process.env.CHROMA_COLLECTION || "ai_companion_memory";

const VECTOR_DIMENSION = 256;

function embedText(text: string) {
  const vector = Array<number>(VECTOR_DIMENSION).fill(0);
  const normalized = text.toLowerCase();

  for (let index = 0; index < normalized.length; index += 1) {
    const code = normalized.charCodeAt(index);
    const bucket = code % VECTOR_DIMENSION;
    vector[bucket] += 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (norm > 0) {
    return vector.map((value) => value / norm);
  }

  return vector;
}

function chromaHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.CHROMA_API_KEY) {
    headers.Authorization = `Bearer ${process.env.CHROMA_API_KEY}`;
  }

  return headers;
}

async function ensureCollectionId() {
  if (!CHROMA_BASE_URL) {
    return null;
  }

  try {
    const createResponse = await fetch(
      `${CHROMA_BASE_URL}/api/v1/collections`,
      {
        method: "POST",
        headers: chromaHeaders(),
        body: JSON.stringify({
          name: CHROMA_COLLECTION,
          get_or_create: true,
          metadata: { purpose: "long_term_memory" },
        }),
      },
    );

    if (createResponse.ok) {
      const collection = (await createResponse.json()) as { id?: string };
      if (collection.id) {
        return collection.id;
      }
    }

    const listResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/collections`, {
      method: "GET",
      headers: chromaHeaders(),
    });

    if (!listResponse.ok) {
      return null;
    }

    const payload = (await listResponse.json()) as Array<{
      id: string;
      name: string;
    }>;
    const match = payload.find(
      (collection) => collection.name === CHROMA_COLLECTION,
    );
    return match?.id ?? null;
  } catch {
    return null;
  }
}

export async function queryChromaMemories(input: MemoryQueryInput) {
  if (!featureFlags.chromaMemory || !CHROMA_BASE_URL || !input.text.trim()) {
    return [] as string[];
  }

  const collectionId = await ensureCollectionId();
  if (!collectionId) {
    return [];
  }

  try {
    const response = await fetch(
      `${CHROMA_BASE_URL}/api/v1/collections/${collectionId}/query`,
      {
        method: "POST",
        headers: chromaHeaders(),
        body: JSON.stringify({
          query_embeddings: [embedText(input.text)],
          n_results: input.limit ?? 4,
          where: {
            user_id: input.userId,
            companion_id: input.companionId,
          },
          include: ["documents"],
        }),
      },
    );

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      documents?: string[][];
    };

    return payload.documents?.[0]?.filter(Boolean) ?? [];
  } catch {
    return [];
  }
}

export async function storeChromaMemories(input: MemoryStoreInput) {
  if (
    !featureFlags.chromaMemory ||
    !CHROMA_BASE_URL ||
    input.messages.length === 0
  ) {
    return;
  }

  const collectionId = await ensureCollectionId();
  if (!collectionId) {
    return;
  }

  try {
    const ids = input.messages.map((message) => message.id);
    const documents = input.messages.map(
      (message) => `${message.role.toUpperCase()}: ${message.content}`,
    );
    const embeddings = input.messages.map((message) =>
      embedText(message.content),
    );
    const metadatas = input.messages.map((message) => ({
      user_id: input.userId,
      companion_id: input.companionId,
      conversation_id: input.conversationId,
      role: message.role,
      created_at: message.createdAt,
    }));

    await fetch(`${CHROMA_BASE_URL}/api/v1/collections/${collectionId}/add`, {
      method: "POST",
      headers: chromaHeaders(),
      body: JSON.stringify({
        ids,
        documents,
        embeddings,
        metadatas,
      }),
    });
  } catch {
    return;
  }
}
