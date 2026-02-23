import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Tag, ArrowLeft, Share2, Facebook, Twitter, Link2 } from 'lucide-react';
import api from '../utils/api';
import { News, Language } from '../types';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface NewsDetailProps {
  lang: Language;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ lang }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get(`/news/${id}`);
        setNews(response.data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-10"></div>
        <div className="h-96 bg-gray-200 rounded-3xl mb-10"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">News not found</h1>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-medium">Return Home</button>
      </div>
    );
  }

  const title = news[`title_${lang}` as keyof News] || news[`title_${news.base_language}` as keyof News];
  const content = news[`content_${lang}` as keyof News] || news[`content_${news.base_language}` as keyof News];

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <header className="mb-10">
          <div className="flex items-center space-x-2 mb-4">
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">
              {news.coverage}
            </span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <Tag className="w-3 h-3 mr-1" />
              {news.category}
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-6">
            {String(title)}
          </h1>

          <div className="flex items-center justify-between border-y border-gray-100 py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                R
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Reporter</p>
                <p className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(news.created_at), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                <Link2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100">
          <img
            src={news.image_url || `https://picsum.photos/seed/${news.id}/1200/800`}
            alt={String(title)}
            className="w-full h-auto"
            referrerPolicy="no-referrer"
          />
        </div>

        <article className="prose prose-indigo max-w-none">
          <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
            <ReactMarkdown>{String(content)}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;
