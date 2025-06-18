import ProductVariantService from '../services/productVariantService.js';

export const create = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, description, price } = req.body;

    const variant = await ProductVariantService.createVariant(productId, name, description, price);
    return res.json(variant);

  } catch (e) {
    next(e);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    const { variantId } = req.params;

    if (!req.files || !req.files.image) {
      throw new Error('Изображение не загружено');
    }

    const { image } = req.files;
    const fileName = Date.now() + '_' + image.name;
    const filePath = `/uploads/variants/${fileName}`;
    const uploadPath = `uploads/variants/${fileName}`;

    await image.mv(uploadPath);

    await ProductVariantService.uploadVariantImage(variantId, filePath);

    return res.json({ imageUrl: filePath });

  } catch (e) {
    next(e);
  }
};

export const getByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variants = await ProductVariantService.getVariantsByProduct(productId);
    return res.json(variants);
  } catch (e) {
    next(e);
  }
};
