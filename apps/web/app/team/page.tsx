import { MarketingShell } from '@/components/marketing-shell';
import { SitePageHeader } from '@/components/site-page-header';

export default function TeamPage() {
  return (
    <MarketingShell>
      <SitePageHeader
        title="Our team"
        breadcrumbs={[{ name: 'Home', link: '/' }, { name: 'Pages', link: '#' }, { name: 'Team' }]}
      />
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Team members</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Our master chefs</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className="rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-2 border-primary/30">
                  <img src={`/img/team-${num}.jpg`} alt="" className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">Full name</h3>
                <p className="text-sm text-muted-foreground">Designation</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
