import { type BlogPost } from '@/types/content'

// NOTE: Sample articles. Replace with real content when available.
const posts: BlogPost[] = [
  {
    slug: 'role-of-nutraceuticals-in-everyday-wellness',
    title: 'The Role of Nutraceuticals in Everyday Wellness',
    excerpt:
      'Nutraceuticals sit at the intersection of nutrition and healthcare. Here is how they support balanced, everyday wellbeing.',
    category: 'Nutrition',
    author: 'NutriAdd Team',
    date: '2026-06-15',
    readingTime: 5,
    content: [
      {
        type: 'paragraph',
        text: 'The word “nutraceutical” blends “nutrition” and “pharmaceutical”, and that is exactly what these products aim to deliver: the nourishment of food with the reliability of a carefully formulated healthcare product. From multivitamins to specialised supplements, nutraceuticals help fill the gaps that busy modern lifestyles often leave behind.',
      },
      {
        type: 'heading',
        text: 'What makes a good nutraceutical?',
      },
      {
        type: 'paragraph',
        text: 'Quality begins long before a product reaches the shelf. It starts with responsible sourcing, precise formulation and rigorous quality control at every stage of manufacturing.',
      },
      {
        type: 'list',
        items: [
          'Clearly stated ingredients and dosages',
          'Consistent quality assurance across batches',
          'Formulations backed by nutritional science',
          'Trusted manufacturing and distribution partners',
        ],
      },
      {
        type: 'paragraph',
        text: 'At NutriAdd, our nutraceutical range spans calcium and iron preparations, multivitamins, antioxidants and more — each held to the same standard of care that defines everything we do.',
      },
    ],
  },
  {
    slug: 'why-vitamin-d-matters',
    title: 'Why Vitamin D Matters More Than You Think',
    excerpt:
      'Often called the “sunshine vitamin”, vitamin D plays a quiet but essential role in overall health. Here is why it deserves attention.',
    category: 'Wellness',
    author: 'NutriAdd Team',
    date: '2026-05-20',
    readingTime: 4,
    content: [
      {
        type: 'paragraph',
        text: 'Vitamin D is unique among nutrients because our bodies can produce it through sunlight exposure. Yet with indoor lifestyles becoming the norm, many people do not get as much as they need.',
      },
      {
        type: 'heading',
        text: 'The everyday importance of vitamin D',
      },
      {
        type: 'list',
        items: [
          'Supports the absorption of calcium for healthy bones',
          'Contributes to normal muscle function',
          'Plays a role in supporting the immune system',
        ],
      },
      {
        type: 'paragraph',
        text: 'A balanced approach — sensible sun exposure, a varied diet and, where appropriate, quality supplementation — can help maintain healthy levels. As always, speak with a healthcare professional before starting any new supplement.',
      },
    ],
  },
  {
    slug: 'choosing-the-right-infant-formula',
    title: "Choosing the Right Infant Formula: A Parent's Guide",
    excerpt:
      'With so many options available, selecting an infant formula can feel overwhelming. A few simple principles can make the decision clearer.',
    category: 'Nutrition',
    author: 'NutriAdd Team',
    date: '2026-04-10',
    readingTime: 6,
    content: [
      {
        type: 'paragraph',
        text: 'Every child is different, and choosing the right formula is an important decision for many families. Understanding the common stages and options can help parents feel more confident.',
      },
      {
        type: 'heading',
        text: 'Understanding the stages',
      },
      {
        type: 'list',
        items: [
          'Stage 1 (Basic): designed for the earliest months',
          'Stage 2 (Growing): tailored for older infants as needs change',
          'Lactose-Free: an option for specific dietary requirements',
        ],
      },
      {
        type: 'paragraph',
        text: 'Our infant formula range is developed with these stages in mind, giving families dependable options at every step. A paediatrician’s guidance remains the best starting point for any feeding decision.',
      },
    ],
  },
  {
    slug: 'our-commitment-to-quality',
    title: 'Our Commitment to Quality in Every Product',
    excerpt:
      'Quality is not a single step in our process — it runs through everything we do. Here is what that commitment looks like in practice.',
    category: 'Company News',
    author: 'NutriAdd Team',
    date: '2026-02-28',
    readingTime: 4,
    content: [
      {
        type: 'paragraph',
        text: 'For over 15 years, our reputation has been built on a simple idea: quality encompasses every aspect of our work. It is a promise we make to the clients, partners and communities we serve.',
      },
      {
        type: 'heading',
        text: 'Quality at every stage',
      },
      {
        type: 'paragraph',
        text: 'From selecting trusted principals to maintaining a dependable distribution network through our sister concern FAMS Pharma Care, we hold every stage of our work to a high standard.',
      },
      {
        type: 'list',
        items: [
          'Partnerships with established, reputable manufacturers',
          'Careful handling and reliable nationwide distribution',
          'A relentless focus on customer satisfaction',
        ],
      },
      {
        type: 'paragraph',
        text: 'As we continue to grow, our commitment stays the same — caring for a healthier life, one trusted product at a time.',
      },
    ],
  },
]

export function getAllPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug)
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug)
  if (!current) return []

  return getAllPosts()
    .filter((post) => post.slug !== slug && post.category === current.category)
    .slice(0, limit)
}

export const blogCategories = Array.from(
  new Set(posts.map((post) => post.category))
)
