const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-600 border-t-emerald-400`} />
  );
};

export default Spinner;