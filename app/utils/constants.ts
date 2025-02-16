import type { Template } from '~/types/template';

export const WORK_DIR_NAME = 'project';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const MODIFICATIONS_TAG_NAME = 'biela_file_modifications';
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
export const PROVIDER_REGEX = /\[Provider: (.*?)\]\n\n/;
export const PROMPT_COOKIE_KEY = 'cachedPrompt';

// Starter Templates
export const STARTER_TEMPLATES: Template[] = [
  {
    name: 'biela-astro-basic',
    label: 'Astro Basic',
    description: 'Lightweight Astro starter template for building fast static websites',
    githubRepo: 'thecodacus/biela-astro-basic-template',
    tags: ['astro', 'blog', 'performance'],
    icon: 'i-biela:astro',
  },
  {
    name: 'biela-nextjs-shadcn',
    label: 'Next.js with shadcn/ui',
    description: 'Next.js starter fullstack template integrated with shadcn/ui components and styling system',
    githubRepo: 'thecodacus/biela-nextjs-shadcn-template',
    tags: ['nextjs', 'react', 'typescript', 'shadcn', 'tailwind'],
    icon: 'i-biela:nextjs',
  },
  {
    name: 'biela-qwik-ts',
    label: 'Qwik TypeScript',
    description: 'Qwik framework starter with TypeScript for building resumable applications',
    githubRepo: 'thecodacus/biela-qwik-ts-template',
    tags: ['qwik', 'typescript', 'performance', 'resumable'],
    icon: 'i-biela:qwik',
  },
  {
    name: 'biela-remix-ts',
    label: 'Remix TypeScript',
    description: 'Remix framework starter with TypeScript for full-stack web applications',
    githubRepo: 'thecodacus/biela-remix-ts-template',
    tags: ['remix', 'typescript', 'fullstack', 'react'],
    icon: 'i-biela:remix',
  },
  {
    name: 'biela-slidev',
    label: 'Slidev Presentation',
    description: 'Slidev starter template for creating developer-friendly presentations using Markdown',
    githubRepo: 'thecodacus/biela-slidev-template',
    tags: ['slidev', 'presentation', 'markdown'],
    icon: 'i-biela:slidev',
  },
  {
    name: 'biela-sveltekit',
    label: 'SvelteKit',
    description: 'SvelteKit starter template for building fast, efficient web applications',
    githubRepo: 'biela-sveltekit-template',
    tags: ['svelte', 'sveltekit', 'typescript'],
    icon: 'i-biela:svelte',
  },
  {
    name: 'vanilla-vite',
    label: 'Vanilla + Vite',
    description: 'Minimal Vite starter template for vanilla JavaScript projects',
    githubRepo: 'thecodacus/vanilla-vite-template',
    tags: ['vite', 'vanilla-js', 'minimal'],
    icon: 'i-biela:vite',
  },
  {
    name: 'biela-vite-react',
    label: 'React + Vite + typescript',
    description: 'React starter template powered by Vite for fast development experience',
    githubRepo: 'thecodacus/biela-vite-react-ts-template',
    tags: ['react', 'vite', 'frontend'],
    icon: 'i-biela:react',
  },
  {
    name: 'biela-vite-ts',
    label: 'Vite + TypeScript',
    description: 'Vite starter template with TypeScript configuration for type-safe development',
    githubRepo: 'thecodacus/biela-vite-ts-template',
    tags: ['vite', 'typescript', 'minimal'],
    icon: 'i-biela:typescript',
  },
  {
    name: 'biela-vue',
    label: 'Vue.js',
    description: 'Vue.js starter template with modern tooling and best practices',
    githubRepo: 'thecodacus/biela-vue-template',
    tags: ['vue', 'typescript', 'frontend'],
    icon: 'i-biela:vue',
  },
  {
    name: 'biela-angular',
    label: 'Angular Starter',
    description: 'A modern Angular starter template with TypeScript support and best practices configuration',
    githubRepo: 'thecodacus/biela-angular-template',
    tags: ['angular', 'typescript', 'frontend', 'spa'],
    icon: 'i-biela:angular',
  },
];
