import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../services/api';
import { formatPrice } from '../utils/formatters';
import Button from '../components/Button';
import styles from './ProductsPage.module.css';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    original_gram: '',
    image_url: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        original_price: product.original_price || '',
        original_gram: product.original_gram || '',
        image_url: product.image_url || '',
      });
      setImagePreview(product.image_url || null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        original_gram: '',
        image_url: '',
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      original_gram: '',
      image_url: '',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        original_price: formData.original_price !== '' ? Number(formData.original_price) : null,
        original_gram: formData.original_gram !== '' ? Number(formData.original_gram) : null,
        image_url: formData.image_url || '',
      };

      let productId;
      if (editingProduct) {
        await updateProduct(editingProduct.pid, productData);
        productId = editingProduct.pid;
      } else {
        const result = await createProduct(productData);
        productId = result.pid;
      }

      if (imageFile && productId) {
        await uploadProductImage(productId, imageFile);
      }

      handleCloseModal();
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(productId);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Product Management</h1>
        <Button onClick={() => handleOpenModal()}>Add Product</Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.productGrid}>
        {products.length === 0 ? (
          <p className={styles.emptyMessage}>No products registered</p>
        ) : (
          products.map((product) => (
            <div key={product.pid} className={styles.productCard}>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={styles.productImage}
                />
              )}
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.description}>{product.description}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>
                    {formatPrice(product.price)}/g
                  </span>
                </div>
                <div className={styles.actions}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenModal(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(product.pid)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Price per gram (won) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Original Price (won)</label>
                <input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Original Gram (g)</label>
                <input
                  type="number"
                  value={formData.original_gram}
                  onChange={(e) => setFormData({ ...formData, original_gram: e.target.value })}
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : editingProduct ? 'Save' : 'Add'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;