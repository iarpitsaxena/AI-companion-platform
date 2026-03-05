export type Trait =
  | "friendly"
  | "professional"
  | "humorous"
  | "empathetic"
  | "supportive"
  | "creative";

export type CommunicationStyle =
  | "casual"
  | "formal"
  | "enthusiastic"
  | "calm"
  | "playful";

export type Expertise =
  | "general"
  | "tech"
  | "lifestyle"
  | "wellness"
  | "education";

export type RelationshipType = "friend" | "mentor" | "assistant" | "coach";

export interface Companion {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  description: string | null;
  traits: Trait[];
  communication_style: CommunicationStyle;
  expertise_area: Expertise;
  custom_prompt: string | null;
  background_story: string | null;
  relationship_type: RelationshipType;
  tone_preference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  companion_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface NoteItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TodoItem {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
