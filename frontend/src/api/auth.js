import API from './axios';

export const login          = (data) => API.post('/auth/login', data);
export const register       = (data) => API.post('/auth/register', data);
export const refreshToken   = (refreshToken) => API.post('/auth/refresh', { refreshToken });
export const forgotPassword = (phone) => API.post('/auth/forgot-password', { phone });
export const verifyOtp      = (phone, otp) => API.post('/auth/verify-otp', { phone, otp });
export const resetPassword  = (phone, otp, newPassword) => API.post('/auth/reset-password', { phone, otp, newPassword });
