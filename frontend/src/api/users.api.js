import api from './axios.js';

export const getUsersApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/users?${query}`);
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateUserRoleApi = async (id, role) => {
  const response = await api.patch(`/users/${id}/role`, { role });
  return response.data;
};

export const updateUserStatusApi = async (id, isActive) => {
  const response = await api.patch(`/users/${id}/status`, { isActive });
  return response.data;
};

export const deleteUserApi = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};