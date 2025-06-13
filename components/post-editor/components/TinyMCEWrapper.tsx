'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CharacterCount from '@tiptap/extension-character-count';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { createLowlight } from 'lowlight';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// Import custom components and utilities
import { EditorToolbar } from './EditorToolbar';
import { LinkDialog } from './LinkDialog';
import { ImageUploadDialog } from './ImageUploadDialog';
import { FontSize, getCurrentFontSize } from '../extensions/FontSizeExtension';
import { Autolink } from '../extensions/AutolinkExtension';
import { EditorWrapperProps } from '../../../types/EditorTypes';
import {
	exportToHTML,
	exportToMarkdown,
	exportToWord,
	exportToPDF,
	printDocument,
	importFromFile,
	getTemplate,
	insertSymbol,
	insertDateTime,
	insertPageBreak,
	insertTable,
	addLink,
	clearFormatting,
	selectAll,
	copyToClipboard,
	pasteFromClipboard,
	searchAndReplace
} from '../../../utils/EditorUtils';

// Import languages for code highlighting
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import kotlin from 'highlight.js/lib/languages/kotlin';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('cpp', cpp);
lowlight.register('csharp', csharp);
lowlight.register('json', json);
lowlight.register('sql', sql);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('kotlin', kotlin);

export const EditorWrapper: React.FC<EditorWrapperProps> = ({
	value,
	onChange,
	isFullScreen,
	uploadImage
}) => {
	const [mounted, setMounted] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [isPreviewMode, setIsPreviewMode] = useState(false);
	const [wordCount, setWordCount] = useState(0);
	const [showLinkDialog, setShowLinkDialog] = useState(false);
	const [showImageDialog, setShowImageDialog] = useState(false);
	const [linkData, setLinkData] = useState({ url: '', text: '', target: '_blank' as '_blank' | '_self' });
	const fileInputRef = useRef<HTMLInputElement>(null);

	const editor = useEditor({
		extensions: [
			Document,
			Paragraph,
			Text,
			StarterKit.configure({
				document: false,
				paragraph: false,
				text: false,
				codeBlock: false,
			}),
			Image.configure({
				inline: true,
				allowBase64: true,
				HTMLAttributes: {
					class: 'editor-image',
				},
			}),
			Link.configure({
				openOnClick: true,
				linkOnPaste: true,
				autolink: false, // Disable auto link to avoid conflicts
				HTMLAttributes: {
					class: 'editor-link',
				},
				protocols: ['http', 'https', 'mailto', 'tel'],
				validate: href => {
					// Validate URL
					return /^https?:\/\//.test(href) ||
						/^mailto:/.test(href) ||
						/^tel:/.test(href) ||
						/^\//.test(href) ||
						/^#/.test(href);
				},
			}),
			Table.configure({
				resizable: true,
				handleWidth: 5,
				cellMinWidth: 25,
			}),
			TableRow,
			TableHeader,
			TableCell,
			TextAlign.configure({
				types: ['heading', 'paragraph'],
				alignments: ['left', 'center', 'right', 'justify'],
			}),
			Underline,
			Subscript,
			Superscript,
			Highlight.configure({
				multicolor: true,
			}),
			TaskList,
			TaskItem.configure({
				nested: true,
				HTMLAttributes: {
					class: 'task-item',
				},
			}),
			CodeBlockLowlight.configure({
				lowlight,
				defaultLanguage: 'javascript',
			}),
			Color.configure({
				types: ['textStyle'],
			}),
			TextStyle,
			FontFamily.configure({
				types: ['textStyle'],
			}),
			FontSize.configure({
				types: ['textStyle'],
			}),
			HorizontalRule.configure({
				HTMLAttributes: {
					class: 'hr-divider',
				},
			}),
			CharacterCount.configure({
				limit: 100000,
			}),
			Autolink,
		],
		content: value,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			onChange(html);
			setWordCount(editor.storage.characterCount?.words() || 0);
		},
		editorProps: {
			attributes: {
				class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none ${isFullScreen ? 'min-h-[80vh]' : 'min-h-[500px]'
					}`,
				style: `
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          padding: 2rem;
        `,
			},
		},
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value, false);
		}
	}, [value, editor]);

	const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !editor) return;

		try {
			const response = await uploadImage(file);
			if (response.url) {
				editor.chain().focus().setImage({ src: response.url }).run();
			}
		} catch (error) {
			console.error('Error uploading image:', error);
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Handler functions
	const handleSearchToggle = () => setShowSearch(!showSearch);
	const handleSearchTermChange = (term: string) => setSearchTerm(term);
	const handlePreviewToggle = () => setIsPreviewMode(!isPreviewMode);
	const handleImageUploadClick = () => {
		setShowImageDialog(true);
	};

	const handleImageUploadFromDialog = async (file: File) => {
		return await uploadImage(file);
	};

	const handleImageUrlInsert = (url: string, alt: string) => {
		if (editor) {
			editor.chain().focus().setImage({ src: url, alt }).run();
		}
	};

	const handleExportHTML = () => exportToHTML(editor);
	const handleExportMarkdown = () => exportToMarkdown(editor);
	const handleExportWord = () => exportToWord(editor);
	const handleExportPDF = () => exportToPDF(editor);
	const handlePrint = () => printDocument(editor);
	const handleImportFile = importFromFile(editor);
	const handleCopyToClipboard = () => copyToClipboard(editor);
	const handlePasteFromClipboard = () => pasteFromClipboard(editor);

	const handleInsertTemplate = (type: string) => {
		const template = getTemplate(type);
		if (template && editor) {
			editor.chain().focus().setContent(template).run();
		}
	};

	const handleInsertTable = () => insertTable(editor);
	const handleInsertSymbol = (symbol: string) => insertSymbol(editor, symbol);
	const handleInsertDateTime = () => insertDateTime(editor);
	const handleInsertPageBreak = () => insertPageBreak(editor);
	// Enhanced Link Handler
	const handleAddLink = () => {
		const previousUrl = editor?.getAttributes('link').href || '';
		const selectedText = editor?.state.doc.textBetween(
			editor?.state.selection.from,
			editor?.state.selection.to,
			''
		) || '';
		const previousTarget = editor?.getAttributes('link').target || '_blank';

		setLinkData({
			url: previousUrl,
			text: selectedText,
			target: previousTarget
		});
		setShowLinkDialog(true);
	};

	const handleSaveLink = (url: string, text: string, target: '_blank' | '_self') => {
		if (!editor) return;

		// Remove link if URL is empty
		if (!url.trim()) {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}

		// Prepare link attributes
		const linkAttributes: any = {
			href: url.trim(),
			class: 'editor-link'
		};

		// Add target and rel attributes
		if (target === '_blank') {
			linkAttributes.target = '_blank';
			linkAttributes.rel = 'noopener noreferrer';
		} else {
			linkAttributes.target = '_self';
		}

		const { selection } = editor.state;
		const { from, to, empty } = selection;

		if (text && text.trim()) {
			// If we have custom text
			if (empty) {
				// No selection - insert text with link
				editor.chain()
					.focus()
					.insertContent(text)
					.setTextSelection({ from: from, to: from + text.length })
					.setLink(linkAttributes)
					.setTextSelection({ from: from + text.length, to: from + text.length })
					.run();
			} else {
				// Has selection - replace with new text and link
				editor.chain()
					.focus()
					.deleteSelection()
					.insertContent(text)
					.setTextSelection({ from: from, to: from + text.length })
					.setLink(linkAttributes)
					.setTextSelection({ from: from + text.length, to: from + text.length })
					.run();
			}
		} else {
			// No custom text
			if (empty) {
				// No selection - insert URL as text with link
				editor.chain()
					.focus()
					.insertContent(url)
					.setTextSelection({ from: from, to: from + url.length })
					.setLink(linkAttributes)
					.setTextSelection({ from: from + url.length, to: from + url.length })
					.run();
			} else {
				// Has selection - apply link to selected text
				editor.chain()
					.focus()
					.setLink(linkAttributes)
					.run();
			}
		}
	};
	const handleClearFormatting = () => clearFormatting(editor);
	const handleSelectAll = () => selectAll(editor);
	const handleSearchAndReplace = () => searchAndReplace(editor, searchTerm);

	if (!mounted) {
		return (
			<div className='h-96 bg-gray-100 animate-pulse rounded-md flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	if (!editor) {
		return (
			<Textarea
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
				className='min-h-96'
				placeholder='Nhập nội dung bài viết...'
			/>
		);
	}

	return (
		<div className={`border border-gray-300 rounded-lg shadow-sm ${isFullScreen ? 'h-screen' : ''}`}>
			{/* Toolbar */}
			<EditorToolbar
				editor={editor}
				showSearch={showSearch}
				searchTerm={searchTerm}
				isPreviewMode={isPreviewMode}
				wordCount={wordCount}
				isFullScreen={isFullScreen}
				fileInputRef={fileInputRef}
				onSearchToggle={handleSearchToggle}
				onSearchTermChange={handleSearchTermChange}
				onPreviewToggle={handlePreviewToggle}
				onImageUpload={handleImageUploadClick}
				onExportHTML={handleExportHTML}
				onExportMarkdown={handleExportMarkdown}
				onExportWord={handleExportWord}
				onExportPDF={handleExportPDF}
				onImportFile={handleImportFile}
				onPrint={handlePrint}
				onCopyToClipboard={handleCopyToClipboard}
				onPasteFromClipboard={handlePasteFromClipboard}
				onInsertTemplate={handleInsertTemplate}
				onInsertTable={handleInsertTable}
				onInsertSymbol={handleInsertSymbol}
				onInsertDateTime={handleInsertDateTime}
				onInsertPageBreak={handleInsertPageBreak}
				onAddLink={handleAddLink}
				onClearFormatting={handleClearFormatting}
				onSelectAll={handleSelectAll}
				onSearchAndReplace={handleSearchAndReplace}
			/>

			{/* Editor Content */}
			<div className={`editor-content ${isFullScreen ? 'h-[calc(100vh-250px)]' : 'min-h-[500px]'} overflow-y-auto`}>
				{isPreviewMode ? (
					<div
						className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto p-8 max-w-none"
						dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
					/>
				) : (
					<EditorContent editor={editor} />
				)}
			</div>

			{/* Status Bar */}
			<div className="border-t border-gray-300 px-4 py-2 bg-gray-50 text-xs text-gray-600 flex justify-between items-center rounded-b-lg">
				<div className="flex gap-6">
					<span className="font-medium">Words: {wordCount}</span>
					<span>Characters: {editor.storage.characterCount?.characters() || 0}</span>
					<span>Characters (no spaces): {editor.storage.characterCount?.characters({ mode: 'textSize' }) || 0}</span>
				</div>
				<div className="flex gap-2">
					{editor.isActive('bold') && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Bold</span>}
					{editor.isActive('italic') && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Italic</span>}
					{editor.isActive('underline') && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Underline</span>}
					{editor.isActive('link') && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Link</span>}
					{editor.isActive('codeBlock') && (
						<span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
							Code ({editor.getAttributes('codeBlock').language || 'plain'})
						</span>
					)}
					{isPreviewMode && (
						<span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Preview Mode</span>
					)}
				</div>
			</div>

			{/* Image Upload Dialog */}
			<ImageUploadDialog
				isOpen={showImageDialog}
				onClose={() => setShowImageDialog(false)}
				onUpload={handleImageUploadFromDialog}
				onInsertUrl={handleImageUrlInsert}
			/>

			{/* Link Dialog */}
			<LinkDialog
				isOpen={showLinkDialog}
				onClose={() => setShowLinkDialog(false)}
				onSave={handleSaveLink}
				initialUrl={linkData.url}
				initialText={linkData.text}
				initialTarget={linkData.target}
			/>

			{/* Hidden file input for image uploads */}
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleImageUpload}
				accept="image/*"
				className="hidden"
			/>

			{/* Enhanced Custom styles */}
			<style jsx global>{`
        .ProseMirror {
          outline: none;
          padding: 2rem;
          min-height: inherit;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-rendering: optimizeLegibility;
          font-feature-settings: "kern" 1, "liga" 1;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: 'Bắt đầu viết nội dung bài viết của bạn...';
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }

        /* Headings - inherit color from text styling */
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, 
        .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 {
          color: inherit;
          margin-top: 2em;
          margin-bottom: 0.75em;
          font-weight: 600;
          line-height: 1.25;
        }

        /* Only set default heading color if no custom color is applied */
        .ProseMirror h1:not([style*="color"]), 
        .ProseMirror h2:not([style*="color"]), 
        .ProseMirror h3:not([style*="color"]), 
        .ProseMirror h4:not([style*="color"]), 
        .ProseMirror h5:not([style*="color"]), 
        .ProseMirror h6:not([style*="color"]) {
          color: #000000;
        }

        .ProseMirror h1 { font-size: 2.5em; }
        .ProseMirror h2 { font-size: 2em; }
        .ProseMirror h3 { font-size: 1.75em; }
        .ProseMirror h4 { font-size: 1.5em; }
        .ProseMirror h5 { font-size: 1.25em; }
        .ProseMirror h6 { font-size: 1.125em; }

        .ProseMirror p {
          margin-bottom: 1.25em;
          line-height: 1.75;
        }

        /* Links - Enhanced styling */
        .ProseMirror a,
        .ProseMirror .editor-link {
          color: #3182ce !important;
          text-decoration: underline;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid transparent;
        }

        .ProseMirror a:hover,
        .ProseMirror .editor-link:hover {
          color: #2c5aa0 !important;
          border-bottom-color: #3182ce;
          background-color: rgba(59, 130, 246, 0.1);
        }

        /* Link selection styling */
        .ProseMirror a.ProseMirror-selectednode,
        .ProseMirror .editor-link.ProseMirror-selectednode {
          outline: 2px solid #3182ce;
          outline-offset: 2px;
          border-radius: 2px;
        }

        /* Simple TinyMCE-style blockquote */
        .ProseMirror blockquote {
          border-left: 4px solid #ddd;
          margin: 1.5em 0;
          padding-left: 1.5em;
          color: #666;
          font-style: italic;
          background: none;
          border-radius: 0;
        }

        .ProseMirror code {
          background: #f1f5f9;
          padding: 0.25em 0.5em;
          border-radius: 4px;
          font-size: 0.875em;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          color: #e53e3e;
          border: 1px solid #e2e8f0;
        }

        .ProseMirror pre {
          background: #0f172a;
          color: #e2e8f0;
          padding: 1.5em;
          border-radius: 12px;
          overflow-x: auto;
          font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          line-height: 1.6;
          margin: 2em 0;
          border: 1px solid #1e293b;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
          border: none;
          font-size: 0.875em;
        }

        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 2em 0;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .ProseMirror th, .ProseMirror td {
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          text-align: left;
          vertical-align: top;
        }

        .ProseMirror th {
          background: #f8fafc;
          font-weight: 600;
          color: #2d3748;
        }

        .ProseMirror tbody tr:hover {
          background: #f8fafc;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin: 2em auto;
          display: block;
          border: 2px solid #f1f5f9;
        }

        .ProseMirror ul, .ProseMirror ol {
          padding-left: 2em;
          margin: 1.5em 0;
        }

        .ProseMirror li {
          margin-bottom: 0.5em;
          line-height: 1.7;
        }

        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
          margin: 1.5em 0;
        }

        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.75em;
          padding: 0.75em;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .ProseMirror ul[data-type="taskList"] li:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .ProseMirror ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.75rem;
          user-select: none;
          cursor: pointer;
        }

        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #3182ce;
        }

        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }

        .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div {
          text-decoration: line-through;
          color: #718096;
        }

        .ProseMirror mark {
          background: #fef08a;
          padding: 0.1em 0.3em;
          border-radius: 0.25em;
          box-decoration-break: clone;
        }

        .ProseMirror .hr-divider {
          border: none;
          border-top: 3px solid #e2e8f0;
          margin: 3em 0;
          border-radius: 2px;
        }

        .ProseMirror .page-break {
          page-break-after: always;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%);
          margin: 2em 0;
          position: relative;
          border-radius: 1px;
        }

        .ProseMirror .page-break::after {
          content: "Page Break";
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 2px 8px;
          font-size: 10px;
          color: #666;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }

        /* Enhanced focus styles */
        .ProseMirror:focus {
          box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        /* Better selection styles */
        .ProseMirror ::selection {
          background: rgba(59, 130, 246, 0.2);
        }

        /* Print styles */
        @media print {
          .ProseMirror {
            font-size: 12pt;
            line-height: 1.6;
            color: black;
          }
          
          .ProseMirror img {
            max-width: 100%;
            page-break-inside: avoid;
          }
          
          .ProseMirror table {
            page-break-inside: avoid;
          }
          
          .ProseMirror h1, .ProseMirror h2, .ProseMirror h3,
          .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 {
            color: #000000 !important;
            page-break-after: avoid;
          }

          .ProseMirror blockquote {
            background: none !important;
            border-left: 4px solid #333 !important;
          }

          .ProseMirror pre {
            background: #f5f5f5 !important;
            color: #333 !important;
            border: 1px solid #ddd !important;
          }

          .page-break {
            page-break-after: always !important;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .ProseMirror {
            color: #e2e8f0;
          }
          
          .ProseMirror h1, .ProseMirror h2, .ProseMirror h3,
          .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 {
            color: #f1f5f9;
          }
          
          .ProseMirror blockquote {
            border-left-color: #4a5568;
            color: #a0aec0;
          }
          
          .ProseMirror code {
            background: #2d3748;
            color: #f56565;
            border-color: #4a5568;
          }

          .ProseMirror table {
            border-color: #4a5568;
          }

          .ProseMirror th, .ProseMirror td {
            border-color: #4a5568;
          }

          .ProseMirror th {
            background: #2d3748;
            color: #f1f5f9;
          }

          .ProseMirror ul[data-type="taskList"] li {
            background: #2d3748;
            border-color: #4a5568;
          }
        }

        /* Smooth transitions */
        .ProseMirror * {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ProseMirror {
            padding: 1rem;
          }
          
          .ProseMirror blockquote {
            padding-left: 1em;
            margin: 1em 0;
          }
          
          .ProseMirror pre {
            padding: 1em;
            font-size: 0.875em;
          }
        }
      `}</style>
		</div>
	);
};