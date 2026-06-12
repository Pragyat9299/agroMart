import API from './axios';

export const addPrice              = (data)       => API.post('/farmer/prices', data);
export const getMyPrices           = ()           => API.get('/farmer/prices');
export const updatePrice           = (id, data)   => API.put(`/farmer/prices/${id}`, data);
export const togglePrice           = (id)         => API.patch(`/farmer/prices/${id}/toggle`);
export const deactivatePrice       = (id)         => API.delete(`/farmer/prices/${id}`);
export const getFarmerOrders       = ()           => API.get('/farmer/orders');
export const getAllMyPriceHistory   = (cursor, size = 20) =>
  API.get('/farmer/prices/all-history', { params: { cursor, size } });
export const getFarmerPriceHistory = (productId)  => API.get(`/farmer/prices/${productId}/history`);
