

import api from "./axios"; 

// Auth 
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
verifyEmail: (token) =>
  api.get(`/auth/verify-email?token=${token}`),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getMe: () => api.get("/auth/me"),
};

// ── Images 
export const imageAPI = {
  getImages: (params) => api.get("/images", { params }),
  getTrending: (params) => api.get("/images/trending", { params }),
  getById: (id) => api.get(`/images/${id}`),

  upload: (form) =>
    api.post("/images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id, data) => api.patch(`/images/${id}`, data),
  delete: (id) => api.delete(`/images/${id}`),
  toggleSave: (id) => api.post(`/images/${id}/save`),

  // ✅ FIXED: download file support
  download: (id, licenseType) =>
    api.get(`/images/${id}/download`, {
      params: { licenseType },
      responseType: "blob",
    }),
};

// ── Payments 
export const paymentAPI = {
  createCheckout: (items) =>
    api.post("/payments/checkout", { items }),

  buyCreditPack: (packId) =>
    api.post("/payments/credits/checkout", { packId }),

  spendCredits: (data) =>
    api.post("/payments/spend-credits", data),

  getMyOrders: () => api.get("/payments/orders"),
  refundOrder: (orderId) =>
    api.post(`/payments/refund/${orderId}`),
};

// ── Users ─
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}/profile`),
  updateMe: (data) => api.patch("/users/me", data),

  uploadAvatar: (form) =>
    api.post("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  toggleFollow: (id) => api.post(`/users/${id}/follow`),
  getSaved: () => api.get("/users/me/saved"),
};

// ── Contributors 
export const contributorAPI = {
  apply: (data) => api.post("/contributors/apply", data),
  myImages: (params) =>
    api.get("/contributors/me/images", { params }),
  myStats: () => api.get("/contributors/me/stats"),
};

// ── Brief
export const briefAPI = {
  getAll: (params) => api.get("/briefs", { params }),
  getById: (id) => api.get(`/briefs/${id}`),
  create: (data) => api.post("/briefs", data),
  update: (id, data) => api.patch(`/briefs/${id}`, data),
  upvote: (id) => api.post(`/briefs/${id}/upvote`),
};

// ── Collection
export const collectionAPI = {
  getPublic: (params) =>
    api.get("/collections/public", { params }),

  getMine: () => api.get("/collections/me"),

  create: (data) => api.post("/collections", data),

  update: (id, data) =>
    api.patch(`/collections/${id}`, data),

  addImage: (id, imageId) =>
    api.post(`/collections/${id}/images`, { imageId }),

  removeImage: (id, imageId) =>
    api.delete(`/collections/${id}/images/${imageId}`),
};

