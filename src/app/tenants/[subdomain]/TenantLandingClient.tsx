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
  
  // Resolve template: query param first, then tenant config, then default fallback
  let templateId = (templateQuery || tenant?.template_id || 'template-001').toLowerCase();
  if (templateId === 'default') templateId = 'template-001';
  if (templateId === 'prohealth') templateId = 'template-002';
  if (templateId === 'genex') templateId = 'template-003';
  
  const SelectedTemplate = WEBSITE_TEMPLATES[templateId] || WEBSITE_TEMPLATES['template-001'];
  
  return <SelectedTemplate tenant={tenant} subdomain={subdomain} />;
}

export default function TenantLandingClient({ tenant, subdomain }: TenantLandingClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center text-[#42474d] text-xs font-semibold">
        Loading website...
      </div>
    }>
      <TemplateSelector tenant={tenant} subdomain={subdomain} />
    </Suspense>
  );
}
