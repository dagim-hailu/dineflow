import Link from 'next/link';

export type Breadcrumb = { name: string; link?: string };

export function SitePageHeader({
  title,
  breadcrumbs,
}: {
  title: string;
  breadcrumbs: Breadcrumb[];
}) {
  return (
    <section className="border-b border-white/10 bg-gradient-to-br from-dark-navy via-dark-navy to-dark-navy/90 pt-24 pb-12 text-center sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <nav className="mt-6" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
            {breadcrumbs.map((crumb, i) => {
              const last = i === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.name}-${i}`} className="flex items-center gap-2">
                  {i > 0 ? <span className="text-white/40">/</span> : null}
                  {crumb.link && !last ? (
                    <Link href={crumb.link} className="text-primary hover:underline">
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className={last ? 'text-white' : undefined}>{crumb.name}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </section>
  );
}
