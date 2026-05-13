import type { ReactNode } from 'react';

import { BackToTop } from '@/components/back-to-top';
import { PageSpinner } from '@/components/page-spinner';
import { SiteFooter } from '@/components/site-footer';
import { SiteNavbar } from '@/components/site-navbar';

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PageSpinner />
      <div className="flex min-h-screen flex-col bg-background">
        <SiteNavbar />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <BackToTop />
      </div>
    </>
  );
}
