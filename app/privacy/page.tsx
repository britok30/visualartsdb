import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for VisualArtsDB — no accounts, no tracking cookies, no personal data collection. GDPR and CCPA compliant by design.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl italic tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-xs text-neutral-300">
        Last updated — March 20, 2026
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-neutral-600">
        <section>
          <h2 className="mb-3 text-base text-neutral-900">1. Overview</h2>
          <p>
            VisualArtsDB is committed to protecting your privacy. This policy
            explains what information we collect, how we use it, and your rights
            regarding that information. We have designed VisualArtsDB to operate
            with minimal data collection — no accounts, no tracking cookies, and
            no personal data requirements.
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
            <li>Location data or GPS coordinates</li>
            <li>Browser fingerprints or device identifiers for tracking</li>
            <li>Search history or browsing behavior tied to individuals</li>
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
            VisualArtsDB does not use cookies for tracking, advertising, or
            analytics. No first-party or third-party tracking cookies are set
            when you use this platform. Your browser may cache standard assets
            (stylesheets, fonts, images) for performance, but this is standard
            browser behavior and contains no personal data.
          </p>
          <p className="mt-3">
            Because we do not use tracking cookies, no cookie consent banner is
            required. If this changes in the future, we will update this policy
            and implement appropriate consent mechanisms.
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
            We may use privacy-respecting, anonymous analytics to understand
            aggregate usage patterns — such as which pages are most visited or
            which search terms are most common. Any analytics we use will be
            configured to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Not collect personally identifiable information</li>
            <li>Not use cookies or browser fingerprinting</li>
            <li>Not share data with advertising networks</li>
            <li>Not track users across websites</li>
            <li>
              Comply with GDPR, CCPA, and PECR without requiring consent banners
            </li>
          </ul>
          <p className="mt-3">
            If we introduce an analytics service, it will be disclosed in this
            policy by name.
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
            Since VisualArtsDB does not collect personal data, there is no
            personal data retention period to define. Artwork metadata in our
            database is retained indefinitely for the purposes of operating the
            platform. Server logs managed by our hosting providers are retained
            according to their standard retention policies and are not accessible
            to VisualArtsDB.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            10. International Data Transfers
          </h2>
          <p>
            VisualArtsDB&apos;s infrastructure may be distributed across multiple
            regions. Because we do not collect personal data, international data
            transfer regulations (such as GDPR cross-border transfer rules) do
            not apply to user data. Artwork metadata is public information
            sourced from museum open-access programs and is not subject to data
            transfer restrictions.
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
            Since VisualArtsDB does not collect or store personal data, there is
            no personal information to access, correct, export, or delete.
          </p>
          <p className="mt-3">
            Regardless of your location, you are entitled to the protections of
            applicable privacy laws. For users in the European Economic Area
            (EEA), this includes the General Data Protection Regulation (GDPR).
            For California residents, this includes the California Consumer
            Privacy Act (CCPA) and the California Privacy Rights Act (CPRA). Our
            minimal data practices are designed to comply with these frameworks
            by default, without requiring explicit consent mechanisms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            13. Do Not Track
          </h2>
          <p>
            VisualArtsDB honors Do Not Track (DNT) browser signals by default,
            as we do not engage in any form of user tracking. Your DNT preference
            has no functional impact on this platform because no tracking occurs
            regardless of the setting.
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
            mandated timeframe (72 hours under GDPR). Since no personal user data
            is stored, the risk of a breach affecting individual users is
            negligible.
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
