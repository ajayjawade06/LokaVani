import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateEditNews from './pages/CreateEditNews';
import NewsDetail from './pages/NewsDetail';
import ProtectedRoute from './components/ProtectedRoute';
import { Language } from './types';

export default function App() {
  const [lang, setLang] = useState<Language>('en');

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Navbar currentLang={lang} setLang={setLang} />
          <Routes>
            <Route path="/" element={<Home lang={lang} />} />
            <Route path="/coverage/:coverage" element={<Home lang={lang} />} />
            <Route path="/news/:id" element={<NewsDetail lang={lang} />} />
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news/create"
              element={
                <ProtectedRoute>
                  <CreateEditNews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news/edit/:id"
              element={
                <ProtectedRoute>
                  <CreateEditNews />
                </ProtectedRoute>
              }
            />
          </Routes>
          
          <footer className="bg-white border-t border-gray-100 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-2xl font-bold text-indigo-600 font-serif italic mb-4">LokaVani</p>
              <p className="text-gray-500 text-sm">© 2026 LokaVani News Portal. All rights reserved.</p>
              <div className="flex justify-center space-x-6 mt-6">
                <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">About</a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">Contact</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
