import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, ChevronRight } from 'lucide-react';
import { News, Language } from '../types';
import { format } from 'date-fns';

interface NewsCardProps {
  news: News;
  lang: Language;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, lang }) => {
  const title = news[`title_${lang}` as keyof News] || news[`title_${news.base_language}` as keyof News];
  const content = news[`content_${lang}` as keyof News] || news[`content_${news.base_language}` as keyof News];
  
  // Truncate content
  const excerpt = typeof content === 'string' ? content.substring(0, 120) + '...' : '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img
          src={news.image_url || `https://picsum.photos/seed/${news.id}/800/600`}
          alt={String(title)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
            {news.coverage}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center text-gray-400 text-[10px] font-medium uppercase tracking-widest mb-3">
          <Calendar className="w-3 h-3 mr-1" />
          {format(new Date(news.created_at), 'MMM dd, yyyy')}
          <span className="mx-2">•</span>
          <Tag className="w-3 h-3 mr-1" />
          {news.category}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {String(title)}
        </h3>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
          {excerpt}
        </p>
        
        <Link
          to={`/news/${news.id}`}
          className="inline-flex items-center text-indigo-600 text-sm font-semibold group/btn"
        >
          Read More
          <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default NewsCard;
