import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for VisualArtsDB — permitted use, intellectual property, takedown requests, and disclaimers.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl italic tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-xs text-neutral-300">
        Last updated — March 20, 2026
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-neutral-600">
        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            1. About VisualArtsDB
          </h2>
          <p>
            VisualArtsDB is an open, non-commercial research and educational
            platform that aggregates publicly available artwork metadata and
            images from museum open-access programs and public APIs. We do not
            claim ownership of any artwork, image, or descriptive content
            displayed on this platform. VisualArtsDB serves as a discovery tool
            to help users explore and learn about visual art across cultures and
            centuries.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            2. Image &amp; Data Sources
          </h2>
          <p>
            Artwork images and metadata are sourced from public museum APIs and
            open-access collections, including but not limited to the Art
            Institute of Chicago, Rijksmuseum, the Metropolitan Museum of Art,
            and WikiArt. Each institution retains all rights to its content.
          </p>
          <p className="mt-3">
            Where images are designated as public domain or released under
            Creative Commons Zero (CC0), they are displayed in accordance with
            those terms. Images not explicitly marked as public domain are
            displayed for educational and research purposes under applicable fair
            use provisions. We respect and comply with the terms of use of each
            source institution.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            3. Permitted Use
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              You may use VisualArtsDB for personal, educational, and
              non-commercial research purposes.
            </li>
            <li>
              You may browse, search, and share links to artworks and artist
              pages.
            </li>
            <li>
              You may reference artwork information for academic or educational
              work, citing the original institution as the source.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            4. Prohibited Use
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Scraping, bulk-downloading, or systematically extracting data or
              images from this platform for redistribution or commercial
              purposes.
            </li>
            <li>
              Using VisualArtsDB content to train machine learning or AI models
              without explicit permission from the original rights holders.
            </li>
            <li>
              Reproducing, selling, or licensing artwork images obtained through
              this platform.
            </li>
            <li>
              Misrepresenting VisualArtsDB content as your own or removing
              attribution to original institutions.
            </li>
            <li>
              Using automated tools to overload or disrupt the platform&apos;s
              infrastructure.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            5. Accuracy &amp; No Warranties
          </h2>
          <p>
            VisualArtsDB is provided &ldquo;as is&rdquo; without warranty of any
            kind, express or implied. We make reasonable efforts to ensure the
            accuracy of artwork metadata — including titles, dates, artist
            attributions, dimensions, and classifications — but cannot guarantee
            completeness or correctness. Metadata may contain errors inherited
            from source databases.
          </p>
          <p className="mt-3">
            Museum records and institutional databases are the authoritative
            source for all artwork information. Users should verify critical
            details with the holding institution before relying on them for
            publication or academic purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            6. Intellectual Property
          </h2>
          <p>
            The VisualArtsDB name, logo, and original site design are the
            property of the project creators. All artwork images, descriptions,
            and metadata remain the property of their respective institutions
            and rights holders. The compilation and presentation of data on this
            platform does not transfer any intellectual property rights to
            VisualArtsDB or its users.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            7. Takedown Requests
          </h2>
          <p>
            If you are a rights holder and believe content on VisualArtsDB
            infringes your intellectual property or other rights, we encourage
            you to submit a takedown request. Valid requests should include a
            description of the copyrighted work, the URL(s) where the content
            appears on VisualArtsDB, and a statement of good faith belief that
            the use is not authorized. We will review all valid requests
            promptly and remove or disable access to the content in question.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            8. Privacy
          </h2>
          <p>
            VisualArtsDB does not require user accounts and does not collect
            personally identifiable information. We do not use cookies for
            tracking. We may use anonymous, aggregated analytics (such as page
            view counts) to understand usage patterns and improve the platform.
            No data is sold, shared with, or disclosed to third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            9. Third-Party Links
          </h2>
          <p>
            VisualArtsDB may contain links to external websites, including
            museum collection pages and artist resources. We are not responsible
            for the content, privacy practices, or availability of these
            external sites. Accessing third-party links is at your own risk and
            subject to those sites&apos; terms and policies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            10. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, VisualArtsDB and its
            creators shall not be liable for any direct, indirect, incidental,
            consequential, or punitive damages arising from your use of, or
            inability to use, this platform. This includes but is not limited to
            damages resulting from errors in artwork metadata, broken image
            links, or service interruptions.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base text-neutral-900">
            11. Changes to These Terms
          </h2>
          <p>
            We may update these terms from time to time. When we do, we will
            revise the &ldquo;Last updated&rdquo; date at the top of this page.
            Continued use of VisualArtsDB after changes are posted constitutes
            your acceptance of the revised terms. We encourage you to review
            this page periodically.
          </p>
        </section>
      </div>
    </div>
  );
}
