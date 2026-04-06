const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;