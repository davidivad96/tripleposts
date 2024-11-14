import Link from "next/link";

const TermsOfService = () => (
  <div className="max-w-3xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

    <div className="prose dark:prose-invert">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Last updated: 11/14/2024
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using DualPosts, you agree to be bound by these Terms of
          Service and all applicable laws and regulations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Service Description</h2>
        <p>
          DualPosts is a service that allows you to simultaneously post content to
          multiple social media platforms. We do not guarantee uninterrupted access
          to the service or that it will be error-free.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
        <p>You agree to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Comply with all platform-specific terms of service</li>
          <li>Not use the service for any illegal or unauthorized purpose</li>
          <li>Not violate any laws in your jurisdiction</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Content Policy</h2>
        <p>
          You are solely responsible for the content you post through our service.
          We reserve the right to remove any content that violates these terms or
          that we find objectionable.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. We will notify
          users of any material changes via email or through the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Contact</h2>
        <p>
          For any questions about these Terms, please contact us at{" "}
          <a href="mailto:davidivad96+dualposts@gmail.com" className="text-blue-500 hover:underline">
            davidivad96+dualposts@gmail.com
          </a>
        </p>
      </section>
    </div>

    <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
      <Link
        href="/"
        className="text-blue-500 hover:underline"
      >
        ← Back to home
      </Link>
    </div>
  </div>
);

export default TermsOfService;
