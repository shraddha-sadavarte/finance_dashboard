import api from './axios.js';

export const getSummaryApi = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

export const getCategoriesApi = async (type = '') => {
  const response = await api.get(`/dashboard/categories${type ? `?type=${type}` : ''}`);
  return response.data;
};

export const getMonthlyTrendsApi = async () => {
  const response = await api.get('/dashboard/trends/monthly');
  return response.data;
};

export const getWeeklyTrendsApi = async () => {
  const response = await api.get('/dashboard/trends/weekly');
  return response.data;
};

export const getRecentActivityApi = async (limit = 10) => {
  const response = await api.get(`/dashboard/recent?limit=${limit}`);
  return response.data;
};

// Admin sees all users summary
export const getUsersSummaryApi = async () => {
  const response = await api.get('/dashboard/users-summary');
  return response.data;
};