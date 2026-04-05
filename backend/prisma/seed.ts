import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Category definitions with keywords ──────────────────────────
const CATEGORIES = [
  {
    name: 'Business',
    slug: 'business',
    description: 'Insights on building, scaling, and managing modern businesses.',
    keywords: ['business', 'brand', 'branding', 'b2b', 'marketing', 'growth', 'revenue', 'company', 'companies', 'corporate', 'market', 'investor', 'esg', 'startup'],
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Exploring AI, data, digital transformation, and emerging tech trends.',
    keywords: ['technology', 'tech', 'data', 'ai', 'digital', 'software', 'automation', 'cloud', 'api', 'machine learning', 'analytics', 'cyber'],
  },
  {
    name: 'Strategy',
    slug: 'strategy',
    description: 'Strategic thinking for leaders navigating complex challenges.',
    keywords: ['strategy', 'strategic', 'accountability', 'remote work', 'future of work', 'culture', 'planning', 'framework', 'competitive', 'innovation', 'adapting'],
  },
  {
    name: 'Leadership',
    slug: 'leadership',
    description: 'Perspectives on effective leadership, management, and team building.',
    keywords: ['leadership', 'leader', 'management', 'team', 'ceo', 'executive', 'traits', 'mentor', 'decision', 'hiring'],
  },
];

function extractText(content: unknown): string {
  if (!Array.isArray(content)) return '';
  return content
    .map((block: Record<string, unknown>) => {
      if (typeof block.text === 'string') return block.text;
      if (Array.isArray(block.items)) return block.items.map((i: unknown) => typeof i === 'string' ? i : (i as Record<string, unknown>)?.question + ' ' + (i as Record<string, unknown>)?.answer).join(' ');
      return '';
    })
    .join(' ');
}

function matchCategories(title: string, content: unknown, categoryMap: Map<string, { id: string; keywords: string[] }>): string[] {
  const text = (title + ' ' + extractText(content)).toLowerCase();
  const matched: string[] = [];

  for (const [id, { keywords }] of categoryMap) {
    if (keywords.some(kw => text.includes(kw))) {
      matched.push(id);
    }
  }

  // If nothing matched, put it in Business as a default
  if (matched.length === 0) {
    const businessId = [...categoryMap.entries()].find(([, v]) => v.keywords.includes('business'))?.[0];
    if (businessId) matched.push(businessId);
  }

  return matched;
}

async function main() {
  console.log('🌱 Seeding categories...\n');

  // Upsert categories
  const categoryMap = new Map<string, { id: string; keywords: string[] }>();

  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { name: cat.name, slug: cat.slug, description: cat.description },
    });
    categoryMap.set(category.id, { id: category.id, keywords: cat.keywords });
    console.log(`  ✅ ${cat.name} (${category.id})`);
  }

  // Auto-categorize all existing posts
  console.log('\n📝 Auto-categorizing existing posts...\n');

  const posts = await prisma.post.findMany({
    select: { id: true, title: true, content: true },
  });

  for (const post of posts) {
    const matchedIds = matchCategories(post.title, post.content, categoryMap);

    // Remove old category links and create new ones
    await prisma.postCategory.deleteMany({ where: { postId: post.id } });
    await prisma.postCategory.createMany({
      data: matchedIds.map(categoryId => ({ postId: post.id, categoryId })),
    });

    const categoryNames = matchedIds.map(id => {
      const cat = CATEGORIES.find(c => {
        const entry = [...categoryMap.entries()].find(([cid]) => cid === id);
        return entry && c.keywords === entry[1].keywords;
      });
      return cat?.name || id;
    });

    console.log(`  📄 "${post.title}" → [${categoryNames.join(', ')}]`);
  }

  console.log(`\n✅ Done! ${CATEGORIES.length} categories, ${posts.length} posts categorized.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
