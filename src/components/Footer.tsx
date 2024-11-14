import Link from "next/link";

const Footer: React.FC = () => (
  <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-background mt-auto">
    <div className="mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} DualPosts. All rights reserved.
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center">
          <a href="https://x.com/dfodev" target="_blank">Made with ❤️ by @dfodev:</a>
          <a href="https://www.regexbot.xyz" className="text-blue-500 hover:underline" target="_blank">RegexBot</a>
          <a href="https://www.getretouchai.app" className="text-blue-500 hover:underline" target="_blank">RetouchAI</a>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/terms"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Privacy
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;