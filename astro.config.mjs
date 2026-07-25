import { defineConfig } from 'astro/config';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  site: 'https://kyaw-yethu.github.io',
  base: '/',
  vite: { plugins: [yaml()] },
});
