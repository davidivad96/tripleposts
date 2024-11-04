import LoadingIcon from "./icons/LoadingIcon";
import ThreadsIcon from "./icons/Threads";
import XIcon from "./icons/X";

type LoadingModalProps = {
  isOpen: boolean;
  platforms: ("X" | "Threads")[];
};

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen, platforms }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <LoadingIcon />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">
              Posting to platforms...
            </h3>
            <div className="flex items-center justify-center gap-3">
              {platforms.map((platform) => (
                <div
                  key={platform}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                >
                  {platform === "X" ? <XIcon /> : <ThreadsIcon />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
