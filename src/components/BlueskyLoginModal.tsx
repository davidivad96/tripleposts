import { useRouter } from "next/navigation";
import { useState } from "react";
import CloseIcon from "./icons/Close";
import ErrorIcon from "./icons/Error";

type BlueskyLoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const BlueskyLoginModal: React.FC<BlueskyLoginModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Validate handle format
      if (!handle.includes('.')) {
        throw new Error('Please enter a valid Bluesky handle (e.g., username.bsky.social)');
      }
      const response = await fetch('/oauth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to connect to Bluesky');
      }
      const { redirectUrl } = await response.json();
      router.replace(redirectUrl);
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setError(null);
          setHandle("");
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4 relative">
        <button
          onClick={() => {
            setError(null);
            setHandle("");
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <CloseIcon />
        </button>
        <h2 className="text-xl font-bold mb-4">Connect Bluesky</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="handle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Enter your Bluesky handle
            </label>
            <input
              type="text"
              id="handle"
              value={handle}
              onChange={(e) => {
                setError(null);
                setHandle(e.target.value);
              }}
              placeholder="username.bsky.social"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
                }`}
              required
              disabled={isLoading}
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                <ErrorIcon />
                <span>Handle is invalid</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setHandle("");
                onClose();
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlueskyLoginModal;
