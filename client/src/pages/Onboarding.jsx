import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import { BookOpen, Users, PenTool, Globe, ChevronRight, Sun, Moon } from 'lucide-react';

const GENRES = ['Technical Books', 'Educational Books', 'Business Books', 'Fiction', 'Self Improvement', 'Marketing', 'Other'];
const AUDIENCES = ['Students', 'Professionals', 'Customers', 'General Readers', 'Personal Use', 'Other'];
const STYLES = ['Professional', 'Simple', 'Academic', 'Conversational', 'Storytelling', 'Persuasive'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

export default function Onboarding() {
  const { updateUser } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState({
    preferredGenre: '',
    targetAudience: '',
    writingStyle: '',
    preferredLanguage: 'English'
  });

  const handleNext = () => setStep(prev => prev + 1);

  const handleSelect = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    // Auto advance on selection for steps 2-5
    if (step < 5) {
      setTimeout(handleNext, 300);
    }
  };

  const completeOnboarding = async (skip = false) => {
    setIsSubmitting(true);
    try {
      const dataToSubmit = skip ? {} : preferences;
      const res = await API.put('/auth/onboarding', dataToSubmit);
      updateUser(res.data);
      triggerToast(skip ? 'Onboarding skipped.' : 'Workspace personalized successfully!');
      navigate('/dashboard');
    } catch (err) {
      triggerToast('Failed to save preferences. Redirecting to dashboard...', 'error');
      // If onboarding fails, we can still let them into the dashboard.
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-8 py-8">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <BookOpen size={40} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome to AI Ebook Studio</h2>
            <p className="text-slate-500 dark:text-[#CBD5E1] text-lg max-w-md mx-auto">
              Let's personalize your writing workspace to help you create exactly what you need.
            </p>
            <button
              onClick={handleNext}
              className="mt-8 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium py-3 px-8 rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">What do you want to create?</h2>
              <p className="text-slate-500 dark:text-[#CBD5E1]">Select your primary genre</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleSelect('preferredGenre', genre)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    preferences.preferredGenre === genre 
                      ? 'border-[#8B5CF6] bg-indigo-50 dark:bg-indigo-900/20 text-[#8B5CF6] shadow-md' 
                      : 'border-slate-200 dark:border-[#252B45] text-slate-600 dark:text-[#CBD5E1] hover:border-[#8B5CF6]/50 hover:bg-slate-50 dark:hover:bg-[#0f1523]'
                  }`}
                >
                  <span className="font-medium">{genre}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Who are you creating for?</h2>
              <p className="text-slate-500 dark:text-[#CBD5E1]">Select your target audience</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AUDIENCES.map(audience => (
                <button
                  key={audience}
                  onClick={() => handleSelect('targetAudience', audience)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    preferences.targetAudience === audience 
                      ? 'border-[#8B5CF6] bg-indigo-50 dark:bg-indigo-900/20 text-[#8B5CF6] shadow-md' 
                      : 'border-slate-200 dark:border-[#252B45] text-slate-600 dark:text-[#CBD5E1] hover:border-[#8B5CF6]/50 hover:bg-slate-50 dark:hover:bg-[#0f1523]'
                  }`}
                >
                  <span className="font-medium">{audience}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Choose your preferred writing style</h2>
              <p className="text-slate-500 dark:text-[#CBD5E1]">How should your eBook sound?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STYLES.map(style => (
                <button
                  key={style}
                  onClick={() => handleSelect('writingStyle', style)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    preferences.writingStyle === style 
                      ? 'border-[#8B5CF6] bg-indigo-50 dark:bg-indigo-900/20 text-[#8B5CF6] shadow-md' 
                      : 'border-slate-200 dark:border-[#252B45] text-slate-600 dark:text-[#CBD5E1] hover:border-[#8B5CF6]/50 hover:bg-slate-50 dark:hover:bg-[#0f1523]'
                  }`}
                >
                  <span className="font-medium">{style}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Choose your preferred language</h2>
              <p className="text-slate-500 dark:text-[#CBD5E1]">You can change this later in settings.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => handleSelect('preferredLanguage', lang)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    preferences.preferredLanguage === lang 
                      ? 'border-[#8B5CF6] bg-indigo-50 dark:bg-indigo-900/20 text-[#8B5CF6] shadow-md' 
                      : 'border-slate-200 dark:border-[#252B45] text-slate-600 dark:text-[#CBD5E1] hover:border-[#8B5CF6]/50 hover:bg-slate-50 dark:hover:bg-[#0f1523]'
                  }`}
                >
                  <span className="font-medium">{lang}</span>
                </button>
              ))}
            </div>
            <div className="pt-6">
              <button
                onClick={() => completeOnboarding(false)}
                disabled={isSubmitting || !preferences.preferredLanguage}
                className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium p-3 rounded-lg transition disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] flex justify-center items-center gap-2"
              >
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-white dark:bg-[#0f1523] text-slate-500 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#252B45] hover:bg-slate-100 dark:hover:bg-[#1a2136] transition shadow-sm"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <div className="w-full max-w-2xl">
        
        {/* Progress Indicator */}
        {step > 1 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-[#CBD5E1] mb-2 px-1">
              <span>Step {step - 1} of 4</span>
              <button 
                onClick={() => completeOnboarding(true)}
                disabled={isSubmitting}
                className="hover:text-[#8B5CF6] transition-colors"
              >
                Skip for now
              </button>
            </div>
            <div className="w-full bg-slate-200 dark:bg-[#252B45] rounded-full h-1.5 overflow-hidden">
              <motion.div 
                className="bg-[#8B5CF6] h-1.5 rounded-full"
                initial={{ width: `${((step - 2) / 4) * 100}%` }}
                animate={{ width: `${((step - 1) / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#0B1020] p-8 md:p-12 rounded-2xl shadow-xl border border-slate-100 dark:border-[#252B45] min-h-[400px] flex flex-col justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
