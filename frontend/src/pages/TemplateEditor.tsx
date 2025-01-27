import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter,
  AlignRight, Image as ImageIcon, Link as LinkIcon, Save, Download,
  Type, Palette, Image as BannerIcon, UserCircle, Mail,
  MessageSquare, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveTemplate, getTemplate, uploadImage, renderTemplate } from '../services/api';

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [fontSize, setFontSize] = useState('16px');
  const [textColor, setTextColor] = useState('#000000');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('header');
  const [company, setCompany] = useState('Your Company');
  const [customStyles, setCustomStyles] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Underline,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border rounded-lg bg-white',
      },
    },
    onUpdate: ({ editor }) => {
      setPreviewHtml(editor.getHTML());
    },
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      if (id) {
        try {
          const data = await getTemplate(id);
          setTitle(data.title);
          setCompany(data.config?.company || 'Your Company');
          setCustomStyles(data.config?.customStyles || '');
          editor?.commands.setContent(data.content);
        } catch (err) {
          setError('Failed to load template');
        }
      }
    };

    fetchTemplate();
  }, [id, editor]);

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    setError('');

    try {
      const templateData = {
        title,
        content: editor.getHTML(),
        config: {
          fontSize,
          textColor,
          company,
          customStyles,
        }
      };

      await saveTemplate(templateData);
      navigate('/templates');
    } catch (err) {
      setError('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    try {
      const { url } = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  const handleAddLink = () => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().toggleLink({ href: url }).run();
    }
  };

  const handleDownload = async () => {
    if (!id) {
      setError('Please save the template first');
      return;
    }

    try {
      const blob = await renderTemplate(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'template'}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const sections = [
    { id: 'header', label: 'Header', icon: FileText },
    { id: 'banner', label: 'Banner', icon: BannerIcon },
    { id: 'salutation', label: 'Salutation', icon: Mail },
    { id: 'content', label: 'Content', icon: MessageSquare },
    { id: 'greetings', label: 'Greetings', icon: UserCircle },
    { id: 'footer', label: 'Footer', icon: FileText },
  ];

  const insertSectionTemplate = (section: string) => {
    if (!editor) return;

    const templates: Record<string, string> = {
      header: '<h1 style="text-align: center; color: #1a1a1a;">Your Company Name</h1>',
      banner: '<div style="text-align: center;"><img src="" alt="Banner" style="max-width: 100%;"></div>',
      salutation: '<p>Dear [Name],</p>',
      content: '<p>Your message content here...</p>',
      greetings: '<p>Best regards,<br>[Your Name]</p>',
      footer: `<div style="text-align: center;"><p>© ${new Date().getFullYear()} ${company}. All rights reserved.</p></div>`,
    };

    editor.chain().focus().insertContent(templates[section]).run();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter template title"
            className="text-2xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Section */}
          <div className="space-y-6">
            {/* Section Selector */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-medium mb-4">Template Sections</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      insertSectionTemplate(section.id);
                    }}
                    className={`flex items-center p-3 rounded-lg border ${
                      activeSection === section.id
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-300'
                    }`}
                  >
                    <section.icon className="w-5 h-5 mr-2" />
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Company Settings */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-medium mb-4">Company Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Custom CSS</label>
                  <textarea
                    value={customStyles}
                    onChange={(e) => setCustomStyles(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                    rows={4}
                    placeholder="Add custom CSS styles here..."
                  />
                </div>
              </div>
            </div>

            {/* Editor Tools */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4 flex flex-wrap gap-2 border-b pb-4">
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
                >
                  <Bold className="w-5 h-5" />
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                >
                  <Italic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`p-2 rounded ${editor?.isActive('underline') ? 'bg-gray-200' : ''}`}
                >
                  <UnderlineIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  className={`p-2 rounded ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                >
                  <AlignLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  className={`p-2 rounded ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                >
                  <AlignCenter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  className={`p-2 rounded ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                >
                  <AlignRight className="w-5 h-5" />
                </button>
                <label className="p-2 rounded hover:bg-gray-100 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImageIcon className="w-5 h-5" />
                </label>
                <button
                  onClick={handleAddLink}
                  className={`p-2 rounded ${editor?.isActive('link') ? 'bg-gray-200' : ''}`}
                >
                  <LinkIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center ml-2">
                  <Type className="w-5 h-5 mr-2" />
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="12px">Small</option>
                    <option value="16px">Medium</option>
                    <option value="20px">Large</option>
                    <option value="24px">Extra Large</option>
                  </select>
                </div>
                <div className="flex items-center ml-2">
                  <Palette className="w-5 h-5 mr-2" />
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 p-0 border-0"
                  />
                </div>
              </div>

              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Preview</h2>
                <div className="space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Template'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download HTML
                  </button>
                </div>
              </div>
              <div 
                className="border rounded-lg p-4 min-h-[300px] bg-white"
                style={{ fontSize, color: textColor }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;