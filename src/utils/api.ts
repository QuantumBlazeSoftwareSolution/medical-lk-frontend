const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function getSubdomain(): string {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (hostname.includes('localhost')) {
    // e.g. test.localhost -> parts = ["test", "localhost"]
    if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== '127') {
      return parts[0];
    }
  } else {
    // e.g. test.medical.lk -> parts = ["test", "medical", "lk"]
    if (parts.length > 2 && parts[0] !== 'www') {
      return parts[0];
    }
  }
  return '';
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const subdomain = getSubdomain();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (subdomain) {
    headers.set('X-Tenant-Subdomain', subdomain);
  }
  
  // Only set Content-Type to application/json if we are not sending multipart (for logo uploads later)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'An error occurred during the request.');
  }

  return response.json();
}
export { BASE_URL };
