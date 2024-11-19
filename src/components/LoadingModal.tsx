import { PlatformStatus } from "@/types";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";
import BlueskyIcon from "./icons/Bluesky";
import CloseIcon from "./icons/Close";
import ErrorIcon from "./icons/Error";
import LoadingIcon from "./icons/LoadingIcon";
import SuccessIcon from "./icons/Success";
import ThreadsIcon from "./icons/Threads";
import XIcon from "./icons/X";

type LoadingModalProps = {
  isOpen: boolean;
  platformStatuses: PlatformStatus[];
  onClose?: () => void;
};

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  platformStatuses,
  onClose,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && platformStatuses.every(p => p.status !== "loading")) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const showFireworks = platformStatuses.every(p => p.status === "success");

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4 relative">
        {platformStatuses.every(p => p.status !== "loading") && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <CloseIcon />
          </button>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {platformStatuses.some(p => p.status === "loading")
              ? "Posting to platforms..."
              : platformStatuses.every(p => p.status === "success")
                ? "Posted successfully!"
                : platformStatuses.some(p => p.status === "success")
                  ? "Partially posted"
                  : "Failed to post"}
          </h3>
          <div className="flex flex-col gap-4">
            {platformStatuses.map((ps) => (
              <div
                key={ps.platform}
                className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg"
              >
                <div className="w-5 h-5">
                  {ps.platform === "X" ? <XIcon /> : ps.platform === "Threads" ? <ThreadsIcon /> : <BlueskyIcon />}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  {ps.status === "loading" ? (
                    <span>Posting...</span>
                  ) : ps.status === "success" ? (
                    <a
                      href={ps.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View post
                    </a>
                  ) : (
                    <span className="text-red-500 dark:text-red-400">
                      {ps.error || "Failed to post"}
                    </span>
                  )}
                  <div className="w-6 h-6">
                    {ps.status === "loading" ? (
                      <LoadingIcon />
                    ) : ps.status === "success" ? (
                      <SuccessIcon />
                    ) : (
                      <ErrorIcon />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showFireworks && <Fireworks autorun={{ speed: 2, duration: 1000 }} />}
    </div>
  );
};

export default LoadingModal;
