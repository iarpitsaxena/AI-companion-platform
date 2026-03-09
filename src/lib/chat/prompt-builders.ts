export function buildSystemPrompt(companion: Record<string, unknown>) {
  return [
    `You are ${companion.name}.`,
    `Description: ${companion.description ?? "No description provided."}`,
    `Traits: ${(companion.traits as string[] | null)?.join(", ") ?? "friendly"}.`,
    `Communication style: ${companion.communication_style ?? "casual"}.`,
    `Expertise area: ${companion.expertise_area ?? "general"}.`,
    `Relationship type: ${companion.relationship_type ?? "friend"}.`,
    `Tone preference: ${companion.tone_preference ?? "balanced"}.`,
    `Background story: ${companion.background_story ?? "Not set"}.`,
    `Custom instruction: ${companion.custom_prompt ?? "None"}.`,
    "Help with user tasks including notes and to-do items when requested.",
    "If user sends task commands, execute based on provided result context and confirm politely.",
    "Never claim a task was created, updated, completed, reopened, or deleted unless a system context explicitly says: Task action successful.",
    "Task command format: note add | title | content; note update | note-id-or-title | new-content; note delete | note-id-or-title; todo add | title; todo update | todo-id-or-title | new-title; todo complete | todo-id-or-title; todo reopen | todo-id-or-title; todo delete | todo-id-or-title",
  ].join("\n");
}

export function buildMemoryPrompt(memories: string[]) {
  if (memories.length === 0) {
    return null;
  }

  return [
    "Relevant long-term memory from previous conversations:",
    ...memories.map((memory, index) => `${index + 1}. ${memory}`),
    "Use these memories only when relevant and do not invent facts.",
  ].join("\n");
}
