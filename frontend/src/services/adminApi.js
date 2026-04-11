import api from './http';

export const adminApi = {
  login(email, password) {
    return api.post('/auth/admin/login', { email, password });
  },

  getDashboardStats() {
    return api.get('/admin/dashboard/stats');
  },

  getDashboardOverview(params = {}) {
    return api.get('/admin/dashboard/overview', { params });
  },

  listProducts(params = {}) {
    return api.get('/products', { params });
  },

  getProductById(id) {
    return api.get(`/products/${id}`);
  },

  createProduct(payload) {
    return api.post('/admin/products', payload);
  },

  updateProduct(id, payload) {
    return api.patch(`/admin/products/${id}`, payload);
  },

  deleteProduct(id) {
    return api.delete(`/admin/products/${id}`);
  },

  listProductReviews(productId) {
    return api.get(`/admin/products/${productId}/reviews`);
  },

  updateProductReview(id, payload) {
    return api.patch(`/admin/product-reviews/${id}`, payload);
  },

  deleteProductReview(id) {
    return api.delete(`/admin/product-reviews/${id}`);
  },

  listOrders(params = {}) {
    return api.get('/admin/orders', { params });
  },

  updateOrderStatus(id, payload) {
    return api.patch(`/admin/orders/${id}/status`, payload);
  },

  getMyOrders() {
    return api.get('/orders/my');
  },

  calculateOrderTotal() {
    return api.get('/orders/calculate-total');
  },

  createOrderFromCart(payload) {
    return api.post('/orders/from-cart', payload);
  },

  listCategories() {
    return api.get('/categories');
  },

  createCategory(payload) {
    return api.post('/admin/categories', payload);
  },

  updateCategory(id, payload) {
    return api.patch(`/admin/categories/${id}`, payload);
  },

  deleteCategory(id) {
    return api.delete(`/admin/categories/${id}`);
  },

  listBrands() {
    return api.get('/brands');
  },

  createBrand(payload) {
    return api.post('/admin/brands', payload);
  },

  updateBrand(id, payload) {
    return api.patch(`/admin/brands/${id}`, payload);
  },

  deleteBrand(id) {
    return api.delete(`/admin/brands/${id}`);
  },

  listDurations() {
    return api.get('/admin/durations');
  },

  createDuration(payload) {
    return api.post('/admin/durations', payload);
  },

  updateDuration(id, payload) {
    return api.patch(`/admin/durations/${id}`, payload);
  },

  deleteDuration(id) {
    return api.delete(`/admin/durations/${id}`);
  },

  listOffers() {
    return api.get('/admin/offers');
  },

  createOffer(payload) {
    return api.post('/admin/offers', payload);
  },

  updateOffer(id, payload) {
    return api.patch(`/admin/offers/${id}`, payload);
  },

  deleteOffer(id) {
    return api.delete(`/admin/offers/${id}`);
  },

  listTestimonials() {
    return api.get('/admin/testimonials');
  },

  createTestimonial(payload) {
    return api.post('/admin/testimonials', payload);
  },

  updateTestimonial(id, payload) {
    return api.patch(`/admin/testimonials/${id}`, payload);
  },

  deleteTestimonial(id) {
    return api.delete(`/admin/testimonials/${id}`);
  },

  listFAQs() {
    return api.get('/admin/faqs');
  },

  listInstagramGalleryItems() {
    return api.get('/admin/instagram-gallery');
  },

  createInstagramGalleryItem(payload) {
    return api.post('/admin/instagram-gallery', payload);
  },

  updateInstagramGalleryItem(id, payload) {
    return api.patch(`/admin/instagram-gallery/${id}`, payload);
  },

  deleteInstagramGalleryItem(id) {
    return api.delete(`/admin/instagram-gallery/${id}`);
  },

  createFAQ(payload) {
    return api.post('/admin/faqs', payload);
  },

  updateFAQ(id, payload) {
    return api.patch(`/admin/faqs/${id}`, payload);
  },

  deleteFAQ(id) {
    return api.delete(`/admin/faqs/${id}`);
  },

  getSettings() {
    return api.get('/admin/settings');
  },

  updateSettings(payload) {
    return api.put('/admin/settings', payload);
  },

  listNotifications() {
    return api.get('/admin/notifications');
  },

  markNotificationRead(id) {
    return api.patch(`/admin/notifications/${id}/read`);
  },

  deleteNotification(id) {
    return api.delete(`/admin/notifications/${id}`);
  },
};