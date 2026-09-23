import { z } from 'zod';
import { apiFetch } from './client';

export const conversationSchema = z.object({
  id: z.string(),
  peerName: z.string(),
  lastMessage: z.string(),
  unread: z.number(),
  updatedAt: z.string(),
});
export type Conversation = z.infer<typeof conversationSchema>;

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  sender: z.string(),
  body: z.string(),
  createdAt: z.string(),
});
export type Message = z.infer<typeof messageSchema>;

export async function listConversations(token: string) {
  const res = await apiFetch<unknown>('/v1/conversations', { authToken: token });
  return z.object({ conversations: z.array(conversationSchema) }).parse(res).conversations;
}
export async function listMessages(token: string, id: string) {
  const res = await apiFetch<unknown>(`/v1/conversations/${id}/messages`, { authToken: token });
  return z.object({ messages: z.array(messageSchema) }).parse(res).messages;
}
export async function sendMessage(token: string, id: string, body: string) {
  const res = await apiFetch<unknown>(`/v1/conversations/${id}/messages`, {
    method: 'POST', authToken: token, body: JSON.stringify({ body }),
  });
  return z.object({ message: messageSchema }).parse(res).message;
}
