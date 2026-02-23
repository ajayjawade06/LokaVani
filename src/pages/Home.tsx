import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search, TrendingUp, Newspaper } from 'lucide-react';
import api from '../utils/api';
import { News, Language } from '../types';
import NewsCard from '../components/NewsCard';
import { motion } from 'motion/react';

interface HomeProps {
  lang: Language;
}

const Home: React.FC<HomeProps> = ({ lang }) => {
  const { coverage } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (coverage) params.coverage = coverage;
        const search = searchParams.get('search');
        if (search) params.search = search;
        
        const response = await api.get('/news', { params });
        setNewsList(response.data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [coverage, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search: searchTerm });
  };

  const translations = {
    en: {
      latest: 'Latest News',
      search: 'Search news...',
      noNews: 'No news found.',
      heroTitle: 'Voice of the People, in Every Language.',
      heroSub: 'Stay updated with the latest local, national, and international news translated instantly for you.',
    },
    hi: {
      latest: 'ताज़ा समाचार',
      search: 'समाचार खोजें...',
      noNews: 'कोई समाचार नहीं मिला।',
      heroTitle: 'लोगों की आवाज़, हर भाषा में।',
      heroSub: 'आपके लिए तुरंत अनुवादित नवीनतम स्थानीय, राष्ट्रीय और अंतर्राष्ट्रीय समाचारों के साथ अपडेट रहें।',
    },
    mr: {
      latest: 'ताज्या बातम्या',
      search: 'बातमी शोधा...',
      noNews: 'कोणतीही बातमी सापडली नाही.',
      heroTitle: 'लोकांचा आवाज, प्रत्येक भाषेत.',
      heroSub: 'तुमच्यासाठी त्वरित अनुवादित केलेल्या ताज्या स्थानिक, राष्ट्रीय आणि आंतरराष्ट्रीय बातम्यांसह अपडेट रहा.',
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {!coverage && !searchParams.get('search') && (
        <section className="bg-indigo-900 text-white py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"></div>
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight"
            >
              {t.heroTitle}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto"
            >
              {t.heroSub}
            </motion.p>
            
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 group-focus-within:text-white" />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-indigo-900 px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <Newspaper className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {coverage ? coverage.charAt(0).toUpperCase() + coverage.slice(1) + ' News' : t.latest}
            </h2>
          </div>
          
          {coverage && (
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              Trending in {coverage}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : newsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NewsCard news={news} lang={lang} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">{t.noNews}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
