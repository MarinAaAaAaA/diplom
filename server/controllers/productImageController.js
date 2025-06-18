import ApiError from '../exceptions/apiError.js';
import ProductService from '../services/productService.js';

export const updateProductImage = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      throw ApiError.BadRequest('Файл не загружен');
    }

    const { productId } = req.params; 
    const { image } = req.files;

   
    const fileName = Date.now() + '_' + image.name;
    const filePath = `/uploads/products/${fileName}`;
    const uploadPath = `uploads/products/${fileName}`;

    
    await image.mv(uploadPath);

    await ProductService.updateProductImage(productId, filePath);

    return res.json({
      message: 'Изображение товара успешно обновлено',
      imageUrl: filePath
    });
  } catch (e) {
    next(e);
  }
};