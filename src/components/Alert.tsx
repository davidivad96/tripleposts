import { useEffect, useState } from "react";
import { InformationCircleIcon } from "./icons/Information";

const Alert = ({ message }: { message: string }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${isLeaving ? "animate-fade-out" : "animate-fade-in"
        }`}
    >
      <InformationCircleIcon />
      {message}
    </div>
  );
};

export default Alert;
