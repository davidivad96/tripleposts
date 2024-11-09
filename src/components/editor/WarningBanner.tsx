import CloseIcon from "../icons/Close";

type WarningBannerProps = {
  show: boolean;
  onClose: () => void;
}

const WarningBanner: React.FC<WarningBannerProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg">
      <p className="text-sm">
        Only the first 280 characters will be visible on the timeline.
      </p>
      <button
        onClick={onClose}
        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default WarningBanner;
