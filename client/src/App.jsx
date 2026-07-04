
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // Import here
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateBook from './pages/CreateBook';
import BookDetails from './pages/BookDetails';
import ChapterEditor from './pages/ChapterEditor';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider> {/* Add wrapper here */}
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/create" element={<PrivateRoute><CreateBook /></PrivateRoute>} />
                <Route path="/books/:id" element={<PrivateRoute><BookDetails /></PrivateRoute>} />
                <Route path="/chapters/:id" element={<PrivateRoute><ChapterEditor /></PrivateRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}