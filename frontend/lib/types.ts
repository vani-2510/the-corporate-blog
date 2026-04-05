export type Role = 'ADMIN' | 'EDITOR' | 'WRITER';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';

export interface Author {
  id: string;
  name: string;
  slug: string | null;
  avatar: string | null;
  bio?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { posts: number };
}

export interface Block {
  type: 'heading' | 'paragraph' | 'image' | 'list' | 'table' | 'blockquote' | 'faq' | 'callout' | 'youtube';
  [key: string]: unknown;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: Block[];
  status: PostStatus;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  isSponsored: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
  categories: Array<{ category: Category }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PostsResponse {
  posts: Post[];
  pagination: PaginationMeta;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
  slug?: string | null;
}
