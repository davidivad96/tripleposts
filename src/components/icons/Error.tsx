const ErrorIcon = () => (<div className="text-red-500 w-20 h-20 flex items-center justify-center">
  <svg
    className="w-16 h-16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <path
      strokeLinecap="round"
      strokeWidth={2}
      d="M15 9l-6 6M9 9l6 6"
    />
  </svg>
</div>
);

export default ErrorIcon;