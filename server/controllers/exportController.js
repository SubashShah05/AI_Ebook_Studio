import Book from '../models/Book.js';
import Chapter from '../models/Chapter.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, SectionType } from 'docx';
import Activity from '../models/Activity.js';

// Safe filename generator
const safeFilename = (title, ext) => {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
  return `ai-ebook-studio-${safe}.${ext}`;
};

import { getBookAccessRoleHelper } from '../middleware/permissionMiddleware.js';

// Fetch and validate book with ownership/access check
const getBookWithChapters = async (bookId, userId, reqBook) => {
  const book = reqBook || await Book.findById(bookId);
  if (!book) return null;

  if (!reqBook) {
    const role = await getBookAccessRoleHelper(book, userId);
    if (!role) return null;
  }

  const chapters = await Chapter.find({ bookId: book._id, status: 'completed' }).sort({ order: 1 });
  return { book, chapters };
};

// Simple markdown-to-plain-text stripper for DOCX paragraph content
const mdToLines = (markdown) => {
  if (!markdown) return [];
  return markdown
    .split('\n')
    .map(line => {
      // Detect heading levels
      const h3Match = line.match(/^###\s+(.*)/);
      const h2Match = line.match(/^##\s+(.*)/);
      const h1Match = line.match(/^#\s+(.*)/);
      if (h1Match) return { type: 'h1', text: h1Match[1] };
      if (h2Match) return { type: 'h2', text: h2Match[1] };
      if (h3Match) return { type: 'h3', text: h3Match[1] };

      // List items
      const listMatch = line.match(/^[-*]\s+(.*)/);
      if (listMatch) return { type: 'bullet', text: listMatch[1] };
      const numListMatch = line.match(/^\d+\.\s+(.*)/);
      if (numListMatch) return { type: 'numbered', text: numListMatch[1] };

      // Code block
      if (line.startsWith('```')) return { type: 'code-fence', text: line };

      // Strip inline markdown: bold, italic, code, links
      const cleaned = line
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^>\s+/, ''); // blockquotes

      return { type: 'paragraph', text: cleaned };
    });
};

// Build DOCX paragraphs from lines
const buildDocxParagraphs = (lines) => {
  const paragraphs = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.type === 'code-fence') {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line.text, font: 'Courier New', size: 18, color: '4B5563' })],
        spacing: { before: 0, after: 0 },
        indent: { left: 720 }
      }));
      continue;
    }

    if (line.type === 'h1') {
      paragraphs.push(new Paragraph({ text: line.text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 120 } }));
    } else if (line.type === 'h2') {
      paragraphs.push(new Paragraph({ text: line.text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
    } else if (line.type === 'h3') {
      paragraphs.push(new Paragraph({ text: line.text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 } }));
    } else if (line.type === 'bullet') {
      paragraphs.push(new Paragraph({
        text: line.text,
        bullet: { level: 0 },
        spacing: { before: 60, after: 60 }
      }));
    } else if (line.type === 'numbered') {
      paragraphs.push(new Paragraph({
        text: line.text,
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 60, after: 60 }
      }));
    } else {
      if (line.text.trim() === '') {
        paragraphs.push(new Paragraph({ text: '', spacing: { before: 0, after: 120 } }));
      } else {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: line.text, size: 24, font: 'Calibri', color: '1E293B' })],
          spacing: { before: 0, after: 160 }
        }));
      }
    }
  }
  return paragraphs;
};

