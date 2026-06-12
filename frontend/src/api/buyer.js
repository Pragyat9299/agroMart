import API from './axios';

export const placeOrder       = (data)     => API.post('/buyer/orders', data);
export const getBuyerOrders   = ()         => API.get('/buyer/orders');
export const cancelOrder      = (orderId)  => API.patch(`/buyer/orders/${orderId}/cancel`);
export const toggleFavourite  = (productId) => API.post(`/buyer/favourites/${productId}`);
export const getFavourites    = ()          => API.get('/buyer/favourites');
