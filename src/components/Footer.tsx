import Link from "next/link";

const Footer: React.FC = () => (
  <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-background shrink-0">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} TriplePosts
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          Made with ❤️ by<a href="https://x.com/dfodev" target="_blank">@dfodev:</a>
          <a href="https://www.regexbot.xyz" className="text-blue-500 hover:underline" target="_blank">RegexBot</a>
          <a href="https://www.getretouchai.app" className="text-blue-500 hover:underline" target="_blank">RetouchAI</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Privacy
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
