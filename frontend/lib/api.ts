import { Post, PostsResponse, Category, Author } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('accessToken')
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

// ── Posts ──────────────────────────────────────────────────────

export async function getPublishedPosts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  author?: string;
}): Promise<PostsResponse> {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.category) search.set('category', params.category);
  if (params?.author) search.set('author', params.author);
  return apiFetch<PostsResponse>(`/posts?${search}`);
}

export async function getPostBySlug(slug: string): Promise<{ post: Post }> {
  return apiFetch<{ post: Post }>(`/posts/slug/${slug}`);
}

export async function getPopularPosts(): Promise<{ posts: Post[] }> {
  return apiFetch<{ posts: Post[] }>('/posts/popular');
}

export async function getRelatedPosts(postId: string): Promise<{ suggestions: Partial<Post>[] }> {
  return apiFetch<{ suggestions: Partial<Post>[] }>(`/posts/${postId}/internal-suggestions`);
}

// ── Categories ─────────────────────────────────────────────────

export async function getCategories(): Promise<{ categories: Category[] }> {
  return apiFetch<{ categories: Category[] }>('/categories');
}

export async function getCategoryPosts(slug: string, page = 1): Promise<{
  category: Category;
  posts: Post[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  return apiFetch(`/categories/${slug}/posts?page=${page}`);
}

// ── Search ─────────────────────────────────────────────────────

export async function searchPosts(q: string, page = 1): Promise<{
  query: string;
  posts: Partial<Post>[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  return apiFetch(`/search?q=${encodeURIComponent(q)}&page=${page}`);
}

// ── Auth ────────────────────────────────────────────────────────

export async function loginWithGoogle(idToken: string): Promise<{ user: Author; accessToken: string }> {
  return apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}
