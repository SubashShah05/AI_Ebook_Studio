import Project from '../models/Project.js';
import Book from '../models/Book.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
    // Attach book counts
    const projectsWithStats = await Promise.all(projects.map(async (p) => {
      const bookCount = await Book.countDocuments({ owner: req.user._id, projectId: p._id, isArchived: false });
      return { ...p.toObject(), bookCount };
    }));
    res.json(projectsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const books = await Book.find({ owner: req.user._id, projectId: project._id, isArchived: false }).sort({ updatedAt: -1 });
    res.json({ ...project.toObject(), books });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  const { name, description, category, color } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'Project name is required' });
  try {
    const project = await Project.create({
      name: name.trim(),
      description: description || '',
      category: category || 'General',
      color: color || '#6366f1',
      owner: req.user._id
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { name, description, category, color } = req.body;
    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description;
    if (category) project.category = category;
    if (color) project.color = color;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Unlink books from deleted project
    await Book.updateMany({ projectId: project._id, owner: req.user._id }, { $set: { projectId: null } });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
