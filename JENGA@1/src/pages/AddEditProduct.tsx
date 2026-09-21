import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, categoryApi, uploadApi } from '../services/api';
import { ArrowLeft, Save, Loader2, Upload, X, Video, Image as ImageIcon } from 'lucide-react';
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
    videoUrl: '',
    whatsappLink: '',
  });

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaError, setMediaError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch only top-level (main) categories and sort alphabetically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let rawList: Category[] = [];
        try {
          const res = await categoryApi.getHierarchy();
          rawList = res.data;
        } catch {
          const res = await categoryApi.getAll();
          rawList = res.data;
        }

        // Keep only top-level/main categories (no parentId)
        // Keep only top-level departments (parent_id is null)
        const mainCategories = rawList
          .filter((c) => !c.parentId)
          .sort((a, b) => a.name.localeCompare(b.name));
        // Sort alphabetically by category name
        mainCategories.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(mainCategories);
      } catch {
        // Silently fail if categories cannot be loaded
      }
    };
    fetchCategories();
  }, []);

  // Fetch existing product data if in edit mode
  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productApi.getById(Number(id));
        const p = res.data;
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: String(p.price || ''),
          stockQuantity: String(p.stockQuantity ?? ''),
          categoryId: String(p.categoryId || ''),
          imageUrl: p.imageUrl || '',
          videoUrl: p.videoUrl || '',
          whatsappLink: p.whatsappLink || '',
        });

        if (p.videoUrl) {
          setMediaType('video');
          setMediaPreview(p.videoUrl.startsWith('http') ? p.videoUrl : `http://localhost:8080${p.videoUrl}`);
        } else if (p.imageUrl) {
          setMediaType('image');
          setMediaPreview(p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:8080${p.imageUrl}`);
        }
      } catch {
        setError('Failed to load product details for editing.');
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

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaError('');
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setMediaError('Unsupported format. Please upload a photo (JPG, PNG, WebP) or video (MP4, WebM).');
      return;
    }

    // If video, enforce a 30-second duration maximum
    if (isVideo) {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration > 31) {
          setMediaError(`Video length is ${Math.round(videoElement.duration)}s. Maximum allowed is 30 seconds.`);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        setMediaFile(file);
        setMediaType('video');
        setMediaPreview(URL.createObjectURL(file));
      };
      videoElement.src = URL.createObjectURL(file);
    } else {
      // Image upload (mobile landscape or portrait)
      setMediaFile(file);
      setMediaType('image');
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    setMediaType(null);
    setMediaError('');
    setForm((prev) => ({ ...prev, imageUrl: '', videoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let finalImageUrl = form.imageUrl;
      let finalVideoUrl = form.videoUrl;

      // Upload media file if a new one was selected
      if (mediaFile) {
        const uploadRes = await uploadApi.image(mediaFile);
        if (mediaType === 'video') {
          finalVideoUrl = uploadRes.data.url;
        } else {
          finalImageUrl = uploadRes.data.url;
        }
      }

      const payload = {
        title: form.title.trim(),
        description: form.description ? form.description.trim() : null,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        categoryId: Number(form.categoryId),
        imageUrl: finalImageUrl && finalImageUrl.trim() !== '' ? finalImageUrl.trim() : null,
        videoUrl: finalVideoUrl && finalVideoUrl.trim() !== '' ? finalVideoUrl.trim() : null,
        whatsappLink: form.whatsappLink && form.whatsappLink.trim() !== '' ? form.whatsappLink.trim() : null,
      };

      if (isEdit) {
        await productApi.update(Number(id), payload);
      } else {
        await productApi.create(payload);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string }; message?: string } })
          .response?.data?.error || 'Failed to save product. Please check your network and fields.';
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
          {/* Title */}
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

          {/* Description */}
          <div>
            <label htmlFor="description" className="label-text">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Describe the product specs, condition, delivery options from Gikomba..."
            />
          </div>

          {/* Price & Stock */}
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

          {/* Clean Alphabetical Main Categories */}
          <div>
            <label htmlFor="categoryId" className="label-text">Main Category</label>
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
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Combined Image / 30s Video Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-text mb-0">Product Media (Photo or 30s Video)</label>
              <span className="text-xs text-gray-400">Mobile portrait & landscape supported</span>
            </div>

            {mediaPreview ? (
              <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200 bg-black/5 flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video
                    src={mediaPreview}
                    controls
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    /* object-contain prevents portrait and landscape smartphone photos from stretching */
                    className="w-full h-full object-contain"
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition shadow-md"
                  title="Remove media"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-jenga-500 hover:bg-jenga-50 transition-colors bg-gray-50/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-xs font-semibold">/</span>
                    <Video className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload product photo or short video
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Images (JPG, PNG, WebP up to 5MB) • Short Video (MP4, WebM max 30s)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  /* Accepts images and MP4/WebM video formats */
                  accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm"
                  onChange={handleMediaChange}
                  className="hidden"
                />
              </label>
            )}

            {mediaError && (
              <p className="text-xs text-accent-red font-medium mt-1.5">{mediaError}</p>
            )}
            {!mediaPreview && !mediaError && (
              <p className="text-xs text-gray-400 mt-1">No file selected</p>
            )}
          </div>

          {/* WhatsApp Contact Link */}
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
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