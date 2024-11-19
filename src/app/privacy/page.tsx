import Link from "next/link";

const PrivacyPolicy = () => (
  <div className="max-w-3xl mx-auto mt-[100px] mb-[60px] px-4">
    <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

    <div className="prose dark:prose-invert">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Last updated: 11/14/2024
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
        <p>When you use TriplePosts, we collect:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Account information from X (Twitter), Threads and Bluesky when you connect them</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Enable posting to your connected social media accounts</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Data Storage</h2>
        <p>
          Media files are stored in our secure cloud storage. We do not share this data with anyone.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:davidivad96+tripleposts@gmail.com" className="text-blue-500 hover:underline">
            davidivad96+tripleposts@gmail.com
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

export default PrivacyPolicy;