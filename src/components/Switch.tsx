type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false }) => {
  console.log("checked", checked);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`${checked ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'} 
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`${checked ? 'translate-x-6' : 'translate-x-1'} 
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  );
};

export default Switch; 