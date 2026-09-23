import { z } from 'zod';
import { apiFetch } from './client';

export const postSchema = z.object({
  id: z.string(),
  userId: z.string(),
  authorName: z.string(),
  body: z.string(),
  activityId: z.string().nullable().optional(),
  likeCount: z.number(),
  commentCount: z.number(),
  likedByMe: z.boolean().optional(),
  createdAt: z.string(),
});
export type Post = z.infer<typeof postSchema>;

export const commentSchema = z.object({
  id: z.string(), postId: z.string(), userId: z.string(),
  authorName: z.string(), body: z.string(), createdAt: z.string(),
});
export type PostComment = z.infer<typeof commentSchema>;

export async function listPosts(token: string) {
  const res = await apiFetch<unknown>('/v1/feed', { authToken: token });
  return z.object({ posts: z.array(postSchema) }).parse(res).posts;
}
export async function createPost(token: string, body: string) {
  const res = await apiFetch<unknown>('/v1/feed', { method: 'POST', authToken: token, body: JSON.stringify({ body }) });
  return z.object({ post: postSchema }).parse(res).post;
}
export async function toggleReaction(token: string, postId: string) {
  const res = await apiFetch<unknown>(`/v1/feed/${postId}/reactions`, { method: 'POST', authToken: token, body: '{}' });
  return z.object({ liked: z.boolean(), likeCount: z.number() }).parse(res);
}
export async function listComments(token: string, postId: string) {
  const res = await apiFetch<unknown>(`/v1/feed/${postId}/comments`, { authToken: token });
  return z.object({ comments: z.array(commentSchema) }).parse(res).comments;
}
export async function addComment(token: string, postId: string, body: string) {
  const res = await apiFetch<unknown>(`/v1/feed/${postId}/comments`, {
    method: 'POST', authToken: token, body: JSON.stringify({ body }),
  });
  return z.object({ comment: commentSchema }).parse(res).comment;
}
