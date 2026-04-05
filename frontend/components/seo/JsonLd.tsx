import type { WithContext, BreadcrumbList, Person, FAQPage } from 'schema-dts';
import { Post } from '@/lib/types';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'The Corporate Blog';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thecorporateblog.com';

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function ArticleJsonLd({ post }: { post: Post }) {
  const faqBlocks = post.content.filter(b => b.type === 'faq');
  const hasFaq = faqBlocks.length > 0;

  // Note: isSponsored is added as a non-standard extension in serialized JSON only
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || '',
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    image: post.featuredImage ? [{
      '@type': 'ImageObject',
      url: post.featuredImage,
      description: post.featuredImageAlt || post.title,
    }] : undefined,
    author: {
      '@type': 'Person',
      name: post.author.name,
      image: post.author.avatar || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };

  const breadcrumbs: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  const faqSchema: WithContext<FAQPage> | null = hasFaq ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqBlocks.flatMap((block) => {
      const items = block.items as Array<{ question: string; answer: string }> | undefined;
      return (items || []).map(item => ({
        '@type': 'Question' as const,
        name: item.question,
        acceptedAnswer: { '@type': 'Answer' as const, text: item.answer },
      }));
    }),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
    </>
  );
}

export function AuthorJsonLd({ author }: { author: { name: string; slug?: string | null; bio?: string | null; avatar?: string | null } }) {
  const schema: WithContext<Person> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio || undefined,
    image: author.avatar || undefined,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function generatePostMetadata(post: Post) {
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || '';
  const canonical = post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article' as const,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: post.featuredImage ? [{ url: post.featuredImage, alt: post.featuredImageAlt || title }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}
