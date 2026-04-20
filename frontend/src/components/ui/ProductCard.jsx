import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useAddToCartMutation } from '../../hooks/useUserCart';
import {
  useAddToWishlistMutation,
  useRemoveWishlistItemMutation,
  useWishlistCount,
} from '../../hooks/useUserWishlist';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const toast = useToast();

  const addToCartMutation = useAddToCartMutation();
  const addToWishlistMutation = useAddToWishlistMutation();
  const removeFromWishlistMutation = useRemoveWishlistItemMutation();
  const { data: wishlistData, hasProduct } = useWishlistCount();

  const isWishlisted = hasProduct(product.id);
  const isCorruptedText = (value) =>
    typeof value === 'string' && (/[A-Za-z]/.test(value) || /[\^"\?]/.test(value));
  const displayName = isCorruptedText(product.name) ? (product.nameEn || 'Lens Product') : product.name;
  const displayColor = isCorruptedText(product.color) ? 'لون طبيعي' : product.color;
  const displayBrand =
    typeof product.brand === 'object' && product.brand !== null
      ? product.brand.name || ''
      : product.brand;
  const displayDuration =
    typeof product.duration === 'object' && product.duration !== null
      ? product.duration.name || ''
      : product.duration;

  const handleAddToCart = () => {
    addToCartMutation.mutate(
      { productId: product.id, quantity: 1, product },
      {
        onSuccess: () => toast.success('تمت إضافة المنتج إلى السلة.'),
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'تعذر إضافة المنتج إلى السلة.');
        },
      }
    );
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      const currentItems = Array.isArray(wishlistData?.items) ? wishlistData.items : [];
      const matchedItem = currentItems.find(
        (item) => item.productId === product.id || item.product?.id === product.id
      );

      removeFromWishlistMutation.mutate(
        { itemId: matchedItem?.id, productId: product.id },
        {
          onSuccess: () => toast.success('تم حذف المنتج من المفضلة.'),
          onError: (error) => {
            toast.error(error?.response?.data?.message || 'تعذر حذف المنتج من المفضلة.');
          },
        }
      );
      return;
    }

    addToWishlistMutation.mutate(
      { productId: product.id, product },
      {
        onSuccess: () => toast.success('تمت إضافة المنتج إلى المفضلة.'),
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'تعذر إضافة المنتج إلى المفضلة.');
        },
      }
    );
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="card-hover group cursor-pointer w-full h-full flex flex-col"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/product/${product.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/product/${product.id}`);
        }
      }}
    >
      {/* Image container */}
      <div className="relative h-64 sm:h-72 overflow-hidden rounded-t-2xl bg-surface-200 dark:bg-dark-surface flex items-center justify-center p-2">
        <img
          src={product.image}
          alt={displayName}
          className="w-full h-full object-contain"
        />

        {/* Discount badge */}
        {product.discount && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-ink-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            -{product.discount}%
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle();
          }}
          className="absolute top-3 left-3 p-2 bg-background-100/90 dark:bg-dark-surface/80 backdrop-blur-sm rounded-full hover:bg-surface-100 dark:hover:bg-dark-surface transition group-hover:scale-110"
        >
          <Heart
            className={`w-5 h-5 transition ${
              isWishlisted ? 'fill-primary-500 text-primary-600' : 'text-ink-600 dark:text-secondary-300'
            }`}
          />
        </button>

        {/* Quick add to cart on hover */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-center gap-2 text-white font-arabic"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
        >
          <ShoppingCart className="w-5 h-5" />
          أضيفي للسلة
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand */}
        <p className="text-xs text-ink-500 dark:text-secondary-300 mb-2 min-h-5">
          {displayBrand || '\u00A0'}
        </p>

        {/* Product name */}
        <h3 className="font-arabic font-bold text-ink-800 dark:text-secondary-100 mb-2 leading-snug line-clamp-2">
          {displayName}
        </h3>

        {/* Rating */}
        {product.rating ? (
          <div className="flex items-center gap-1 mb-3 min-h-5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-ink-500 dark:text-secondary-300">
              ({product.rating})
            </span>
          </div>
        ) : (
          <div className="mb-3 min-h-5" />
        )}

        {/* Price section */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {product.price} ج.م
          </span>
          {product.oldPrice && (
            <span className="text-sm text-ink-400 dark:text-secondary-400 line-through">
              {product.oldPrice} ج.م
            </span>
          )}
        </div>

        {/* Category/Specs */}
        {(product.color || product.duration) ? (
          <div className="flex gap-2 mb-4 flex-wrap min-h-8">
            {displayColor && (
              <span className="text-xs bg-surface-200 dark:bg-dark-surface px-2 py-1 rounded-full text-ink-700 dark:text-secondary-200">
                {displayColor}
              </span>
            )}
            {displayDuration && (
              <span className="text-xs bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded-full text-primary-700 dark:text-primary-300">
                {displayDuration}
              </span>
            )}
          </div>
        ) : (
          <div className="mb-4 min-h-8" />
        )}

        {/* Stock indicator */}
        {product.stock !== undefined ? (
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-auto min-h-4">
            {product.stock > 10 ? (
              <span className="text-green-600 dark:text-green-400">متوفر</span>
            ) : product.stock > 0 ? (
              <span className="text-orange-600 dark:text-orange-400">
                متبقي: {product.stock}
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">غير متوفر</span>
            )}
          </div>
        ) : (
          <div className="mt-auto min-h-4" />
        )}
      </div>
    </motion.div>
  );
}


