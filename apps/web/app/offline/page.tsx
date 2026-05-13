import Link from 'next/link';

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-dark-navy px-4 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl">
        <h1 className="font-display text-3xl font-bold">You are offline</h1>
        <p className="mt-4 text-white/80">
          DineFlow cannot reach the network right now. You can retry once your connection is back.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-6 py-2 font-medium text-black transition-transform duration-200 active:scale-95"
        >
          Retry
        </Link>
      </section>
    </main>
  );
}
