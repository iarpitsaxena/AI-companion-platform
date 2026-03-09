import { getSupabaseAdmin } from "@/lib/supabase";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TaskCommand =
  | { kind: "note-add"; title: string; content: string }
  | { kind: "note-update"; target: string; content: string }
  | { kind: "note-delete"; target: string }
  | { kind: "todo-add"; title: string }
  | { kind: "todo-update"; target: string; title: string }
  | { kind: "todo-complete"; target: string }
  | { kind: "todo-reopen"; target: string }
  | { kind: "todo-delete"; target: string };

const commandPrefixes = [
  "note add |",
  "note update |",
  "note delete |",
  "todo add |",
  "todo update |",
  "todo complete |",
  "todo reopen |",
  "todo delete |",
];

function cleanTarget(value: string) {
  return value.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
}

function parseTaskCommand(input: string): TaskCommand | null {
  const text = input.trim();
  const lowered = text.toLowerCase();

  const parts = text.split("|").map((item) => item.trim());

  if (lowered.startsWith("note add |") && parts.length >= 2) {
    return {
      kind: "note-add",
      title: parts[1] ?? "",
      content: parts[2] ?? "",
    };
  }

  if (lowered.startsWith("note update |") && parts.length >= 3) {
    return {
      kind: "note-update",
      target: cleanTarget(parts[1] ?? ""),
      content: parts[2] ?? "",
    };
  }

  if (lowered.startsWith("note delete |") && parts.length >= 2) {
    return {
      kind: "note-delete",
      target: cleanTarget(parts[1] ?? ""),
    };
  }

  if (lowered.startsWith("todo add |") && parts.length >= 2) {
    return {
      kind: "todo-add",
      title: parts[1] ?? "",
    };
  }

  if (lowered.startsWith("todo update |") && parts.length >= 3) {
    return {
      kind: "todo-update",
      target: cleanTarget(parts[1] ?? ""),
      title: parts[2] ?? "",
    };
  }

  if (lowered.startsWith("todo complete |") && parts.length >= 2) {
    return {
      kind: "todo-complete",
      target: cleanTarget(parts[1] ?? ""),
    };
  }

  if (lowered.startsWith("todo reopen |") && parts.length >= 2) {
    return {
      kind: "todo-reopen",
      target: cleanTarget(parts[1] ?? ""),
    };
  }

  if (lowered.startsWith("todo delete |") && parts.length >= 2) {
    return {
      kind: "todo-delete",
      target: cleanTarget(parts[1] ?? ""),
    };
  }

  const noteAddMatch = text.match(/^add\s+note\s+(.+)$/i);
  if (noteAddMatch) {
    return {
      kind: "note-add",
      title: cleanTarget(noteAddMatch[1]),
      content: "",
    };
  }

  const noteDeleteMatch = text.match(/^(?:delete|remove)\s+note\s+(.+)$/i);
  if (noteDeleteMatch) {
    return { kind: "note-delete", target: cleanTarget(noteDeleteMatch[1]) };
  }

  const noteUpdateMatch = text.match(/^update\s+note\s+(.+?)\s+to\s+(.+)$/i);
  if (noteUpdateMatch) {
    return {
      kind: "note-update",
      target: cleanTarget(noteUpdateMatch[1]),
      content: noteUpdateMatch[2].trim(),
    };
  }

  const todoAddMatch = text.match(/^add\s+(?:todo|task)\s+(.+)$/i);
  if (todoAddMatch) {
    return { kind: "todo-add", title: cleanTarget(todoAddMatch[1]) };
  }

  const todoAddAlt = text.match(
    /^add\s+(.+?)\s+to\s+my\s+(?:to-?do|todo)\s+list$/i,
  );
  if (todoAddAlt) {
    return { kind: "todo-add", title: cleanTarget(todoAddAlt[1]) };
  }

  const todoDeleteMatch = text.match(
    /^(?:delete|remove)\s+(?:todo|task)\s+(.+)$/i,
  );
  if (todoDeleteMatch) {
    return { kind: "todo-delete", target: cleanTarget(todoDeleteMatch[1]) };
  }

  const todoCompleteMatch = text.match(
    /^(?:complete|finish|done)\s+(?:todo|task)\s+(.+)$/i,
  );
  if (todoCompleteMatch) {
    return { kind: "todo-complete", target: cleanTarget(todoCompleteMatch[1]) };
  }

  const todoReopenMatch = text.match(
    /^(?:reopen|undo)\s+(?:todo|task)\s+(.+)$/i,
  );
  if (todoReopenMatch) {
    return { kind: "todo-reopen", target: cleanTarget(todoReopenMatch[1]) };
  }

  const todoUpdateMatch = text.match(
    /^update\s+(?:todo|task)\s+(.+?)\s+to\s+(.+)$/i,
  );
  if (todoUpdateMatch) {
    return {
      kind: "todo-update",
      target: cleanTarget(todoUpdateMatch[1]),
      title: todoUpdateMatch[2].trim(),
    };
  }

  return null;
}

