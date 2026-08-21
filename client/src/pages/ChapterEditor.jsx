import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import VersionHistoryPanel from '../components/VersionHistoryPanel';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { 
  ArrowLeft, Eye, Edit3, Loader2, Download, FileText, Code, CheckCircle2, 
  AlertCircle, Type, Bold, Italic, List, ListOrdered, Quote, Minus, 
  Image as ImageIcon, Wand2, Link as LinkIcon, SplitSquareHorizontal, 
  LayoutTemplate, X, Check, Copy, RefreshCw, Send, MessageSquareText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Central reading constant
const WORDS_PER_MINUTE = 200;

export default function ChapterEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data States
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [markdown, setMarkdown] = useState('');
  
  // UI States
  const [mode, setMode] = useState(window.innerWidth > 1024 ? 'split' : 'edit'); 
  const [saveStatus, setSaveStatus] = useState('idle'); 
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // AI Assistant States
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiActionHistory, setAiActionHistory] = useState([]); // [{ action, time }]
  const [lastActionContext, setLastActionContext] = useState(null); // For regenerate
  
  // Refs
  const editorRef = useRef(null);
  const exportRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const lastSavedContentRef = useRef('');
  const isSavingRef = useRef(false);

  // 1. DATA LOADING
  useEffect(() => {
    let isMounted = true;
    
    const loadEditorData = async () => {
      try {
        const chRes = await API.get(`/chapters/${id}`);
        const currentChapter = Array.isArray(chRes.data) ? chRes.data[0] : chRes.data;
        
        if (!isMounted) return;

        setChapter(currentChapter);
        
        const draftKey = `ai-ebook-studio:draft:${id}`;
        const localDraft = localStorage.getItem(draftKey);
        
        let initialContent = currentChapter.markdownContent || '';
        
        if (localDraft && localDraft !== initialContent) {
          if (window.confirm("Recovered unsaved changes are available. Do you want to restore them?")) {
            initialContent = localDraft;
            setSaveStatus('unsaved');
          } else {
            localStorage.removeItem(draftKey);
          }
        }
        
        setMarkdown(initialContent);
        lastSavedContentRef.current = currentChapter.markdownContent || '';
        
        if (currentChapter.bookId) {
          const [bkRes, siblingRes] = await Promise.all([
            API.get(`/books/${currentChapter.bookId}`),
            API.get(`/chapters/book/${currentChapter.bookId}`)
          ]);
          if (!isMounted) return;
          setBook(bkRes.data);
          setChapters(siblingRes.data);
        }
        
      } catch (err) {
        triggerToast('Failed to load chapter data.', 'error');
      }
    };
    
    loadEditorData();
    
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024 && mode === 'split') {
        setMode('edit');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode]);

  // 2. AUTOSAVE LOGIC
  const saveContent = useCallback(async (contentToSave, isManual = false, versionSource = 'autosave') => {
    if (isSavingRef.current || contentToSave === lastSavedContentRef.current) return;
    
    isSavingRef.current = true;
    setSaveStatus('saving');
    
    try {
      await API.put(`/chapters/${id}`, { 
        markdownContent: contentToSave,
        versionSource: isManual ? 'manual' : versionSource
      });
      lastSavedContentRef.current = contentToSave;
      setSaveStatus('saved');
      localStorage.removeItem(`ai-ebook-studio:draft:${id}`);
    } catch (err) {
      setSaveStatus('failed');
      if (isManual) triggerToast('Unable to save changes.', 'error');
    } finally {
      isSavingRef.current = false;
    }
  }, [id]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    setMarkdown(newValue);
    setSaveStatus('unsaved');
    localStorage.setItem(`ai-ebook-studio:draft:${id}`, newValue);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveContent(newValue);
    }, 1500);
  };

  const manualSave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    saveContent(markdown, true);
  }, [markdown, saveContent]);

  // 3. NAVIGATION PROTECTION
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === 'unsaved' || saveStatus === 'failed') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  const handleChapterSwitch = (targetChapterId) => {
    if (targetChapterId === id) return;
    if ((saveStatus === 'unsaved' || saveStatus === 'failed') && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) return;
    navigate(`/chapters/${targetChapterId}`);
  };

  const handleBackToWorkspace = () => {
    if ((saveStatus === 'unsaved' || saveStatus === 'failed') && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) return;
    navigate(`/books/${chapter?.bookId}`);
  };

  // 4. METRICS CALCULATION
  const metrics = useMemo(() => {
    const chars = markdown.length;
    const words = markdown.trim().length === 0 ? 0 : markdown.trim().split(/\s+/).length;
    const readingTimeMins = Math.ceil(words / WORDS_PER_MINUTE);
    const readingTimeStr = readingTimeMins > 1 ? `${readingTimeMins} min` : `< 1 min`;
    return { chars, words: words.toLocaleString(), readingTimeStr };
  }, [markdown]);

  // 5. TOOLBAR & SHORTCUTS
  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    
    const newText = text.substring(0, start) + prefix + selection + suffix + text.substring(end);
    
    setMarkdown(newText);
    setSaveStatus('unsaved');
    localStorage.setItem(`ai-ebook-studio:draft:${id}`, newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => saveContent(newText), 1500);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); insertMarkdown('**', '**'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); insertMarkdown('_', '_'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); manualSave(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'j') { e.preventDefault(); toggleAIAssistant(); }
  };

  // 6. AI ASSISTANT LOGIC
  const toggleAIAssistant = () => {
    if (!isAIAssistantOpen) {
      // Capture selection
      const textarea = editorRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        if (start !== end) {
          setSelectedText(textarea.value.substring(start, end));
        } else {
          setSelectedText('');
        }
      }
    }
    setIsAIAssistantOpen(!isAIAssistantOpen);
  };

  const executeAIAction = async (action, instruction = '') => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiResult('');
    
    const contextSettings = { action, instruction, selectedText };
    setLastActionContext(contextSettings);
    
    try {
      // Grab nearby context if no text selected
      let nearbyContext = '';
      if (!selectedText && editorRef.current) {
        const text = editorRef.current.value;
        const cursorPos = editorRef.current.selectionStart;
        nearbyContext = text.substring(Math.max(0, cursorPos - 1000), cursorPos); // last 1000 chars before cursor
      }

      const res = await API.post('/ai/assist', {
        action,
        bookId: book._id,
        chapterId: chapter._id,
        selectedText,
        instruction,
        nearbyContext
      });
      
      setAiResult(res.data.result);
      setAiActionHistory(prev => [{ action, time: new Date() }, ...prev].slice(0, 5));
    } catch (err) {
      triggerToast(err.response?.data?.message || 'AI could not complete request.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const acceptAIResult = () => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    let newText;
    if (selectedText) {
      newText = text.substring(0, start) + aiResult + text.substring(end);
    } else {
      newText = text.substring(0, start) + aiResult + text.substring(start);
    }

    setMarkdown(newText);
    setSaveStatus('unsaved');
    localStorage.setItem(`ai-ebook-studio:draft:${id}`, newText);
    
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => saveContent(newText, false, 'ai'), 1500);

    setAiResult('');
    setSelectedText('');
  };

  const copyAIResult = () => {
    navigator.clipboard.writeText(aiResult);
    triggerToast('Copied to clipboard!');
  };

  const handleCustomPromptSubmit = (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    executeAIAction('customPrompt', customPrompt);
    setCustomPrompt('');
  };

  // 7. EXPORTS
  const exportAsMarkdown = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([markdown], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${chapter?.title?.replace(/\s+/g, '_') || 'Chapter'}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      triggerToast('Markdown downloaded successfully!');
    } catch (error) {
      triggerToast('Failed to download Markdown', 'error');
    }
    setShowExportMenu(false);
  };

  const exportAsPDF = () => {
    try {
      const element = exportRef.current;
      const options = {
        margin: 1,
        filename: `${chapter?.title?.replace(/\s+/g, '_') || 'Chapter'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      triggerToast('Generating PDF...');
      html2pdf().set(options).from(element).save();
    } catch (error) {
      triggerToast('PDF generation failed', 'error');
    }
    setShowExportMenu(false);
  };

  if (!chapter) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* Hidden Div for PDF Export */}
      <div className="hidden">
        <div ref={exportRef} className="p-10 bg-white text-slate-900 font-sans leading-relaxed space-y-6">
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>{chapter.title}</h1>
          <div style={{ marginTop: '20px' }}>
            <ReactMarkdown>{markdown || '*Empty Chapter*'}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={handleBackToWorkspace} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0" title="Back to Workspace">
            <ArrowLeft size={18} />
          </button>
          
          <button onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shrink-0">
            <List size={18} />
          </button>

          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{book?.title || 'Loading Book...'}</span>
            <span className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{chapter.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium mr-2">
            {saveStatus === 'saving' && <><Loader2 size={14} className="animate-spin text-slate-400" /><span className="text-slate-500">Saving...</span></>}
            {saveStatus === 'saved' && <><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-slate-500">Saved</span></>}
            {saveStatus === 'unsaved' && <><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-slate-500">Unsaved changes</span></>}
            {saveStatus === 'failed' && <><AlertCircle size={14} className="text-rose-500" /><span className="text-rose-500">Save failed</span></>}
          </div>
          <button onClick={manualSave} disabled={saveStatus === 'saving' || saveStatus === 'saved'} className="hidden sm:flex px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 text-xs font-bold rounded-md transition items-center disabled:opacity-50">
            Save
          </button>
          <button 
            onClick={() => setIsHistoryOpen(true)} 
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-md transition flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={isHistoryOpen ? 'animate-spin' : ''} /> History
          </button>
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-md transition flex items-center">
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1">
                <button onClick={exportAsPDF} className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <FileText size={14} className="text-rose-500" /> Print PDF
                </button>
                <button onClick={exportAsMarkdown} className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <Code size={14} className="text-sky-500" /> Markdown
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR (Left) */}
        <aside className={`absolute lg:relative z-20 inset-y-0 left-0 w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center bg-white dark:bg-[#0f1523]">
            <span>Chapters</span>
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 rounded">{chapters.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {chapters.map((ch, idx) => (
              <button 
                key={ch._id}
                onClick={() => handleChapterSwitch(ch._id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 truncate ${ch._id === id ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
              >
                <span className="text-xs opacity-60 w-4">{idx + 1}.</span>
                <span className="truncate">{ch.title || 'Untitled'}</span>
              </button>
            ))}
          </div>
        </aside>
        
        {isMobileSidebarOpen && (
          <div className="absolute inset-0 bg-slate-900/20 z-10 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)}></div>
        )}

        {/* MAIN WORKSPACE (Center) */}
        <main className="flex-1 flex flex-col bg-white dark:bg-[#0f1523] min-w-0">
          
          {/* Markdown Toolbar & Mode Switcher */}
          <div className="flex-shrink-0 h-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between px-2 overflow-x-auto custom-scrollbar">
            
            {/* Toolbar Buttons */}
            <div className={`flex items-center gap-1 ${mode === 'preview' ? 'opacity-30 pointer-events-none' : ''}`}>
              <button onClick={() => insertMarkdown('## ')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition"><Type size={16} /></button>
              <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition"><Bold size={16} /></button>
              <button onClick={() => insertMarkdown('_', '_')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition"><Italic size={16} /></button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
              <button onClick={() => insertMarkdown('- ')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition"><List size={16} /></button>
              <button onClick={() => insertMarkdown('1. ')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition"><ListOrdered size={16} /></button>
              <button onClick={() => insertMarkdown('> ')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition"><Quote size={16} /></button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
              <button onClick={() => insertMarkdown('[', '](https://)')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition"><LinkIcon size={16} /></button>
              <button onClick={() => insertMarkdown('![alt text](', ')')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition"><ImageIcon size={16} /></button>
              <button onClick={() => insertMarkdown('\n---\n')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition"><Minus size={16} /></button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
              <button onClick={toggleAIAssistant} className={`p-1.5 rounded transition flex items-center gap-1 ${isAIAssistantOpen ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-600 dark:text-white' : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30'}`}>
                <Wand2 size={16} /> <span className="text-xs font-bold hidden sm:inline">AI Assist</span>
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex bg-slate-200/50 dark:bg-slate-800 p-0.5 rounded-lg shrink-0 mr-2">
              <button onClick={() => setMode('edit')} className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${mode === 'edit' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                <Edit3 size={14} /> <span className="hidden sm:inline">Edit</span>
              </button>
              <button onClick={() => setMode('preview')} className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${mode === 'preview' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                <Eye size={14} /> <span className="hidden sm:inline">Preview</span>
              </button>
              {window.innerWidth > 1024 && (
                <button onClick={() => setMode('split')} className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${mode === 'split' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                  <SplitSquareHorizontal size={14} /> <span className="hidden sm:inline">Split</span>
                </button>
              )}
            </div>
          </div>

          {/* Editor & Preview Area */}
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* Editor Pane */}
            {(mode === 'edit' || mode === 'split') && (
              <div className={`flex-1 h-full relative ${mode === 'split' ? 'border-r border-slate-200 dark:border-slate-800' : ''}`}>
                {markdown.length === 0 && (
                  <div className="absolute top-8 left-8 right-8 text-center pointer-events-none text-slate-300 dark:text-slate-600">
                    <p className="font-medium">Start writing your chapter...</p>
                  </div>
                )}
                <textarea
                  ref={editorRef}
                  value={markdown}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  onMouseUp={() => {
                     if(isAIAssistantOpen && editorRef.current) {
                        const start = editorRef.current.selectionStart;
                        const end = editorRef.current.selectionEnd;
                        if (start !== end) setSelectedText(editorRef.current.value.substring(start, end));
                     }
                  }}
                  className="w-full h-full p-8 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 bg-transparent resize-none focus:outline-none custom-scrollbar"
                  spellCheck="false"
                />
              </div>
            )}

            {/* Preview Pane */}
            {(mode === 'preview' || mode === 'split') && (
              <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#0f1523]">
                <div className="p-8 prose dark:prose-invert max-w-3xl mx-auto prose-indigo prose-headings:font-bold prose-a:text-indigo-600">
                  {markdown ? (
                    <ReactMarkdown>{markdown}</ReactMarkdown>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 mt-20">
                      <LayoutTemplate size={48} className="mb-4 opacity-50" />
                      <p>Nothing to preview yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
          
          {/* BOTTOM STATUS BAR */}
          <footer className="flex-shrink-0 h-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 text-[11px] font-medium text-slate-500">
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">{metrics.chars} characters</span>
              <span>{metrics.words} words</span>
              <span>≈ {metrics.readingTimeStr} read</span>
            </div>
            
            <div className="flex sm:hidden items-center gap-1.5">
               {saveStatus === 'saving' && <span className="text-slate-500">Saving...</span>}
               {saveStatus === 'saved' && <span className="text-emerald-500">Saved</span>}
               {saveStatus === 'unsaved' && <span className="text-amber-500">Unsaved</span>}
            </div>
          </footer>
        </main>

        {/* 7. AI ASSISTANT PANEL */}
        <AnimatePresence>
          {isAIAssistantOpen && (
            <>
              {/* Mobile overlay */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="lg:hidden absolute inset-0 bg-slate-900/40 z-30" 
                onClick={() => setIsAIAssistantOpen(false)}
              />
              
              {/* Panel Drawer */}
              <motion.aside 
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 lg:relative z-40 w-[380px] max-w-full h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl lg:shadow-none"
              >
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-indigo-50/50 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <Wand2 size={18} />
                    <h3 className="font-bold">AI Assistant</h3>
                  </div>
                  <button onClick={() => setIsAIAssistantOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                  
                  {/* Selected Text Context */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                      <span>{selectedText ? 'Target: Selected Text' : 'Target: Chapter Context'}</span>
                      {selectedText && <span className="text-indigo-500">{selectedText.length} chars</span>}
                    </div>
                    {selectedText ? (
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic line-clamp-3">"{selectedText}"</p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-500">No text selected. AI will continue writing or use nearby context.</p>
                    )}
                  </div>

                  {/* Actions Grid */}
                  {!aiResult && !aiLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Core Actions</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => executeAIAction(selectedText ? 'improveWriting' : 'continueWriting')} className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition text-center shadow-sm">
                            {selectedText ? 'Improve' : 'Continue Writing'}
                          </button>
                          <button onClick={() => executeAIAction('rewrite')} disabled={!selectedText} className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition text-center shadow-sm disabled:opacity-50 disabled:hover:border-slate-200">
                            Rewrite
                          </button>
                          <button onClick={() => executeAIAction('expand')} disabled={!selectedText} className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition text-center shadow-sm disabled:opacity-50 disabled:hover:border-slate-200">
                            Expand
                          </button>
                          <button onClick={() => executeAIAction('shorten')} disabled={!selectedText} className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition text-center shadow-sm disabled:opacity-50 disabled:hover:border-slate-200">
                            Shorten
                          </button>
                          <button onClick={() => executeAIAction('simplify')} disabled={!selectedText} className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition text-center shadow-sm disabled:opacity-50 disabled:hover:border-slate-200">
                            Simplify
                          </button>
                          <button onClick={() => executeAIAction('summarize')} disabled={!selectedText} className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition text-center shadow-sm disabled:opacity-50 disabled:hover:border-slate-200">
                            Summarize
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Change Tone</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Professional', 'Academic', 'Conversational'].map(t => (
                            <button key={t} onClick={() => executeAIAction(`tone_${t.toLowerCase()}`)} disabled={!selectedText} className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/50 transition disabled:opacity-50">
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ask AI</h4>
                        <form onSubmit={handleCustomPromptSubmit} className="relative">
                          <input 
                            type="text" 
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Instruct the AI..."
                            className="w-full text-sm text-slate-900 dark:text-slate-100 p-3 pr-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                          <button type="submit" disabled={!customPrompt.trim()} className="absolute right-2 top-2 p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50">
                            <Send size={16} />
                          </button>
                        </form>
                      </div>

                    </motion.div>
                  )}

                  {/* AI Loading State */}
                  {aiLoading && (
                    <div className="py-12 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 space-y-4">
                      <div className="relative">
                        <Wand2 size={32} className="animate-pulse" />
                        <Loader2 size={48} className="absolute -top-2 -left-2 animate-spin opacity-20" />
                      </div>
                      <p className="text-sm font-semibold animate-pulse">Generating...</p>
                    </div>
                  )}

                  {/* AI Result Card */}
                  {aiResult && !aiLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-500/30 shadow-lg rounded-xl overflow-hidden flex flex-col">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 border-b border-indigo-100 dark:border-indigo-500/20 flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5"><MessageSquareText size={14}/> Result</span>
                        <button onClick={copyAIResult} className="text-indigo-500 hover:text-indigo-700 p-1" title="Copy"><Copy size={14}/></button>
                      </div>
                      <div className="p-4 max-h-64 overflow-y-auto custom-scrollbar text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                        {aiResult}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 justify-end">
                        <button onClick={() => { setAiResult(''); setLastActionContext(null); }} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition">
                          Cancel
                        </button>
                        <button onClick={() => executeAIAction(lastActionContext?.action, lastActionContext?.instruction)} className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-1">
                          <RefreshCw size={12} /> Retry
                        </button>
                        <button onClick={acceptAIResult} className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-lg transition flex items-center gap-1">
                          <Check size={14} /> {selectedText ? 'Replace' : 'Insert'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                  
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isHistoryOpen && (
            <VersionHistoryPanel
              chapterId={id}
              currentContent={markdown}
              onRestoreComplete={(restoredMarkdown) => {
                setMarkdown(restoredMarkdown);
                lastSavedContentRef.current = restoredMarkdown;
                setSaveStatus('saved');
                localStorage.removeItem(`ai-ebook-studio:draft:${id}`);
              }}
              onClose={() => setIsHistoryOpen(false)}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}