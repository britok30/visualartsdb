import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for VisualArtsDB — what we collect, what we don't, and the third-party services (including Google Analytics) that operate on the site.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl italic tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-xs text-neutral-300">
        Last updated — May 4, 2026
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-neutral-600">
        <section>
          <h2 className="mb-3 text-base text-neutral-900">1. Overview</h2>
          <p>
            VisualArtsDB is committed to being transparent about your privacy.
            This policy explains what information we collect, how we use it, and
            your rights regarding that information. The site has no user
            accounts and we do not collect personal information directly. We do
            use Google Analytics, which sets cookies and collects pseudonymous
            usage data, as described below.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            2. Information We Do Not Collect
          </h2>
          <p>VisualArtsDB does not collect, store, or process:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Names, email addresses, or any personal identifiers</li>
            <li>User accounts, passwords, or authentication credentials</li>
            <li>Payment or financial information</li>
            <li>Precise location data or GPS coordinates</li>
            <li>Social media profiles or third-party login data</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            3. Information That May Be Collected Automatically
          </h2>
          <p>
            When you visit VisualArtsDB, our hosting infrastructure may
            automatically collect standard server log information, including:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>IP address (anonymized where possible)</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and timestamps</li>
            <li>Referring URL</li>
            <li>Response times and error codes</li>
          </ul>
          <p className="mt-3">
            This data is used solely for maintaining the security, stability, and
            performance of the platform. It is not linked to any individual
            identity and is not used for profiling, targeted advertising, or any
            commercial purpose. Server logs are automatically rotated and deleted
            according to our hosting provider&apos;s retention schedule.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">4. Cookies</h2>
          <p>
            VisualArtsDB itself does not set any first-party cookies. The Google
            Analytics script we load sets <code>_ga</code> and{" "}
            <code>_ga_&lt;property-id&gt;</code> cookies in your browser, used
            to distinguish unique visitors and persist a session identifier
            (typically valid for two years). We do not run any advertising,
            personalization, or third-party tracking cookies beyond these.
          </p>
          <p className="mt-3">
            You can block, clear, or restrict these cookies through your
            browser settings. You can also opt out of Google Analytics
            specifically using Google&apos;s{" "}
            <a
              className="underline"
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              browser opt-out add-on
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            5. Local Storage &amp; Browser Data
          </h2>
          <p>
            VisualArtsDB may use your browser&apos;s local storage to persist
            non-personal preferences such as recent search queries within the
            command palette. This data remains entirely on your device, is never
            transmitted to our servers, and can be cleared at any time through
            your browser settings.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">6. Analytics</h2>
          <p>
            VisualArtsDB uses <strong>Google Analytics 4</strong> to understand
            aggregate usage patterns — for example, which pages are most
            visited, which search terms are most common, and how users navigate
            the site. Google Analytics collects:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              A pseudonymous client identifier stored in a browser cookie
            </li>
            <li>
              Pages viewed, time on page, scroll depth, outbound clicks, and
              site search queries
            </li>
            <li>
              Approximate geographic location (country/region, derived from IP)
            </li>
            <li>Device, browser, and operating system information</li>
            <li>Referring URL</li>
          </ul>
          <p className="mt-3">
            IP addresses are not stored or logged by Google Analytics 4 — they
            are used transiently to derive approximate location and then
            discarded. We do not link this data to any personal identity, and
            we do not attempt to re-identify individual visitors. Data is
            retained in our Google Analytics account for up to 14 months.
          </p>
          <p className="mt-3">
            We also use <strong>Vercel Web Analytics</strong>, which provides
            aggregate, cookieless traffic measurement on top of our hosting
            platform.
          </p>
          <p className="mt-3">
            Google&apos;s handling of analytics data is governed by the{" "}
            <a
              className="underline"
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            6a. Advertising
          </h2>
          <p>
            VisualArtsDB does not currently display advertising. If this
            changes in the future, this policy will be updated to disclose the
            advertising network in use and any associated data practices before
            ads go live.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            7. Third-Party Services
          </h2>
          <p>
            VisualArtsDB loads artwork images directly from external museum
            servers and CDNs. When your browser requests these images, the
            hosting institution may log that request according to their own
            privacy policies. VisualArtsDB has no control over these third-party
            logs. Institutions whose image servers may receive requests include:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Art Institute of Chicago (IIIF image service)</li>
            <li>WikiArt</li>
            <li>Metropolitan Museum of Art</li>
            <li>Rijksmuseum</li>
          </ul>
          <p className="mt-3">
            Our platform is hosted on infrastructure provided by Vercel
            (application hosting) and Neon (database). These services may process
            server-level data in accordance with their respective privacy
            policies. We also use Google Fonts to serve typefaces, which means
            your browser may make requests to Google&apos;s servers. Google&apos;s
            privacy policy governs any data they collect from these font
            requests.
          </p>
          <p className="mt-3">
            In addition to the services above, VisualArtsDB loads scripts from{" "}
            <strong>Google Analytics</strong> (analytics measurement) and{" "}
            <strong>Vercel Analytics</strong> (cookieless traffic measurement).
            See sections 4 and 6 for details on what these services collect.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            8. Data Storage &amp; Security
          </h2>
          <p>
            VisualArtsDB stores only artwork metadata (titles, dates, artist
            names, classifications, medium, dimensions) and image URLs in its
            database. No user data of any kind is stored. All connections to our
            database and APIs are encrypted using TLS/SSL. Our database is hosted
            in a SOC 2 compliant environment with encryption at rest.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            9. Data Retention
          </h2>
          <p>
            VisualArtsDB itself does not store personal data, so we have no
            first-party personal data retention period to define. Artwork
            metadata in our database is retained indefinitely. Analytics data
            collected by Google Analytics is retained in our account for up to
            14 months (the configured data retention setting). Server logs
            managed by our hosting providers are retained according to their
            standard retention policies and are not accessible to VisualArtsDB.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            10. International Data Transfers
          </h2>
          <p>
            VisualArtsDB&apos;s infrastructure is distributed across multiple
            regions. Data collected by Google Analytics is processed by Google
            on its global infrastructure, which includes servers in the United
            States and other countries. Google offers Standard Contractual
            Clauses and other transfer mechanisms to address cross-border
            transfer requirements under GDPR; details are available in
            Google&apos;s privacy and data processing documentation.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            11. Children&apos;s Privacy
          </h2>
          <p>
            VisualArtsDB does not knowingly collect any personal information from
            anyone, including children under the age of 13 (or the applicable age
            of digital consent in your jurisdiction). Since we do not collect
            personal data, no special provisions for children&apos;s data are
            required under COPPA or equivalent regulations. The platform is
            suitable for educational use by users of all ages.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            12. Your Rights
          </h2>
          <p>
            Because VisualArtsDB does not collect personal data directly, we
            hold no first-party records to access, correct, export, or delete.
            For data processed by Google Analytics, your rights (access,
            deletion, opt-out, etc.) are exercised through Google. Useful
            starting points:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Google Analytics opt-out:{" "}
              <a
                className="underline"
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
              >
                tools.google.com/dlpage/gaoptout
              </a>
            </li>
            <li>
              Manage Google account data:{" "}
              <a
                className="underline"
                href="https://myaccount.google.com/data-and-privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                myaccount.google.com/data-and-privacy
              </a>
            </li>
          </ul>
          <p className="mt-3">
            Regardless of your location, you are entitled to the protections of
            applicable privacy laws. For users in the European Economic Area
            (EEA) and the United Kingdom, this includes the GDPR / UK GDPR. For
            California residents, this includes the California Consumer Privacy
            Act (CCPA) and the California Privacy Rights Act (CPRA).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            13. Do Not Track
          </h2>
          <p>
            VisualArtsDB does not currently respond to Do Not Track (DNT)
            browser signals, because there is no industry-standard
            interpretation for how DNT applies to third-party analytics. To
            limit data collection, you can use the opt-out and cookie-blocking
            options described in sections 4, 6, and 12.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            14. Data Breach Notification
          </h2>
          <p>
            In the unlikely event of a security breach affecting any data
            processed by VisualArtsDB, we will investigate promptly and, where
            required by applicable law, notify relevant authorities within the
            mandated timeframe (72 hours under GDPR). Because we do not store
            user data ourselves, breach risk on our infrastructure is limited
            to artwork metadata. Breaches affecting third-party services
            (Google, Vercel, Neon) are governed by their respective notification
            obligations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            15. Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. When we do, we
            will revise the &ldquo;Last updated&rdquo; date at the top of this
            page. Material changes — such as introducing analytics, user
            accounts, or new data collection practices — will be clearly noted.
            Continued use of VisualArtsDB constitutes acceptance of the current
            policy.
          </p>
        </section>
      </div>
    </div>
  );
}
