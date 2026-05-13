import { MarketingShell } from '@/components/marketing-shell';
import { SitePageHeader } from '@/components/site-page-header';

export default function TestimonialPage() {
  return (
    <MarketingShell>
      <SitePageHeader
        title="Testimonials"
        breadcrumbs={[
          { name: 'Home', link: '/' },
          { name: 'Pages', link: '#' },
          { name: 'Testimonial' },
        ]}
      />
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-primary">
            Testimonial
          </p>
          <h2 className="mt-2 text-center font-display text-3xl font-bold sm:text-4xl">
            Our clients say
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((num) => (
              <blockquote
                key={num}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <p className="text-sm italic text-muted-foreground">
                  Dolor et eos labore, stet justo sed est sed. Diam sed sed dolor stet amet eirmod
                  eos labore diam.
                </p>
                <footer className="mt-4 flex items-center gap-3">
                  <img
                    src={`/img/testimonial-${num}.jpg`}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Client name</p>
                    <p className="text-xs text-muted-foreground">Guest</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
