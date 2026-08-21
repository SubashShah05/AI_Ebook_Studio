import { TEMPLATES } from '../data/templates.js';

export const getTemplates = (req, res) => {
  const { category } = req.query;
  if (category && category !== 'All') {
    return res.json(TEMPLATES.filter(t => t.category === category));
  }
  res.json(TEMPLATES);
};

export const getTemplateById = (req, res) => {
  const template = TEMPLATES.find(t => t._id === req.params.id);
  if (!template) return res.status(404).json({ message: 'Template not found' });
  res.json(template);
};
