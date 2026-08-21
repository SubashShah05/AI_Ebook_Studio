import Template from '../models/Template.js';
import AuditLog from '../models/AuditLog.js';
import mongoose from 'mongoose';

const logAudit = async (adminId, action, targetId, metadata = {}, ip = '') => {
  try {
    await AuditLog.create({ adminId, action, targetType: 'Template', targetId, metadata, ip });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

const safeId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return id;
};

export const listTemplates = async (req, res) => {
  try {
    const filter = {};
    if (req.query.includeArchived !== 'true') filter.isArchived = false;
    if (req.query.category && req.query.category !== 'All') {
      const allowed = ['Business', 'Fiction', 'Self-Help', 'Educational', 'Technical', 'Marketing', 'Memoir', 'Children'];
      if (allowed.includes(req.query.category)) filter.category = req.query.category;
    }

    const templates = await Template.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load templates.' });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { title, description, category, genre, targetAudience, writingTone, chapters, tags, isPremium } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required.' });
    }

    const allowedCategories = ['Business', 'Fiction', 'Self-Help', 'Educational', 'Technical', 'Marketing', 'Memoir', 'Children'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category.' });
    }

    const safeChapters = (chapters || []).map((ch, i) => ({
      title: String(ch.title || '').trim().substring(0, 200),
      description: String(ch.description || '').trim().substring(0, 500),
      order: i
    }));

    const template = await Template.create({
      title: String(title).trim().substring(0, 200),
      description: String(description || '').trim().substring(0, 1000),
      category,
      genre: String(genre || '').trim(),
      targetAudience: String(targetAudience || '').trim(),
      writingTone: writingTone || 'Professional',
      chapters: safeChapters,
      chapterCount: safeChapters.length,
      tags: (tags || []).map(t => String(t).trim().substring(0, 50)),
      isPremium: !!isPremium,
      createdBy: req.user._id
    });

    await logAudit(req.user._id, 'create_template', template._id, { title: template.title }, req.ip);

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create template.' });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid template ID' });

    const template = await Template.findById(id);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    const { title, description, category, genre, targetAudience, writingTone, chapters, tags, isPremium } = req.body;

    const allowedCategories = ['Business', 'Fiction', 'Self-Help', 'Educational', 'Technical', 'Marketing', 'Memoir', 'Children'];
    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category.' });
    }

    if (title) template.title = String(title).trim().substring(0, 200);
    if (description !== undefined) template.description = String(description).trim().substring(0, 1000);
    if (category) template.category = category;
    if (genre !== undefined) template.genre = String(genre).trim();
    if (targetAudience !== undefined) template.targetAudience = String(targetAudience).trim();
    if (writingTone) template.writingTone = writingTone;
    if (chapters) {
      template.chapters = chapters.map((ch, i) => ({
        title: String(ch.title || '').trim().substring(0, 200),
        description: String(ch.description || '').trim().substring(0, 500),
        order: i
      }));
      template.chapterCount = template.chapters.length;
    }
    if (tags) template.tags = tags.map(t => String(t).trim().substring(0, 50));
    if (isPremium !== undefined) template.isPremium = !!isPremium;

    await template.save();
    await logAudit(req.user._id, 'update_template', id, { title: template.title }, req.ip);

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update template.' });
  }
};

export const archiveTemplate = async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid template ID' });

    const template = await Template.findById(id);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    template.isArchived = true;
    await template.save();
    await logAudit(req.user._id, 'archive_template', id, { title: template.title }, req.ip);

    res.json({ message: `Template "${template.title}" archived.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to archive template.' });
  }
};

export const restoreTemplate = async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid template ID' });

    const template = await Template.findById(id);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    template.isArchived = false;
    await template.save();
    await logAudit(req.user._id, 'restore_template', id, { title: template.title }, req.ip);

    res.json({ message: `Template "${template.title}" restored.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to restore template.' });
  }
};
