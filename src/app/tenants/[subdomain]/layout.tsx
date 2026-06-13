import { Metadata } from 'next';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const subdomain = resolvedParams.subdomain;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tenant/public`,
      {
        cache: 'no-store',
        headers: {
          'X-Tenant-Subdomain': subdomain,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      return {
        title: 'Medical.lk',
      };
    }

    const tenant = await res.json();
    if (!tenant) {
      return {
        title: 'Medical.lk',
      };
    }

    const companyName = tenant.website_title || tenant.name || 'Medical.lk';
    const description = tenant.website_description || `${companyName} pharmacy portal`;
    const faviconUrl = tenant.favicon_url;
    const keywords = tenant.seo_keywords ? tenant.seo_keywords.split(',').map((k: string) => k.trim()) : undefined;

    if (faviconUrl) {
      return {
        title: `${companyName} | Pharmacy`,
        description,
        keywords,
        icons: {
          icon: [
            {
              url: faviconUrl,
              href: faviconUrl,
            },
          ],
          shortcut: faviconUrl,
          apple: faviconUrl,
        },
      };
    }

    return {
      title: `${companyName} | Pharmacy`,
      description,
      keywords,
    };
  } catch (e) {
    console.error('Error generating metadata server-side:', e);
    return {
      title: 'Medical.lk',
    };
  }
}

export default function TenantSubdomainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
