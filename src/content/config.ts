import { defineCollection, z } from 'astro:content';

const link = z.object({ label: z.string(), href: z.string() });

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    date: z.coerce.date(),
    venue: z.string(),
    excerpt: z.string(),
    links: z.array(link).optional(),
    featured: z.boolean().default(false),
  }),
});

const research = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    links: z.array(link).optional(),
    featured: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
  }),
});

const sharing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    kind: z.enum(['teaching', 'talk']),
    date: z.coerce.date(),
    host: z.string().optional(),
    href: z.string().optional(),
  }),
});

export const collections = { publications, research, writing, sharing };
