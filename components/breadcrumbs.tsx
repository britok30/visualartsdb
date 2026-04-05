import Link from "next/link";
import { JsonLd } from "./json-ld";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href && {
        item: `https://www.visualartsdb.com${item.href}`,
      }),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-400">
        <ol className="flex items-center gap-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {item.href && i < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-neutral-600"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-neutral-500">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
