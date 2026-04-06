//helper functions to display data nicely
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

//format date
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: '2-digit',
    })
}

//format date as "2026-04-02" for input fields
export const formatDateInput = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
}

//returns tailwind color classes based on record type
export const getTypeColor = (type) => {
  return type === 'INCOME'
    ? 'text-emerald-400'
    : 'text-red-400';
};

// Returns Tailwind color classes based on user role
export const getRoleColor = (role) => {
  const colors = {
    ADMIN:   'bg-purple-500/20 text-purple-400',
    ANALYST: 'bg-blue-500/20 text-blue-400',
    VIEWER:  'bg-gray-500/20 text-gray-400',
  };
  return colors[role] || colors.VIEWER;
};