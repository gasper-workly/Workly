'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TermsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 text-black"
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-black">Terms of Service — WORKLY</h1>
            <p className="text-sm text-gray-600">Last updated: 19.11.2025</p>
          </div>
        </header>

        <section className="space-y-3 text-sm text-black">
          <p>
            These Terms govern your use of the WORKLY mobile application. By creating an account,
            you agree to these Terms.
          </p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Description of the Service</h2>
          <p>
            WORKLY is a platform connecting Clients who need physical services with Providers
            offering them. WORKLY does not employ Providers and is not responsible for service
            quality.
          </p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">User Roles</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <span className="font-semibold">Client:</span> requests services.
            </li>
            <li>
              <span className="font-semibold">Provider:</span> offers and performs services.
            </li>
          </ul>
          <p>Users must choose a role during registration.</p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">User Responsibilities</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>All users must provide accurate information and use WORKLY legally.</li>
            <li>
              Providers must perform services professionally, follow laws, and meet agreed times.
            </li>
            <li>
              Clients must provide accurate service details, be present at the agreed time, and
              follow payment agreements when implemented.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Payments</h2>
          <p>
            During the MVP phase, WORKLY does not process payments inside the app. Payments may be
            added later, including subscription-based plans for Providers. Future changes to payment
            systems will be communicated.
          </p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Ratings &amp; Reviews</h2>
          <p>Clients may leave truthful and respectful reviews after job completion.</p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Liability</h2>
          <p>WORKLY is not responsible for:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>actions of Providers or Clients</li>
            <li>damages, injuries, or losses resulting from interactions</li>
          </ul>
          <p className="mt-1">Users interact at their own risk.</p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Account Termination</h2>
          <p>
            We may suspend or terminate accounts that violate rules, including harassment, fraud,
            unsafe behavior, or other misuse of the platform.
          </p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of WORKLY after changes are
            published means you accept the updated Terms.
          </p>
        </section>

        <section className="space-y-2 text-sm text-black pb-8">
          <h2 className="text-base font-semibold text-black">Contact</h2>
          <p>
            For questions about these Terms, contact us at:{' '}
            <a
              href="mailto:official.workly@gmail.com"
              className="text-violet-700 underline hover:text-violet-900"
            >
              official.workly@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
