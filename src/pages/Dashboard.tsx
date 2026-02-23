import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, BarChart3, Newspaper, CheckCircle2, Clock } from 'lucide-react';
import api from '../utils/api';
import { News } from '../types';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get('/admin/news');
      setNewsList(response.data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this news?')) return;
    try {
      await api.delete(`/news/${id}`);
      setNewsList(newsList.filter((n) => n.id !== id));
    } catch (error) {
      alert('Failed to delete news');
    }
  };

  const stats = [
    { label: 'Total Posts', value: newsList.length, icon: Newspaper, color: 'bg-blue-50 text-blue-600' },
    { label: 'Published', value: newsList.filter(n => n.published).length, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
    { label: 'Drafts', value: newsList.filter(n => !n.published).length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reporter Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your news articles and publications</p>
        </div>
        <Link
          to="/news/create"
          className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center">
            <div className={`p-4 rounded-2xl mr-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* News Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">News Article</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Coverage</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : newsList.length > 0 ? (
                newsList.map((news) => (
                  <tr key={news.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={news.image_url || `https://picsum.photos/seed/${news.id}/100/100`}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-semibold text-gray-900 line-clamp-1">{news.title_en || news.title_hi || news.title_mr}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                        {news.coverage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {news.published ? (
                        <span className="inline-flex items-center text-green-600 text-sm font-medium">
                          <Eye className="w-4 h-4 mr-1" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-gray-400 text-sm font-medium">
                          <EyeOff className="w-4 h-4 mr-1" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(news.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/news/edit/${news.id}`}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(news.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                    No news articles found. Start by creating one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
