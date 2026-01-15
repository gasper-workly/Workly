'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 text-black"
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-black mb-1">Privacy Policy — WORKLY</h1>
            <p className="text-sm text-gray-600">Last updated: 19.11.2025</p>
          </div>
        </header>

        <section className="space-y-3 text-sm text-black">
          <p>
            WORKLY (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates a platform that connects users
            looking for physical services (&quot;Clients&quot;) with people offering those services
            (&quot;Providers&quot;). This Privacy Policy explains how we collect, use, and protect
            your information when you use the WORKLY mobile application.
          </p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              <span className="font-semibold">Account Information:</span> name, email, encrypted
              password, profile details.
            </li>
            <li>
              <span className="font-semibold">Location Information:</span> approximate location for
              service relevance, and location entered manually for service requests. We do{' '}
              <span className="font-semibold">not</span> collect precise GPS unless you allow it.
            </li>
            <li>
              <span className="font-semibold">Service Information:</span> services you offer or
              request, chat messages, ratings, reviews, and job history.
            </li>
          </ol>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>connect Clients and Providers</li>
            <li>show relevant services</li>
            <li>enable chat</li>
            <li>manage bookings and job completion</li>
            <li>ensure safety and prevent misuse</li>
          </ul>
          <p className="mt-1">
            We <span className="font-semibold">do not sell</span> your data to third parties.
          </p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Data Sharing</h2>
          <p>We may share limited data with:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Providers, when a Client contacts them</li>
            <li>Clients, when a Provider engages</li>
            <li>Legal authorities, if required by law</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Data Storage &amp; Security</h2>
          <p>
            Passwords are encrypted, chat data is stored securely, and access is restricted. We take
            technical measures to protect your information, but no system can be 100% secure.
          </p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Your Rights</h2>
          <p>
            You may request access, editing, export, or deletion of your data, subject to legal and
            operational limitations.
          </p>
          <p>
            Contact us at:{' '}
            <a
              href="mailto:official.workly@gmail.com"
              className="text-violet-700 underline hover:text-violet-900"
            >
              official.workly@gmail.com
            </a>
          </p>
        </section>

        <section className="space-y-2 text-sm text-black">
          <h2 className="text-base font-semibold text-black">Children&apos;s Privacy</h2>
          <p>WORKLY is not intended for users under 18 years of age.</p>
        </section>

        <section className="space-y-2 text-sm text-black pb-8">
          <h2 className="text-base font-semibold text-black">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Updates take effect once published
            in the app. If changes are significant, we may notify you within the app or by email.
          </p>
        </section>
      </div>
    </main>
  );
}

