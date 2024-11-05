import Fireworks from "react-canvas-confetti/dist/presets/fireworks";
import CloseIcon from "./icons/Close";
import LoadingIcon from "./icons/LoadingIcon";
import ThreadsIcon from "./icons/Threads";
import XIcon from "./icons/X";

type LoadingModalProps = {
  isOpen: boolean;
  platforms: ("X" | "Threads")[];
  isSuccess?: boolean;
  onClose?: () => void;
};

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  platforms,
  isSuccess = false,
  onClose,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && isSuccess) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4 relative">
          {/* Close button - only shown when successful */}
          {isSuccess && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <CloseIcon />
            </button>
          )}

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                {isSuccess ? (
                  <div className="text-green-500 w-20 h-20 flex items-center justify-center">
                    <svg
                      className="w-16 h-16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ) : (
                  <LoadingIcon />
                )}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                {isSuccess ? "Posted successfully!" : "Posting to platforms..."}
              </h3>
              <div className="flex flex-row justify-center items-center gap-3">
                {platforms.map((platform) => (
                  <div
                    key={platform}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                  >
                    {platform === "X" ? <XIcon /> : <ThreadsIcon />}
                    {isSuccess && (
                      <a
                        href={
                          platform === "X"
                            ? "https://x.com"
                            : "https://threads.net"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View post
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {isSuccess && <Fireworks autorun={{ speed: 2, duration: 1000 }} />}
      </div>
    </>
  );
};

export default LoadingModal;
