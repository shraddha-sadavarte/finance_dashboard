import api from './axios.js';

export const getRecordsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/records?${query}`);
  return response.data;
};

export const getMyRecordsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/records/my?${query}`);
  return response.data;
};

export const getRecordByIdApi = async (id) => {
  const response = await api.get(`/records/${id}`);
  return response.data;
};

export const createRecordApi = async (data) => {
  const response = await api.post('/records', data);
  return response.data;
};

export const updateRecordApi = async (id, data) => {
  const response = await api.patch(`/records/${id}`, data);
  return response.data;
};

export const deleteRecordApi = async (id) => {
  const response = await api.delete(`/records/${id}`);
  return response.data;
};