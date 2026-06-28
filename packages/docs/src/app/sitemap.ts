import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const docsRoutes = [
    '', '/getting-started', '/structure', '/routing', '/middleware', 
    '/validation', '/auth', '/errors', '/swagger', '/cli', '/config', '/plugins'
  ];

  const docsSitemap = docsRoutes.map((route) => ({
    url: \`https://zerra.dev/docs\${route}\`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 0.9 : 0.8,
  }));

  return [
    {
      url: 'https://zerra.dev',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...docsSitemap,
    {
      url: 'https://zerra.dev/showcase',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://zerra.dev/benchmarks',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
