import API from './axios';

export const getAllPrices = (cursor, size = 20) =>
  API.get('/prices', { params: { cursor, size } });
export const getPricesByProduct = (productId) => API.get(`/prices/product/${productId}`);
export const getPricesByDistrict = (district) => API.get(`/prices/district/${district}`);
export const getPriceHistory = (productId, days = 7) =>
  API.get(`/prices/product/${productId}/history?days=${days}`);
