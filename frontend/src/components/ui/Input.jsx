const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-4 py-2.5 rounded-lg text-sm
          bg-gray-800 border text-gray-100
          placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-emerald-500/50
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}
          ${className}
        `}
      />
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
};

export default Input;