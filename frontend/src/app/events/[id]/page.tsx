import EventPageClient from './page.client';

// Generate dummy paths for static export
export async function generateStaticParams() {
  // Generate a few dummy paths that will be replaced at runtime
  return [
    { id: 'placeholder-1' },
    { id: 'placeholder-2' },
    { id: 'placeholder-3' },
  ];
}

// This tells Next.js to generate pages on-demand
export const dynamicParams = true;

export default function EventPage() {
  return <EventPageClient />;
} 