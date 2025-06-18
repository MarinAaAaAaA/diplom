import ProductService from '../services/productService.js';

export const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    console.log('JSON данные:', req.body);

    const product = await ProductService.createProduct(name, description);
    return res.json(product);

  } catch (e) {
    next(e);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.files || !req.files.image) {
      throw new Error('Изображение не загружено');
    }

    const { image } = req.files;
    const fileName = Date.now() + '_' + image.name;
    const filePath = `/uploads/products/${fileName}`;
    const uploadPath = `uploads/products/${fileName}`;

    await image.mv(uploadPath);

    await ProductService.updateProductImage(id, filePath);

    return res.json({ imageUrl: filePath });
  } catch (e) {
    next(e);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const products = await ProductService.getAllProducts();
    return res.json(products);
  } catch (e) {
    next(e);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    return res.json(product);
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updated = await ProductService.updateProduct(id, name, description);
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ProductService.deleteProduct(id);
    return res.json(result);
  } catch (e) {
    next(e);
  }
};