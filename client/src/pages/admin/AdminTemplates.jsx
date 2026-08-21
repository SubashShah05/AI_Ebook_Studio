import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import { FileText, Plus, Pencil, Archive, RotateCcw, X, Loader2 } from 'lucide-react';

const CATEGORIES = ['Business', 'Fiction', 'Self-Help', 'Educational', 'Technical', 'Marketing', 'Memoir', 'Children'];

function TemplateForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', category: 'Educational',
    genre: '', targetAudience: '', writingTone: 'Professional',
    chapters: [], tags: '', isPremium: false
  });
  const [loading, setLoading] = useState(false);

  const addChapter = () => setForm(f => ({ ...f, chapters: [...(f.chapters || []), { title: '', description: '' }] }));
  const removeChapter = (i) => setForm(f => ({ ...f, chapters: f.chapters.filter((_, idx) => idx !== i) }));
  const updateChapter = (i, field, val) => setForm(f => {
    const chs = [...f.chapters];
    chs[i] = { ...chs[i], [field]: val };
    return { ...f, chapters: chs };
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category) return triggerToast('Title and category required', 'error');
    setLoading(true);
    try {
      await onSave({
        ...form,
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 overflow-y-auto" onClick={onCancel}>
      <div className="w-full max-w-2xl bg-[#0B1220] border border-[#1E2535] rounded-2xl my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#1E2535]">
          <h2 className="text-lg font-bold text-white">{initial ? 'Edit Template' : 'New Template'}</h2>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-white hover:bg-[#1E2535] rounded-lg transition">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-[#080D1A] border border-[#1E2535] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Template title" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-[#080D1A] border border-[#1E2535] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full bg-[#080D1A] border border-[#1E2535] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="Template description" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Genre</label>
              <input value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                className="w-full bg-[#080D1A] border border-[#1E2535] rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Target Audience</label>
              <input value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
                className="w-full bg-[#080D1A] border border-[#1E2535] rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Writing Tone</label>
              <input value={form.writingTone} onChange={e => setForm(f => ({ ...f, writingTone: e.target.value }))}
                className="w-full bg-[#080D1A] border border-[#1E2535] rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tags (comma separated)</label>
            <input value={typeof form.tags === 'string' ? form.tags : (form.tags || []).join(', ')}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className="w-full bg-[#080D1A] border border-[#1E2535] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              placeholder="business, strategy, leadership" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPremium" checked={!!form.isPremium}
              onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))}
              className="rounded" />
            <label htmlFor="isPremium" className="text-sm text-slate-400">Premium template (Pro/Business only)</label>
          </div>

          {/* Chapters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">Chapter Structure</label>
              <button type="button" onClick={addChapter}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
                <Plus size={12} /> Add Chapter
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(form.chapters || []).map((ch, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-[#080D1A] border border-[#1E2535] rounded-lg">
                  <span className="text-xs text-slate-600 mt-2 w-4 shrink-0">{i + 1}.</span>
                  <div className="flex-1 space-y-1">
                    <input value={ch.title} onChange={e => updateChapter(i, 'title', e.target.value)}
                      placeholder="Chapter title" className="w-full bg-transparent text-sm text-white focus:outline-none border-b border-[#1E2535] pb-1" />
                    <input value={ch.description} onChange={e => updateChapter(i, 'description', e.target.value)}
                      placeholder="Brief description" className="w-full bg-transparent text-xs text-slate-500 focus:outline-none" />
                  </div>
                  <button type="button" onClick={() => removeChapter(i)}
                    className="text-slate-600 hover:text-rose-400 transition mt-1"><X size={13} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {initial ? 'Save Changes' : 'Create Template'}
            </button>
            <button type="button" onClick={onCancel}
              className="px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-[#1E2535] rounded-lg transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/templates?includeArchived=${showArchived}`);
      setTemplates(res.data);
    } catch {
      triggerToast('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [showArchived]);

  const handleCreate = async (data) => {
    try {
      await API.post('/admin/templates', data);
      triggerToast('Template created!');
      setShowForm(false);
      load();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Create failed', 'error');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await API.put(`/admin/templates/${editing._id}`, data);
      triggerToast('Template updated!');
      setEditing(null);
      load();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleArchive = async (t) => {
    if (!window.confirm(`Archive "${t.title}"?`)) return;
    setActionId(t._id);
    try {
      await API.put(`/admin/templates/${t._id}/archive`);
      triggerToast(`"${t.title}" archived.`);
      load();
    } catch {
      triggerToast('Archive failed', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleRestore = async (t) => {
    setActionId(t._id);
    try {
      await API.put(`/admin/templates/${t._id}/restore`);
      triggerToast(`"${t.title}" restored.`);
      load();
    } catch {
      triggerToast('Restore failed', 'error');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Template Management</h1>
          <p className="text-sm text-slate-500 mt-1">{templates.length} templates</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
            Show archived
          </label>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition">
            <Plus size={15} /> New Template
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="text-indigo-500 animate-spin" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-[#0B1220] border border-[#1E2535] rounded-xl">
          <FileText size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No templates yet.</p>
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg">Create First Template</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t._id} className={`bg-[#0B1220] border rounded-xl p-4 space-y-3 ${t.isArchived ? 'border-slate-700 opacity-60' : 'border-[#1E2535]'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">{t.category}</span>
                    {t.isPremium && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">PREMIUM</span>}
                  </div>
                </div>
                {t.isArchived ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-500">ARCHIVED</span>
                ) : null}
              </div>
              {t.description && <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>}
              <p className="text-xs text-slate-600">{t.chapters?.length || 0} chapters</p>
              <div className="flex gap-2 pt-1">
                {!t.isArchived ? (
                  <>
                    <button onClick={() => setEditing(t)}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-[#1E2535] text-slate-400 hover:text-white rounded-lg transition">
                      <Pencil size={11} /> Edit
                    </button>
                    {actionId === t._id ? <Loader2 size={14} className="text-slate-500 animate-spin my-auto" /> : (
                      <button onClick={() => handleArchive(t)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-lg transition">
                        <Archive size={11} /> Archive
                      </button>
                    )}
                  </>
                ) : (
                  actionId === t._id ? <Loader2 size={14} className="text-slate-500 animate-spin my-auto" /> : (
                    <button onClick={() => handleRestore(t)}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition">
                      <RotateCcw size={11} /> Restore
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <TemplateForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}
      {editing && <TemplateForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />}
    </div>
  );
}
