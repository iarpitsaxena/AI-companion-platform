import { featureFlags } from "@/lib/feature-flags";
import { CloudClient } from "chromadb";

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

const CHROMA_API_KEY = process.env.CHROMA_API_KEY;
const CHROMA_TENANT = process.env.CHROMA_TENANT;
const CHROMA_DATABASE = process.env.CHROMA_DATABASE;
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

let collectionPromise: Promise<Awaited<
  ReturnType<CloudClient["getOrCreateCollection"]>
> | null> | null = null;

async function getCollection() {
  if (!featureFlags.chromaMemory) {
    return null;
  }

  if (!CHROMA_API_KEY || !CHROMA_TENANT || !CHROMA_DATABASE) {
    return null;
  }

  if (!collectionPromise) {
    collectionPromise = (async () => {
      try {
        const client = new CloudClient({
          apiKey: CHROMA_API_KEY,
          tenant: CHROMA_TENANT,
          database: CHROMA_DATABASE,
        });

        return await client.getOrCreateCollection({
          name: CHROMA_COLLECTION,
          metadata: { purpose: "long_term_memory" },
        });
      } catch {
        return null;
      }
    })();
  }

  return collectionPromise;
}

export async function queryChromaMemories(input: MemoryQueryInput) {
  if (!featureFlags.chromaMemory || !input.text.trim()) {
    return [] as string[];
  }

  const collection = await getCollection();
  if (!collection) {
    return [];
  }

  try {
    const payload = await collection.query({
      queryEmbeddings: [embedText(input.text)],
      nResults: input.limit ?? 4,
      where: {
        user_id: input.userId,
        companion_id: input.companionId,
      },
      include: ["documents"],
    });

    return (
      payload.documents?.[0]?.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      ) ?? []
    );
  } catch {
    return [];
  }
}

export async function storeChromaMemories(input: MemoryStoreInput) {
  if (!featureFlags.chromaMemory || input.messages.length === 0) {
    return;
  }

  const collection = await getCollection();
  if (!collection) {
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

    await collection.add({
      ids,
      documents,
      embeddings,
      metadatas,
    });
  } catch {
    return;
  }
}
