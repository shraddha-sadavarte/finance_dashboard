import Spinner from './Spinner.jsx';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-emerald-500 hover:bg-emerald-600 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100',
    danger:    'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
    ghost:     'hover:bg-gray-700 text-gray-400 hover:text-gray-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

export default Button;