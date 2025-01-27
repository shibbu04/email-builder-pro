import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Template } from '../models/Template.js';
import { auth } from '../middleware/auth.js';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get email layout
router.get('/getEmailLayout', (req, res) => {
  const layoutPath = path.join(__dirname, '../templates/layout.html');
  try {
    const layout = fs.readFileSync(layoutPath, 'utf8');
    res.send(layout);
  } catch (error) {
    res.status(500).send('Error reading layout file');
  }
});

// Upload image
router.post('/uploadImage', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.json({
    url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  });
});

// Get templates
router.get('/templates', auth, async (req, res) => {
  try {
    const query = req.query.public
      ? { $or: [{ userId: req.user._id }, { isPublic: true }] }
      : { userId: req.user._id };
    
    const templates = await Template.find(query).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single template
router.get('/templates/:id', auth, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { isPublic: true }]
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create template
router.post('/templates', auth, async (req, res) => {
  try {
    const template = new Template({
      ...req.body,
      userId: req.user._id
    });
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update template
router.put('/templates/:id', auth, async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete template
router.delete('/templates/:id', auth, async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Render and download template
router.post('/renderAndDownloadTemplate', auth, async (req, res) => {
  try {
    const { templateId } = req.body;
    const template = await Template.findOne({
      _id: templateId,
      $or: [{ userId: req.user._id }, { isPublic: true }]
    });
    
    if (!template) {
      return res.status(404).send('Template not found');
    }

    const layoutPath = path.join(__dirname, '../templates/layout.html');
    const layoutSource = fs.readFileSync(layoutPath, 'utf8');
    const compiledTemplate = Handlebars.compile(layoutSource);
    
    const html = compiledTemplate({
      ...template.config,
      content: template.content,
      title: template.title
    });

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename=email-template.html');
    res.send(html);
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).json({ error: 'Failed to render template' });
  }
});

export { router };