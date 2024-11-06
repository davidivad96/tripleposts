import { PostResult, PostStatus } from "@/types";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";
import CloseIcon from "./icons/Close";
import ErrorIcon from "./icons/Error";
import LoadingIcon from "./icons/LoadingIcon";
import SuccessIcon from "./icons/Success";
import ThreadsIcon from "./icons/Threads";
import WarningIcon from "./icons/Warning";
import XIcon from "./icons/X";

type LoadingModalProps = {
  isOpen: boolean;
  platforms: ("X" | "Threads")[];
  status: PostStatus;
  error?: { platform: string; message: string } | null;
  onClose?: () => void;
  results?: PostResult[];
};

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  platforms,
  status,
  error,
  onClose,
  results = [],
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget &&
      (status === "success" || status === "error" || status === "partial_success")
    ) {
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
          {/* Close button - shown on success or error */}
          {(status === "success" || status === "error") && (
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
                {status === "success" && <SuccessIcon />}
                {status === "error" && <ErrorIcon />}
                {status === "partial_success" && <WarningIcon />}
                {status === "posting" && <LoadingIcon />}
              </div>
            </div>
            <div className="text-center">
              {status === "posting" && (
                <h3 className="text-lg font-semibold mb-4">
                  Posting to platforms...
                </h3>
              )}
              <div className="flex flex-row justify-center items-center gap-3">
                {platforms.map((platform) => (
                  <div
                    key={platform}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                  >
                    {platform === "X" ? <XIcon /> : <ThreadsIcon />}
                    {(status === "success" ||
                      status === "partial_success" ||
                      status === "error") && (
                        results.find((r) => r.platform === platform) ? (
                          <a
                            href={results.find((r) => r.platform === platform)?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View post
                          </a>
                        ) : (
                          <span className="text-red-500 dark:text-red-400">
                            {error?.platform === platform ? error.message : "Failed to post"}
                          </span>
                        )
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {status === "success" && <Fireworks autorun={{ speed: 2, duration: 1000 }} />}
      </div>
    </>
  );
};

export default LoadingModal;
