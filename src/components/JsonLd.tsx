import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

const JsonLd = ({ data }: JsonLdProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    script.id = `jsonld-${data["@type"]?.toLowerCase() || "generic"}`;
    
    // Remove existing script with same id
    const existing = document.getElementById(script.id);
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [data]);

  return null;
};

export const OrganizationJsonLd = () => (
  <JsonLd data={{
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "APA Bazaar",
    url: "https://jiji-kenya-sparkle.lovable.app",
    logo: "https://jiji-kenya-sparkle.lovable.app/og-image.png",
    description: "Kenya's leading online marketplace",
    sameAs: [],
    contactPoint: { "@type": "ContactPoint", contactType: "customer service", areaServed: "KE" },
  }} />
);

export const ProductJsonLd = ({ listing, categoryName, sellerName }: {
  listing: { title: string; description: string | null; price: number; images: string[]; location: string; created_at: string; currency?: string };
  categoryName?: string;
  sellerName?: string;
}) => (
  <JsonLd data={{
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description || listing.title,
    image: listing.images?.length > 0 ? listing.images : undefined,
    category: categoryName,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency || "KES",
      availability: "https://schema.org/InStock",
      seller: sellerName ? { "@type": "Person", name: sellerName } : undefined,
      areaServed: { "@type": "Country", name: "Kenya" },
    },
  }} />
);

export const WebSiteJsonLd = () => (
  <JsonLd data={{
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "APA Bazaar",
    url: "https://jiji-kenya-sparkle.lovable.app",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://jiji-kenya-sparkle.lovable.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }} />
);

export default JsonLd;
