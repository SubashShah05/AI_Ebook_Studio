import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import SortableChapterItem from '../components/SortableChapterItem';

// DnD Kit Infrastructure Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Save, Plus, FileSpreadsheet, Loader2, RefreshCw } from 'lucide-react';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { register, handleSubmit, setValue } = useForm();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadData = async () => {
    try {
      const [bookRes, chaptersRes] = await Promise.all([
        API.get(`/books/${id}`),
        API.get(`/chapters/book/${id}`)
      ]);
      
      setValue('title', bookRes.data.title);
      setValue('subtitle', bookRes.data.subtitle);
      setValue('author', bookRes.data.author);
      setChapters(chaptersRes.data);
    } catch (err) {
      triggerToast('Error updating active record tracking parameters state context data scope', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleMetaUpdate = async (data) => {
    setUpdating(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('subtitle', data.subtitle);
    formData.append('author', data.author);
    if (data.coverImage?.[0]) {
      formData.append('coverImage', data.coverImage[0]);
    }

    try {
      await API.put(`/books/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      triggerToast('eBook metadata properties sequence saved.');
      loadData();
    } catch (err) {
      triggerToast('Error mapping update fields block', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = chapters.findIndex((c) => c._id === active.id);
      const newIndex = chapters.findIndex((c) => c._id === over.id);
      
      const revised = arrayMove(chapters, oldIndex, newIndex).map((ch, idx) => ({
        ...ch,
        order: idx
      }));
      setChapters(revised);

      try {
        await API.post('/chapters/reorder', {
          orders: revised.map(c => ({ id: c._id, order: c.order }))
        });
      } catch (err) {
        triggerToast('Error saving remote order layout sequencing logic', 'error');
      }
    }
  };

  const addBlankChapter = async () => {
    const title = prompt("Enter new chapter title configuration:");
    if (!title) return;
    try {
      const res = await API.post('/chapters', { bookId: id, title, description: 'User injected manual placeholder chapter.' });
      setChapters([...chapters, res.data]);
      triggerToast('Chapter node template cataloged.');
    } catch (err) {
      triggerToast('Failed adding entity sequence block', 'error');
    }
  };

  const deleteChapterNode = async (chapterId) => {
    if (!window.confirm("Archiving individual chapter context out node template permanently?")) return;
    try {
      await API.delete(`/chapters/${chapterId}`);
      setChapters(chapters.filter(c => c._id !== chapterId));
      triggerToast('Chapter removed.');
    } catch (err) {
      triggerToast('Could not slice sequence array data block target', 'error');
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" /> Loading eBook Engine Context Workspace Setup...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Configuration Matrix Metadata column panel block layout entry view column settings mapping */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm self-start">
        <h3 className="font-bold text-slate-800 text-lg border-b pb-3 mb-4">Metadata Specs</h3>
        <form onSubmit={handleSubmit(handleMetaUpdate)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Title</label>
            <input type="text" {...register('title')} className="w-full border p-2 rounded text-sm focus:outline-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subtitle</label>
            <input type="text" {...register('subtitle')} className="w-full border p-2 rounded text-sm focus:outline-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Author</label>
            <input type="text" {...register('author')} className="w-full border p-2 rounded text-sm focus:outline-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Upload New Cover Media File</label>
            <input type="file" {...register('coverImage')} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          </div>
          <button type="submit" disabled={updating} className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded text-sm transition">
            {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Modifications Specs
          </button>
        </form>
      </div>

      {/* Right Column workspace outline block workflow architecture panel mapping engine layout components */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Table of Contents Blueprint</h3>
              <p className="text-xs text-slate-500">Drag items to update ordering coordinates. Select a chapter node block to engage the Markdown editing system workspace engine interface panels.</p>
            </div>
            <button onClick={addBlankChapter} className="inline-flex items-center gap-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition">
              <Plus className="w-4 h-4" /> Add Chapter
            </button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={chapters.map(c => c._id)} verticalListSortingStrategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {chapters.map((chapter) => (
                  <SortableChapterItem key={chapter._id} chapter={chapter} onDelete={deleteChapterNode} />
                ))}
                {chapters.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-6">Empty structural configuration blueprint. Populate layout elements above manually.</p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}