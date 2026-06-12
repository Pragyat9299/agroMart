import API from './axios';

export const createProduct     = (data)       => API.post('/admin/products', data);
export const updateProduct     = (id, data)   => API.put(`/admin/products/${id}`, data);
export const deleteProduct     = (id)         => API.delete(`/admin/products/${id}`);
export const getAllOrders       = (cursor, size = 20) =>
  API.get('/admin/orders', { params: { cursor, size } });
export const updateOrderStatus = (id, status) => API.patch(`/admin/orders/${id}/status?status=${status}`);
export const getUsers          = (role)       => API.get(`/admin/users${role ? `?role=${role}` : ''}`);
export const updateUser        = (id, data)   => API.put(`/admin/users/${id}`, data);
export const adminResetPassword = (id)        => API.patch(`/admin/users/${id}/reset-password`);
export const toggleAdminPrice  = (id)         => API.patch(`/admin/prices/${id}/toggle`);
export const updateAdminPrice  = (id, data)   => API.put(`/admin/prices/${id}`, data);
export const getAllAdminPrices = (cursor, size = 20) =>
  API.get('/admin/prices/all', { params: { cursor, size } });
export const downloadFarmerTemplate = () =>
  API.get('/admin/templates/farmers', { responseType: 'blob' });
export const downloadPriceTemplate = () =>
  API.get('/admin/templates/prices', { responseType: 'blob' });