export function extractEmbeddedCommand(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const rawLine of lines) {
    const line = rawLine.replace(/^[-*\d.)\s]+/, "").trim();
    const lowered = line.toLowerCase();
    if (commandPrefixes.some((prefix) => lowered.startsWith(prefix))) {
      return line;
    }
  }

  const inlineMatch = text.match(
    /(note\s+(?:add|update|delete)\s*\|[^\n.;]+|todo\s+(?:add|update|delete|complete|reopen)\s*\|[^\n.;]+)/i,
  );

  return inlineMatch?.[1]?.trim() ?? null;
}

async function resolveNoteId(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  target: string,
) {
  if (uuidPattern.test(target)) {
    return target;
  }

  const { data } = await supabase
    .from("notes")
    .select("id")
    .eq("user_id", userId)
    .ilike("title", `%${target}%`)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

async function resolveTodoId(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  target: string,
) {
  if (uuidPattern.test(target)) {
    return target;
  }

  const { data } = await supabase
    .from("todos")
    .select("id")
    .eq("user_id", userId)
    .ilike("title", `%${target}%`)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

export async function executeTaskCommand(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  rawContent: string,
) {
  const command = parseTaskCommand(rawContent);

  if (!command) {
    return null;
  }

  switch (command.kind) {
    case "note-add": {
      const { error } = await supabase.from("notes").insert({
        user_id: userId,
        title: command.title,
        content: command.content,
      });

      if (error) {
        return `Task action failed: ${error.message}`;
      }

      return `Task action successful: created note "${command.title}".`;
    }
    case "note-update": {
      const noteId = await resolveNoteId(supabase, userId, command.target);
      if (!noteId) {
        return `Task action failed: note "${command.target}" was not found.`;
      }

      const { data, error } = await supabase
        .from("notes")
        .update({
          content: command.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        return `Task action failed: ${error.message}`;
      }

      if (!data) {
        return `Task action failed: note "${command.target}" was not found.`;
      }

      return `Task action successful: updated note "${command.target}".`;
    }
    case "note-delete": {
      const noteId = await resolveNoteId(supabase, userId, command.target);
      if (!noteId) {
        return `Task action failed: note "${command.target}" was not found.`;
      }

      const { data, error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        return `Task action failed: ${error.message}`;
      }

      if (!data) {
        return `Task action failed: note "${command.target}" was not found.`;
      }

      return `Task action successful: deleted note "${command.target}".`;
    }
    case "todo-add": {
      const { error } = await supabase.from("todos").insert({
        user_id: userId,
        title: command.title,
        completed: false,
      });

      if (error) {
        return `Task action failed: ${error.message}`;
      }

      return `Task action successful: created todo "${command.title}".`;
    }
    case "todo-update": {
      const todoId = await resolveTodoId(supabase, userId, command.target);
      if (!todoId) {
        return `Task action failed: todo "${command.target}" was not found.`;
      }

      const { data, error } = await supabase
        .from("todos")
        .update({ title: command.title, updated_at: new Date().toISOString() })
        .eq("id", todoId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        return `Task action failed: ${error.message}`;
      }

      if (!data) {
        return `Task action failed: todo "${command.target}" was not found.`;
      }

      return `Task action successful: updated todo "${command.target}".`;
    }
    case "todo-complete": {
      const todoId = await resolveTodoId(supabase, userId, command.target);
      if (!todoId) {
        return `Task action failed: todo "${command.target}" was not found.`;
      }

      const { data, error } = await supabase
        .from("todos")
        .update({ completed: true, updated_at: new Date().toISOString() })
        .eq("id", todoId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        return `Task action failed: ${error.message}`;
      }

      if (!data) {
        return `Task action failed: todo "${command.target}" was not found.`;
      }

      return `Task action successful: marked todo "${command.target}" complete.`;
    }
    case "todo-reopen": {
      const todoId = await resolveTodoId(supabase, userId, command.target);
      if (!todoId) {
        return `Task action failed: todo "${command.target}" was not found.`;
      }

      const { data, error } = await supabase
        .from("todos")
        .update({ completed: false, updated_at: new Date().toISOString() })
        .eq("id", todoId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        return `Task action failed: ${error.message}`;
      }

      if (!data) {
        return `Task action failed: todo "${command.target}" was not found.`;
      }

      return `Task action successful: reopened todo "${command.target}".`;
    }
    case "todo-delete": {
      const todoId = await resolveTodoId(supabase, userId, command.target);
      if (!todoId) {
        return `Task action failed: todo "${command.target}" was not found.`;
      }

      const { data, error } = await supabase
        .from("todos")
        .delete()
        .eq("id", todoId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        return `Task action failed: ${error.message}`;
      }

      if (!data) {
        return `Task action failed: todo "${command.target}" was not found.`;
      }

      return `Task action successful: deleted todo "${command.target}".`;
    }
    default:
      return null;
  }
}
