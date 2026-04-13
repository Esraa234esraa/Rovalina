import api from './http';

export const shopApi = {
  register(payload) {
    return api.post('/auth/register', payload);
  },

  login(payload) {
    return api.post('/auth/login', payload);
  },

  me() {
    return api.get('/auth/me');
  },

  changePassword(payload) {
    return api.patch('/auth/change-password', payload);
  },

  getSettings() {
    return api.get('/settings');
  },

  getCart() {
    return api.get('/cart');
  },

  addToCart(payload) {
    return api.post('/cart/items', payload);
  },

  updateCartItem(itemId, payload) {
    return api.patch(`/cart/items/${itemId}`, payload);
  },

  removeCartItem(itemId) {
    return api.delete(`/cart/items/${itemId}`);
  },

  getWishlist() {
    return api.get('/wishlist');
  },

  addToWishlist(payload) {
    return api.post('/wishlist/items', payload);
  },

  removeWishlistItem(itemId) {
    return api.delete(`/wishlist/items/${itemId}`);
  },

  removeWishlistProduct(productId) {
    return api.delete(`/wishlist/products/${productId}`);
  },

  calculateOrderTotal() {
    return api.get('/orders/calculate-total');
  },

  createOrder(payload) {
    return api.post('/orders', payload);
  },

  createOrderFromCart(payload) {
    return api.post('/orders/from-cart', payload);
  },

  createPayment(payload) {
    return api.post('/payments/create', payload);
  },

  getMyOrders() {
    return api.get('/orders/my');
  },
};
