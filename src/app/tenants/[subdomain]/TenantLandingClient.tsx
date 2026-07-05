'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WEBSITE_TEMPLATES } from './templates';

interface TenantLandingClientProps {
  tenant: any;
  subdomain: string;
}

function TemplateSelector({ tenant, subdomain }: TenantLandingClientProps) {
  const searchParams = useSearchParams();
  const templateQuery = searchParams.get('template');
  const isPreview = searchParams.get('preview') === 'true';

  // Resolve template: query param first, then tenant config, then default fallback
  let templateId = (
    templateQuery ||
    tenant?.template_id ||
    'template-001'
  ).toLowerCase();
  if (templateId === 'default') templateId = 'template-001';
  if (templateId === 'prohealth') templateId = 'template-002';
  if (templateId === 'genex') templateId = 'template-003';

  // Override tenant data live with query parameters in builder preview mode
  let activeTenant = { ...tenant };
  if (isPreview) {
    activeTenant.brand_color_primary = searchParams.get('primary') || activeTenant.brand_color_primary;
    activeTenant.brand_color_secondary = searchParams.get('secondary') || activeTenant.brand_color_secondary;
    activeTenant.name = searchParams.get('title') || activeTenant.name;
    activeTenant.website_description = searchParams.get('desc') || activeTenant.website_description;
    activeTenant.phone = searchParams.get('phone') || activeTenant.phone;
    activeTenant.email = searchParams.get('email') || activeTenant.email;
    activeTenant.address = searchParams.get('address') || activeTenant.address;
    activeTenant.logo_url = searchParams.get('logo') || activeTenant.logo_url;
    activeTenant.hero_headline = searchParams.get('headline') || activeTenant.hero_headline;
    activeTenant.hero_subheadline = searchParams.get('subheadline') || activeTenant.hero_subheadline;
    activeTenant.hero_button_text = searchParams.get('btn') || activeTenant.hero_button_text;
    activeTenant.hero_bg_image = searchParams.get('bg') || activeTenant.hero_bg_image;
  }

  const SelectedTemplate =
    WEBSITE_TEMPLATES[templateId] || WEBSITE_TEMPLATES['template-001'];

  return <SelectedTemplate tenant={activeTenant} subdomain={subdomain} />;
}

export default function TenantLandingClient({
  tenant,
  subdomain,
}: TenantLandingClientProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center text-[#42474d] text-xs font-semibold">
          Loading website...
        </div>
      }
    >
      <TemplateSelector tenant={tenant} subdomain={subdomain} />
    </Suspense>
  );
}
