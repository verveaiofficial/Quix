import { supabase } from "./supabase";
import type { ChatMessage } from "../store/chatStore";

export interface ChatRecord {
  id: string;
  title: string;
  updated_at: string;
}

export async function fetchChats(): Promise<ChatRecord[]> {
  const { data, error } = await supabase
    .from("chats")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data as ChatRecord[];
}

export async function createChat(title: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("chats")
    .insert({ title })
    .select("id")
    .single();

  if (error || !data) return null;

  return data.id as string;
}

export async function renameChat(id: string, title: string): Promise<void> {
  await supabase
    .from("chats")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function deleteChat(id: string): Promise<void> {
  await supabase.from("chats").delete().eq("id", id);
}

export async function touchChat(id: string): Promise<void> {
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function fetchMessages(chatId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, model, content, status, kind, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    role: row.role,
    model: row.model,
    content: row.content,
    createdAt: new Date(row.created_at).getTime(),
    status: row.status || "done",
    kind: row.kind || "text",
  }));
}

export async function insertMessage(
  chatId: string,
  message: ChatMessage
): Promise<void> {
  await supabase.from("messages").insert({
    id: message.id,
    chat_id: chatId,
    role: message.role,
    model: message.model,
    content: message.content,
    status: message.status || "done",
    kind: message.kind || "text",
  });
}
