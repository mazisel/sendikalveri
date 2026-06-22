import type { MetadataRoute } from 'next';
import { getConfederations, getSectors, getUnions } from '@/lib/data';

export const dynamic = "force-dynamic"; // build'de değil, runtime'da Supabase'den üret

const baseUrl = 'https://sendikalveri.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [unions, sectors, confederations] = await Promise.all([
    getUnions('all', ''),
    getSectors('all'),
    getConfederations('all'),
  ]);

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
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kvkk`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const unionUrls: MetadataRoute.Sitemap = unions.map((union) => ({
    url: `${baseUrl}/sendikalar/${union.type}/${union.source_id}`,
    lastModified: union.updated_at ? new Date(union.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const sectorUrls: MetadataRoute.Sitemap = sectors.map((sector) => ({
    url: `${baseUrl}/is-kollari/${sector.type}/${sector.source_id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const confederationUrls: MetadataRoute.Sitemap = confederations.map((conf) => ({
    url: `${baseUrl}/konfederasyonlar/${conf.type}/${conf.source_id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  return [...staticUrls, ...unionUrls, ...sectorUrls, ...confederationUrls];
}
