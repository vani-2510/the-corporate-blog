/**
 * seed-posts.ts  — Direct Prisma seeder (no API calls needed)
 * Run: npx ts-node --project tsconfig.json scripts/seed-posts.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { prisma } from '../src/utils/prisma';
import { generateUniqueSlug } from '../src/utils/slug';

/* ─────────────── 10 Sample Posts ─────────────── */
const POSTS = [
  {
    title: 'The Future of Remote Work: How Companies Are Adapting in 2024',
    excerpt: 'As remote work becomes permanent, leaders are rethinking culture, productivity, and office strategy.',
    content: [
      { type: 'paragraph', text: 'The pandemic-driven experiment with remote work has evolved into a permanent restructuring of how companies operate. Organizations are codifying hybrid policies, investing in digital infrastructure, and reimagining office space as a collaboration hub.' },
      { type: 'heading', level: 2, text: 'The Hybrid Model Dominates' },
      { type: 'paragraph', text: 'Over 74% of Fortune 500 companies now operate on a formal hybrid schedule. The traditional five-day office week is effectively extinct for knowledge workers.' },
      { type: 'list', ordered: false, items: ['Async-first communication policies', 'Results-based performance measurement', 'Digital-first onboarding programs', 'Flexible core hours across time zones'] },
      { type: 'callout', calloutType: 'info', text: 'Companies that invest in deliberate culture-building in remote settings see 23% higher employee retention rates.' },
    ],
  },
  {
    title: 'Why Every Business Needs a Data Strategy Before Launching AI',
    excerpt: 'AI is only as powerful as the data behind it. Most companies jump to AI tools before building the foundation that makes them work.',
    content: [
      { type: 'paragraph', text: 'Rushing to implement AI without a solid data foundation is one of the most common and costly mistakes enterprises make today.' },
      { type: 'heading', level: 2, text: 'The Data Foundation Problem' },
      { type: 'paragraph', text: 'Before a single AI model can deliver business value, organizations need data that is clean, structured, accessible, and governed.' },
      { type: 'blockquote', text: 'Companies winning with AI are those with the cleanest, best-governed data, not necessarily the most sophisticated models.', author: 'Chief Data Officer, Fortune 100 Firm' },
      { type: 'list', ordered: true, items: ['Audit existing data sources and quality', 'Establish governance policies', 'Implement a unified data platform', 'Define KPIs AI will measurably impact', 'Run a focused pilot before scaling'] },
    ],
  },
  {
    title: 'Corporate Communication in the Age of Social Media',
    excerpt: 'When every executive is a brand and every employee is a publisher, corporate communication requires a fundamentally new strategy.',
    content: [
      { type: 'paragraph', text: 'The boundaries between corporate communication and social media have dissolved. A single tweet from a mid-level employee can move markets.' },
      { type: 'heading', level: 2, text: 'The End of Message Control' },
      { type: 'paragraph', text: 'Traditional corporate PR operated on a controlled-release model. That model is dead. Organizations now need communication cultures built on clarity of values, not control of messages.' },
      { type: 'list', ordered: false, items: ['Train spokespeople at every level', 'Create clear employee social media guidelines', 'Establish rapid response protocols for crises', 'Invest in executive thought leadership', 'Monitor brand conversation in real time'] },
    ],
  },
  {
    title: 'The Leadership Traits That Actually Drive Business Growth',
    excerpt: 'Decades of research reveals a surprising disconnect between popular leadership mythology and what actually produces results.',
    content: [
      { type: 'paragraph', text: 'Business culture celebrates bold, charismatic leaders. Yet the research tells a different story about what makes leadership actually effective at driving sustainable growth.' },
      { type: 'heading', level: 2, text: 'What the Research Actually Shows' },
      { type: 'paragraph', text: 'Jim Collins\' landmark study found that leaders who delivered sustained results were consistently humble, highly disciplined, and intensely focused on long-term interests.' },
      { type: 'list', ordered: false, items: ['Intellectual humility', 'Long-termism over quarterly pressure', 'Team credit, personal blame', 'Talent development as core function', 'Decision clarity in ambiguity'] },
    ],
  },
  {
    title: 'How to Build a Culture of Accountability Without Killing Creativity',
    excerpt: 'The tension between accountability and innovation is one of the central leadership challenges of our time.',
    content: [
      { type: 'paragraph', text: 'Leaders who attempt to drive accountability by tightening control often get compliance, not commitment. Teams follow the rules but stop bringing their best ideas.' },
      { type: 'heading', level: 2, text: 'Accountability is About Commitment, Not Control' },
      { type: 'paragraph', text: 'True accountability is a culture of voluntary commitment to shared outcomes, not a system of monitoring and consequences.' },
      { type: 'callout', calloutType: 'success', text: 'Teams with high psychological safety have 26% lower turnover and deliver measurably more innovative outputs.' },
      { type: 'list', ordered: true, items: ['Define outcomes, not activities', 'Make commitments public and explicit', 'Create rituals for progress reviews', 'Celebrate honest failure and learning', 'Model accountability from the top'] },
    ],
  },
  {
    title: 'The ESG Reckoning: What Investors Are Actually Looking for in 2024',
    excerpt: 'ESG metrics have evolved from PR talking points to hard financial criteria used by institutional investors managing trillions.',
    content: [
      { type: 'paragraph', text: 'The ESG conversation has matured. Institutional investors — who collectively manage over $100 trillion in assets — now demand quantifiable, auditable data.' },
      { type: 'heading', level: 2, text: 'What Investors Actually Want to See' },
      { type: 'list', ordered: false, items: ['Scope 1, 2, and 3 emissions data', 'Board diversity metrics', 'Supply chain human rights audit results', 'CEO pay ratio with trend data', 'Climate scenario analysis'] },
      { type: 'callout', calloutType: 'warning', text: 'SEC climate disclosure rules require most public companies to report material climate risks beginning 2025.' },
    ],
  },
  {
    title: 'Mergers & Acquisitions: Why Most Deals Still Fail to Create Value',
    excerpt: 'Despite decades of M&A research, the majority of corporate acquisitions still fail to generate the expected returns.',
    content: [
      { type: 'paragraph', text: 'Between 70-90% of mergers and acquisitions fail to create the value projected in the deal thesis. Yet the M&A market remains intensely active.' },
      { type: 'heading', level: 2, text: 'The Top Reasons Deals Fail' },
      { type: 'list', ordered: true, items: ['Overpayment driven by competition and ego', 'Culture integration underestimated', 'Technology integration mismanaged', 'Customer churn during transition', 'Talent exodus of key people'] },
      { type: 'blockquote', text: 'The deal is the easy part. Integration is where value is made or destroyed.', author: 'Senior M&A Partner, Global Advisory Firm' },
    ],
  },
  {
    title: 'Supply Chain Resilience: Lessons From the Disruptions of the Past Five Years',
    excerpt: 'The pandemic and geopolitical conflict have forced a fundamental rethinking of global supply chain design.',
    content: [
      { type: 'paragraph', text: 'Five years of compounding disruption have exposed the fragility built into just-in-time supply chains optimized for cost efficiency.' },
      { type: 'heading', level: 2, text: 'From Efficiency to Resilience' },
      { type: 'paragraph', text: 'Single-source suppliers and minimal inventory buffers were features of an efficient system. They became catastrophic vulnerabilities when the unexpected occurred.' },
      { type: 'list', ordered: false, items: ['Nearshoring gaining momentum', 'Strategic inventory buffers being rebuilt', 'Supplier diversification at board level', 'Real-time visibility platforms scaling', 'Geopolitical risk in procurement decisions'] },
      { type: 'callout', calloutType: 'info', text: 'Companies with diversified supply chains recovered 40% faster from pandemic disruptions.' },
    ],
  },
  {
    title: 'The CFO as Strategic Partner: How Finance Leaders Are Expanding Their Role',
    excerpt: "Today's top finance leaders are co-architects of corporate strategy, not just guardians of financial controls.",
    content: [
      { type: 'paragraph', text: 'The CFO role has undergone a fundamental transformation. Modern CFOs are expected to be strategic co-pilots to the CEO, not just accounting overseers.' },
      { type: 'heading', level: 2, text: 'The New CFO Mandate' },
      { type: 'list', ordered: false, items: ['Capital allocation as a competitive weapon', 'FP&A as real-time business intelligence', 'M&A evaluation and integration oversight', 'ESG financial reporting', 'Technology investment prioritization'] },
      { type: 'callout', calloutType: 'info', text: '72% of CEOs view their CFO as their most critical strategic business partner (PwC survey).' },
    ],
  },
  {
    title: 'Building a B2B Brand: Why Most Companies Get It Wrong',
    excerpt: 'Most B2B companies treat branding as a luxury. Research shows strong B2B brands outperform weak ones by 20% on shareholder returns.',
    content: [
      { type: 'paragraph', text: 'Most B2B executives redirect brand conversations toward pipeline metrics. This perspective is costing them measurably.' },
      { type: 'heading', level: 2, text: 'The B2B Brand Premium is Real' },
      { type: 'paragraph', text: 'Only 5% of your B2B target market is actively buying at any given time. Brand presence in the other 95% is what creates pricing power and preference.' },
      { type: 'blockquote', text: 'Brand is not a marketing expense. It is the compound interest on your commercial investment.', author: 'B2B Marketing Leader' },
      { type: 'list', ordered: false, items: ['Define a distinctive industry point of view', 'Invest consistently in thought leadership', 'Train executives as public voices', 'Create identity that stands apart', 'Measure brand strength alongside demand metrics'] },
      { type: 'faq', items: [{ question: 'How long does B2B brand building take to show ROI?', answer: 'Brand investments typically show measurable impact on win rates within 18-24 months, accelerating significantly after three years of consistent investment.' }, { question: 'Should we prioritize brand or demand generation?', answer: 'Research shows optimal B2B programs invest roughly 40% in brand awareness and 60% in demand generation. Either alone significantly underperforms the combination.' }] },
    ],
  },
];

async function seed() {
  console.log('\n🌱  Seeding 10 sample blog posts...\n');

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) { console.error('❌ No admin user. Run seed-admin.ts first.'); process.exit(1); }
  console.log(`👤  Admin: ${admin.name}\n`);

  let ok = 0;
  for (const p of POSTS) {
    process.stdout.write(`  ✍️  ${p.title.slice(0, 55)}...  `);
    try {
      const slug = await generateUniqueSlug(p.title);
      await prisma.post.create({
        data: {
          title: p.title,
          slug,
          excerpt: p.excerpt,
          content: p.content as object,
          seoTitle: p.title,
          seoDescription: p.excerpt,
          status: 'PUBLISHED',
          publishedAt: new Date(Date.now() - Math.floor(Math.random() * 25 * 24 * 60 * 60 * 1000)),
          authorId: admin.id,
        },
      });
      console.log('✅');
      ok++;
    } catch (e: unknown) {
      console.log(`❌  ${e instanceof Error ? e.message : e}`);
    }
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n  ✅  ${ok}/${POSTS.length} posts published successfully\n`);
  await prisma.$disconnect();
}

seed().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