// ─── EXPORT DOCX ────────────────────────────────────────────────────────────
export const exportDocx = async (req, res) => {
  try {
    const result = await getBookWithChapters(req.params.bookId, req.user._id, req.book);
    if (!result) return res.status(404).json({ message: 'Book not found or unauthorized' });
    const { book, chapters } = result;

    if (chapters.length === 0) {
      return res.status(400).json({ message: 'No completed chapters to export. Generate and complete at least one chapter first.' });
    }

    const docSections = [];

    // ── Cover page
    docSections.push(
      new Paragraph({
        children: [new TextRun({ text: book.title, bold: true, size: 56, font: 'Calibri', color: '4F46E5' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 2400, after: 400 }
      })
    );

    if (book.subtitle) {
      docSections.push(new Paragraph({
        children: [new TextRun({ text: book.subtitle, size: 32, font: 'Calibri', color: '64748B', italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 1200 }
      }));
    }

    docSections.push(new Paragraph({
      children: [new TextRun({ text: book.coverAuthor || book.author, size: 24, font: 'Calibri', color: '94A3B8' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 }
    }));

    if (book.genre) {
      docSections.push(new Paragraph({
        children: [new TextRun({ text: book.genre, size: 20, font: 'Calibri', color: 'A5B4FC' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 3200 }
      }));
    }

    // Page break after cover
    docSections.push(new Paragraph({ children: [new PageBreak()] }));

    // ── Table of Contents (text)
    docSections.push(new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 400 }
    }));

    chapters.forEach((ch, i) => {
      docSections.push(new Paragraph({
        children: [
          new TextRun({ text: `${String(i + 1).padStart(2, '0')}  `, bold: true, size: 22, color: '4F46E5' }),
          new TextRun({ text: ch.title, size: 22, color: '1E293B' }),
        ],
        spacing: { before: 80, after: 80 }
      }));
    });

    docSections.push(new Paragraph({ children: [new PageBreak()] }));

    // ── Chapters
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];

      docSections.push(new Paragraph({
        children: [
          new TextRun({ text: `Chapter ${i + 1}`, size: 20, color: '6366F1', bold: true }),
        ],
        spacing: { before: 0, after: 120 }
      }));

      docSections.push(new Paragraph({
        text: ch.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 400 }
      }));

      const lines = mdToLines(ch.markdownContent);
      docSections.push(...buildDocxParagraphs(lines));

      // Page break between chapters (not after last)
      if (i < chapters.length - 1) {
        docSections.push(new Paragraph({ children: [new PageBreak()] }));
      }
    }

    const doc = new Document({
      creator: 'AI Ebook Studio',
      title: book.title,
      description: book.description || '',
      sections: [{ properties: {}, children: docSections }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = safeFilename(book.title, 'docx');

    await Activity.create({
      userId: req.user._id,
      type: 'export_created',
      bookId: book._id,
      metadata: { format: 'docx' }
    });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);

  } catch (error) {
    console.error('DOCX Export Error:', error);
    res.status(500).json({ message: 'Failed to generate DOCX: ' + error.message });
  }
};

// ─── EXPORT MARKDOWN ────────────────────────────────────────────────────────
export const exportMarkdown = async (req, res) => {
  try {
    const result = await getBookWithChapters(req.params.bookId, req.user._id, req.book);
    if (!result) return res.status(404).json({ message: 'Book not found or unauthorized' });
    const { book, chapters } = result;

    if (chapters.length === 0) {
      return res.status(400).json({ message: 'No completed chapters to export.' });
    }

    let md = `# ${book.title}\n\n`;
    if (book.subtitle) md += `*${book.subtitle}*\n\n`;
    if (book.coverAuthor || book.author) md += `**Author:** ${book.coverAuthor || book.author}\n\n`;
    if (book.genre) md += `**Genre:** ${book.genre}\n\n`;
    if (book.description) md += `${book.description}\n\n`;
    md += `---\n\n`;

    // Table of Contents
    md += `## Table of Contents\n\n`;
    chapters.forEach((ch, i) => {
      md += `${i + 1}. ${ch.title}\n`;
    });
    md += `\n---\n\n`;

    // Chapters
    chapters.forEach((ch, i) => {
      md += `## Chapter ${i + 1} — ${ch.title}\n\n`;
      if (ch.description) md += `*${ch.description}*\n\n`;
      md += (ch.markdownContent || '') + '\n\n';
      if (i < chapters.length - 1) md += `---\n\n`;
    });

    const filename = safeFilename(book.title, 'md');

    await Activity.create({
      userId: req.user._id,
      type: 'export_created',
      bookId: book._id,
      metadata: { format: 'markdown' }
    });

    res.set({
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(md);

  } catch (error) {
    console.error('Markdown Export Error:', error);
    res.status(500).json({ message: 'Failed to generate Markdown: ' + error.message });
  }
};

// ─── EXPORT META (for client PDF generation) ────────────────────────────────
export const getExportData = async (req, res) => {
  try {
    const result = await getBookWithChapters(req.params.bookId, req.user._id, req.book);
    if (!result) return res.status(404).json({ message: 'Book not found or unauthorized' });
    const { book, chapters } = result;

    res.json({
      book: {
        _id: book._id,
        title: book.title,
        subtitle: book.subtitle,
        author: book.coverAuthor || book.author,
        description: book.description,
        genre: book.genre,
        coverStyle: book.coverStyle,
        language: book.language,
      },
      chapters: chapters.map((ch, i) => ({
        _id: ch._id,
        title: ch.title,
        description: ch.description,
        markdownContent: ch.markdownContent,
        order: ch.order,
        wordCount: ch.wordCount,
        index: i + 1,
      })),
      totalWordCount: chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
      completedChapters: chapters.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logExportActivity = async (req, res) => {
  try {
    const { format } = req.body;
    await Activity.create({
      userId: req.user._id,
      type: 'export_created',
      bookId: req.params.bookId,
      metadata: { format: format || 'pdf' }
    });
    res.json({ message: 'Export activity logged successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
