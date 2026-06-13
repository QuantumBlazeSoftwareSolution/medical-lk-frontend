import React from 'react';
import { Activity } from 'lucide-react';
import TenantLandingClient from './TenantLandingClient';

export const dynamic = 'force-dynamic';

function ErrorView() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#42474d] gap-4 font-sans p-6 text-center">
      <Activity className="h-10 w-10 text-red-500 animate-pulse" />
      <h2 className="text-lg font-bold text-red-600">Pharmacy Website Not Found</h2>
      <p className="text-xs max-w-sm">Please verify the URL or ensure the pharmacy trial is active.</p>
    </div>
  );
}

export default async function TenantPublicPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const resolvedParams = await params;
  const subdomain = resolvedParams.subdomain;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tenant/public`, {
      cache: 'no-store',
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      return <ErrorView />;
    }

    const tenant = await res.json();
    if (!tenant) {
      return <ErrorView />;
    }

    return <TenantLandingClient tenant={tenant} subdomain={subdomain} />;
  } catch (e) {
    console.error("Error loading tenant public config:", e);
    return <ErrorView />;
  }
}
