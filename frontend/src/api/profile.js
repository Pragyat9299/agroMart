import API from './axios';

export const getProfile = () => API.get('/profile');
export const updateProfile = (data) => API.put('/profile', data);
export const changePassword = (data) => API.put('/profile/password', data);
export const deactivateAccount = () => API.patch('/profile/deactivate');
export const activateAccount = () => API.patch('/profile/activate');
