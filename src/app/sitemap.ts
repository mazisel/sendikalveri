import type { MetadataRoute } from 'next';
import { getUnions } from '@/lib/data';

const baseUrl = 'https://sendikalveri.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const unions = await getUnions('all', '');

  const unionUrls: MetadataRoute.Sitemap = unions.map((union) => ({
    url: `${baseUrl}/sendikalar/${union.type}/${union.source_id}`,
    lastModified: union.updated_at ? new Date(union.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sendikalar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/is-kollari`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/konfederasyonlar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/istatistikler`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  return [...staticUrls, ...unionUrls];
}
