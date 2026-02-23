import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Globe, AlertCircle, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { Language } from '../types';

const CreateEditNews: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    base_language: 'en' as Language,
    coverage: 'local',
    category: 'General',
    published: 'true',
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchNews();
    }
  }, [id]);

  const fetchNews = async () => {
    try {
      const response = await api.get(`/news/${id}`);
      const news = response.data;
      setFormData({
        title: news[`title_${news.base_language}`],
        content: news[`content_${news.base_language}`],
        base_language: news.base_language,
        coverage: news.coverage,
        category: news.category,
        published: news.published ? 'true' : 'false',
      });
      if (news.image_url) setPreview(news.image_url);
    } catch (error) {
      setError('Failed to fetch news details');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (image) data.append('image', image);
    if (isEdit && preview && !image) data.append('existing_image', preview);

    try {
      if (isEdit) {
        await api.put(`/news/${id}`, data);
      } else {
        await api.post('/news', data);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save news');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit News Article' : 'Create News Article'}
        </h1>
        <div className="flex items-center text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4 mr-1" />
          AI Auto-Translation Enabled
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Base Language</label>
              <select
                value={formData.base_language}
                onChange={(e) => setFormData({ ...formData, base_language: e.target.value as Language })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">Write in this language, we'll translate to others.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Coverage</label>
              <select
                value={formData.coverage}
                onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="local">Local</option>
                <option value="national">National</option>
                <option value="international">International</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter headline..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
            <textarea
              required
              rows={10}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your news story here..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            ></textarea>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Media & Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
              <div className="relative group">
                {preview ? (
                  <div className="relative h-48 rounded-2xl overflow-hidden border border-gray-200">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm">
                        Change Image
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-500">Click to upload image</span>
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Politics, Sports, Tech"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="published"
                      value="true"
                      checked={formData.published === 'true'}
                      onChange={(e) => setFormData({ ...formData, published: e.target.value })}
                      className="hidden"
                    />
                    <div className={`p-3 text-center rounded-xl border font-medium transition-all ${
                      formData.published === 'true' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}>
                      Publish
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="published"
                      value="false"
                      checked={formData.published === 'false'}
                      onChange={(e) => setFormData({ ...formData, published: e.target.value })}
                      className="hidden"
                    />
                    <div className={`p-3 text-center rounded-xl border font-medium transition-all ${
                      formData.published === 'false' 
                        ? 'bg-amber-50 border-amber-200 text-amber-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}>
                      Draft
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {isEdit ? 'Update Article' : 'Publish Article'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditNews;
