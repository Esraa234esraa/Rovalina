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

  async fileToCompressedDataUrl(file, { maxDimension = 1600, quality = 0.82 } = {}) {
    if (!file) return '';
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return this.fileToDataUrl(file);
    }

    if (!String(file.type || '').startsWith('image/')) {
      return this.fileToDataUrl(file);
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error('فشل في تحميل ملف الصورة'));
        element.src = objectUrl;
      });

      const width = image.naturalWidth || image.width || 0;
      const height = image.naturalHeight || image.height || 0;

      if (!width || !height) {
        return this.fileToDataUrl(file);
      }

      const scale = Math.min(1, maxDimension / Math.max(width, height));
      const targetWidth = Math.max(1, Math.round(width * scale));
      const targetHeight = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        return this.fileToDataUrl(file);
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      return canvas.toDataURL('image/jpeg', quality);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
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
