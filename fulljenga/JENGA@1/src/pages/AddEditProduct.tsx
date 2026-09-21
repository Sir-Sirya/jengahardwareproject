import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, categoryApi, uploadApi } from '../services/api';
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react';
import type { Category } from '../types';

export default function AddEditProduct() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    imageUrl: '',
    whatsappLink: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getHierarchy();
        const flat = flattenHierarchy(res.data);
        setCategories(flat);
      } catch {
        // fallback to flat list
        try {
          const res = await categoryApi.getAll();
          setCategories(res.data);
        } catch {
          // silently fail
        }
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productApi.getById(Number(id));
        const p = res.data;
        setForm({
          title: p.title,
          description: p.description || '',
          price: String(p.price),
          stockQuantity: String(p.stockQuantity),
          categoryId: String(p.categoryId),
          imageUrl: p.imageUrl || '',
          whatsappLink: p.whatsappLink || '',
        });
      } catch {
        setError('Failed to load product for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setForm((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let imageUrl = form.imageUrl;

      if (imageFile) {
        const uploadRes = await uploadApi.image(imageFile);
        imageUrl = uploadRes.data.url;
      }

      const payload = {
        ...form,
        imageUrl,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        categoryId: Number(form.categoryId),
      };

      if (isEdit) {
        await productApi.update(Number(id), payload);
      } else {
        await productApi.create(payload);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string }; message?: string } }).response?.data?.error || 'Failed to save product.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-jenga-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="label-text">Product Title</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 50kg Cement — Bamburi"
            />
          </div>

          <div>
            <label htmlFor="description" className="label-text">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Describe the product, condition, delivery options..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="label-text">Price (KES)</label>
              <input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                value={form.price}
                onChange={handleChange}
                className="input-field"
                placeholder="1200"
              />
            </div>
            <div>
              <label htmlFor="stockQuantity" className="label-text">Stock Quantity</label>
              <input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                required
                min="0"
                value={form.stockQuantity}
                onChange={handleChange}
                className="input-field"
                placeholder="20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="categoryId" className="label-text">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              required
              value={form.categoryId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parentId ? `\u00A0\u00A0\u2192 ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">Product Image</label>
            {imagePreview || form.imageUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 mb-3">
                <img
                  src={imagePreview || form.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-gray-600 hover:text-accent-red border border-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-jenga-500 hover:bg-jenga-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                  <p className="text-xs text-gray-400">JPG, JPEG, PNG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            {!imagePreview && !form.imageUrl && (
              <p className="text-xs text-gray-400 mt-1">No image selected</p>
            )}
          </div>

          <div>
            <label htmlFor="whatsappLink" className="label-text">WhatsApp Link (for buyers)</label>
            <input
              id="whatsappLink"
              name="whatsappLink"
              type="url"
              value={form.whatsappLink}
              onChange={handleChange}
              className="input-field"
              placeholder="https://wa.me/254712345678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Use https://wa.me/[your-number] so buyers can message you directly.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? 'Update Product' : 'Save Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function flattenHierarchy(cats: Category[]): Category[] {
  const result: Category[] = [];
  for (const cat of cats) {
    result.push(cat);
    if (cat.children) {
      result.push(...flattenHierarchy(cat.children));
    }
  }
  return result;
}
