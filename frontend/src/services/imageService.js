export const PRODUCT_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f';

export const imageService = {
  async fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve('');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => resolve(String(event?.target?.result || ''));
      reader.onerror = () => reject(new Error('فشل في قراءة ملف الصورة'));
      reader.readAsDataURL(file);
    });
  },

  extractPrimaryImageFromColors(colors = []) {
    const firstColorWithImage = colors.find((color) => Array.isArray(color.images) && color.images.length > 0);
    return firstColorWithImage?.images?.[0] || '';
  },

  normalizeProductColors(product) {
    if (Array.isArray(product?.colors) && product.colors.length > 0) {
      return product.colors.map((color) => ({
        name: color.name || '',
        images: Array.isArray(color.images) ? color.images.filter(Boolean) : [],
      }));
    }

    if (Array.isArray(product?.colorVariants) && product.colorVariants.length > 0) {
      return product.colorVariants.map((variant) => ({
        name: variant.name || '',
        images: Array.isArray(variant.media)
          ? variant.media
              .slice()
              .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
              .map((media) => media.url)
              .filter(Boolean)
          : [],
      }));
    }

    return [];
  },

  resolveProductImage(product) {
    return (
      product?.image ||
      this.extractPrimaryImageFromColors(this.normalizeProductColors(product)) ||
      PRODUCT_IMAGE_FALLBACK
    );
  },
};
