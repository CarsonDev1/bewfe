'use client';

import React from 'react';
import { FileText, Plus, Eye, EyeOff, Maximize, Minimize } from 'lucide-react';
import { ToolbarButton, ToolbarSelect, ToolbarDropdown, ColorPicker } from './ToolbarComponent';
import { EditorToolbarProps } from '../../../types/EditorTypes';
import { getCurrentFontSize } from '../extensions/FontSizeExtension';

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  showSearch,
  searchTerm,
  isPreviewMode,
  wordCount,
  isFullScreen,
  fileInputRef,
  onSearchToggle,
  onSearchTermChange,
  onPreviewToggle,
  onImageUpload,
  onExportHTML,
  onExportMarkdown,
  onExportWord,
  onExportPDF,
  onImportFile,
  onPrint,
  onCopyToClipboard,
  onPasteFromClipboard,
  onInsertTemplate,
  onInsertTable,
  onInsertSymbol,
  onInsertDateTime,
  onInsertPageBreak,
  onAddLink,
  onClearFormatting,
  onSelectAll,
  onSearchAndReplace
}) => {
  if (!editor) return null;

  return (
    <div className="border-b border-gray-300 p-2 bg-gray-50 rounded-t-lg">
      {/* Row 1: File, Edit, View, Insert */}
      <div className="flex flex-wrap gap-1 items-center mb-2 pb-2 border-b border-gray-200">
        <ToolbarDropdown label="File" icon={<FileText className="w-3 h-3" />}>
          <div className="p-1">
            <button
              onClick={() => editor.commands.clearContent()}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              🗎 New Document
            </button>
            <button
              onClick={onExportHTML}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              💾 Export HTML
            </button>
            <button
              onClick={onExportMarkdown}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              📝 Export Markdown
            </button>
            <button
              onClick={onExportWord}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              📄 Export Word
            </button>
            <button
              onClick={onExportPDF}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              📑 Export PDF
            </button>
            <button
              onClick={onPrint}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              🖨️ Print
            </button>
            <hr className="my-1" />
            <label className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
              📁 Import File
              <input
                type="file"
                accept=".html,.txt,.md"
                onChange={onImportFile}
                className="hidden"
              />
            </label>
            <button
              onClick={onCopyToClipboard}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              📋 Copy HTML
            </button>
          </div>
        </ToolbarDropdown>

        <ToolbarDropdown label="Edit" icon={<span>✏️</span>}>
          <div className="p-1">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded disabled:opacity-50"
            >
              ↶ Undo (Ctrl+Z)
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded disabled:opacity-50"
            >
              ↷ Redo (Ctrl+Y)
            </button>
            <hr className="my-1" />
            <button
              onClick={onSelectAll}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              📄 Select All (Ctrl+A)
            </button>
            <button
              onClick={onCopyToClipboard}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              📋 Copy (Ctrl+C)
            </button>
            <button
              onClick={onPasteFromClipboard}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              📄 Paste (Ctrl+V)
            </button>
            <hr className="my-1" />
            <button
              onClick={onSearchToggle}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              🔍 Find & Replace (Ctrl+F)
            </button>
          </div>
        </ToolbarDropdown>

        <ToolbarDropdown label="View" icon={<Eye className="w-3 h-3" />}>
          <div className="p-1">
            <button
              onClick={onPreviewToggle}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              {isPreviewMode ? <EyeOff className="w-4 h-4 inline mr-2" /> : <Eye className="w-4 h-4 inline mr-2" />}
              {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
            <button
              onClick={() => {/* Toggle fullscreen logic */ }}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              {isFullScreen ? <Minimize className="w-4 h-4 inline mr-2" /> : <Maximize className="w-4 h-4 inline mr-2" />}
              {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <hr className="my-1" />
            <div className="px-3 py-2 text-xs text-gray-600">
              Words: {wordCount} | Characters: {editor.storage.characterCount?.characters() || 0}
            </div>
          </div>
        </ToolbarDropdown>

        <ToolbarDropdown label="Insert" icon={<Plus className="w-3 h-3" />}>
          <div className="p-1">
            <button
              onClick={onImageUpload}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              🖼️ Image
            </button>
            <button
              onClick={onInsertTable}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              📊 Table
            </button>
            <button
              onClick={onAddLink}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              🔗 Link
            </button>
            <hr className="my-1" />
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              ➖ Horizontal Rule
            </button>
            <button
              onClick={onInsertDateTime}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              📅 Date/Time
            </button>
            <button
              onClick={onInsertPageBreak}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              📄 Page Break
            </button>
            <hr className="my-1" />
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              💻 Code Block
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              💬 Blockquote
            </button>
          </div>
        </ToolbarDropdown>

        <ToolbarDropdown label="Format" icon={<span>🎨</span>}>
          <div className="p-1">
            <button
              onClick={onClearFormatting}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              🧹 Clear Formatting
            </button>
            <hr className="my-1" />
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              <strong>Bold (Ctrl+B)</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              <em>Italic (Ctrl+I)</em>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              <u>Underline (Ctrl+U)</u>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              <s>Strikethrough</s>
            </button>
          </div>
        </ToolbarDropdown>

        <ToolbarDropdown label="Symbols" icon={<span>©</span>}>
          <div className="p-2">
            <div className="text-xs text-gray-600 mb-2">Common Symbols</div>
            <div className="grid grid-cols-6 gap-1 mb-3">
              {['©', '®', '™', '§', '¶', '†', '‡', '•', '…', '‰', '‹', '›', '«', '»', '–', '—', '"', '"', "'", "'", '€', '£', '¥', '¢'].map(symbol => (
                <button
                  key={symbol}
                  onClick={() => onInsertSymbol(symbol)}
                  className="p-2 text-sm hover:bg-gray-100 rounded text-center transition-colors"
                  title={`Insert ${symbol}`}
                >
                  {symbol}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-600 mb-2">Math Symbols</div>
            <div className="grid grid-cols-6 gap-1">
              {['±', '×', '÷', '∞', '≠', '≤', '≥', '∑', '∏', '√', '∂', '∫', 'α', 'β', 'γ', 'δ', 'π', 'Ω'].map(symbol => (
                <button
                  key={symbol}
                  onClick={() => onInsertSymbol(symbol)}
                  className="p-2 text-sm hover:bg-gray-100 rounded text-center transition-colors"
                  title={`Insert ${symbol}`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </ToolbarDropdown>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="flex gap-2 items-center mb-2 pb-2 border-b border-gray-200 bg-blue-50 p-2 rounded">
          <input
            type="text"
            placeholder="Search text..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={onSearchAndReplace}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Replace
          </button>
          <button
            onClick={onSearchToggle}
            className="px-2 py-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Row 2: Font and Size Controls */}
      <div className="flex flex-wrap gap-1 items-center mb-2">
        {/* Font Family */}
        <ToolbarSelect
          value={editor.getAttributes('textStyle').fontFamily || ''}
          onChange={(font) => {
            if (font) {
              editor.chain().focus().setFontFamily(font).run();
            } else {
              editor.chain().focus().unsetFontFamily().run();
            }
          }}
          placeholder="Font Family"
          width="min-w-[120px]"
          options={[
            { value: 'Arial', label: 'Arial' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Georgia', label: 'Georgia' },
            { value: 'Verdana', label: 'Verdana' },
            { value: 'Courier New', label: 'Courier New' },
            { value: 'Tahoma', label: 'Tahoma' },
            { value: 'Trebuchet MS', label: 'Trebuchet MS' },
            { value: 'Impact', label: 'Impact' },
            { value: 'Comic Sans MS', label: 'Comic Sans MS' },
            { value: 'Lucida Console', label: 'Lucida Console' },
          ]}
        />

        {/* Font Size with current size display */}
        <ToolbarSelect
          value={getCurrentFontSize(editor)}
          onChange={(size) => {
            if (size) {
              // If it's a heading, we need to handle it differently
              if (editor.isActive('heading')) {
                // First set the font size, then remove heading to apply custom size
                editor.chain().focus().setParagraph().setFontSize(size).run();
              } else {
                editor.chain().focus().setFontSize(size).run();
              }
            } else {
              editor.chain().focus().unsetFontSize().run();
            }
          }}
          placeholder="Size"
          width="min-w-[80px]"
          options={[
            { value: '8px', label: '8px' },
            { value: '9px', label: '9px' },
            { value: '10px', label: '10px' },
            { value: '11px', label: '11px' },
            { value: '12px', label: '12px' },
            { value: '14px', label: '14px' },
            { value: '16px', label: '16px' },
            { value: '18px', label: '18px' },
            { value: '20px', label: '20px' },
            { value: '22px', label: '22px' },
            { value: '24px', label: '24px' },
            { value: '26px', label: '26px' },
            { value: '28px', label: '28px' },
            { value: '32px', label: '32px' },
            { value: '36px', label: '36px' },
            { value: '48px', label: '48px' },
            { value: '64px', label: '64px' },
            { value: '72px', label: '72px' },
          ]}
        />

        {/* Heading Selector with size info */}
        <ToolbarSelect
          value={
            editor.isActive('heading', { level: 1 }) ? 'h1' :
              editor.isActive('heading', { level: 2 }) ? 'h2' :
                editor.isActive('heading', { level: 3 }) ? 'h3' :
                  editor.isActive('heading', { level: 4 }) ? 'h4' :
                    editor.isActive('heading', { level: 5 }) ? 'h5' :
                      editor.isActive('heading', { level: 6 }) ? 'h6' :
                        'p'
          }
          onChange={(value) => {
            if (value === 'p') {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(value.substring(1)) as 1 | 2 | 3 | 4 | 5 | 6;
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          placeholder="Format"
          width="min-w-[140px]"
          options={[
            { value: 'p', label: 'Paragraph (14px)' },
            { value: 'h1', label: 'Heading 1 (40px)' },
            { value: 'h2', label: 'Heading 2 (32px)' },
            { value: 'h3', label: 'Heading 3 (28px)' },
            { value: 'h4', label: 'Heading 4 (24px)' },
            { value: 'h5', label: 'Heading 5 (20px)' },
            { value: 'h6', label: 'Heading 6 (18px)' },
          ]}
        />

        <div className="w-px h-6 bg-gray-300" />

        {/* Basic Formatting */}
        <div className="flex gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            isActive={editor.isActive('subscript')}
            title="Subscript"
          >
            X<sub>₂</sub>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={editor.isActive('superscript')}
            title="Superscript"
          >
            X<sup>²</sup>
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Text Color */}
        <ToolbarDropdown
          label="A"
          icon={<div className="w-4 h-1 bg-current" style={{ color: editor.getAttributes('textStyle').color || '#000000' }}></div>}
        >
          <ColorPicker
            currentColor={editor.getAttributes('textStyle').color || '#000000'}
            onColorSelect={(color) => {
              if (color) {
                editor.chain().focus().setColor(color).run();
              } else {
                editor.chain().focus().unsetColor().run();
              }
            }}
          />
        </ToolbarDropdown>

        {/* Highlight Color */}
        <ToolbarDropdown
          label="🖍️"
          icon={<div className="w-4 h-1 bg-current" style={{ color: editor.getAttributes('highlight').color || '#ffff00' }}></div>}
        >
          <ColorPicker
            currentColor={editor.getAttributes('highlight').color || '#ffff00'}
            onColorSelect={(color) => {
              if (color) {
                editor.chain().focus().toggleHighlight({ color }).run();
              } else {
                editor.chain().focus().unsetHighlight().run();
              }
            }}
          />
        </ToolbarDropdown>

        <div className="w-px h-6 bg-gray-300" />

        {/* Text Alignment */}
        <div className="flex gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            ⬅️
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            ↔️
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            ➡️
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            ⬌
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Lists */}
        <div className="flex gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            1. List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Task List"
          >
            ☑️ Task
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Indent/Outdent */}
        <div className="flex gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().outdent?.().run()}
            title="Decrease Indent"
          >
            ⬅️ Outdent
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().indent?.().run()}
            title="Increase Indent"
          >
            ➡️ Indent
          </ToolbarButton>
        </div>
      </div>

      {/* Row 3: Insert Elements and Advanced */}
      <div className="flex flex-wrap gap-1 items-center">
        <ToolbarButton onClick={onAddLink} title="Insert/Edit Link">
          🔗 Link
        </ToolbarButton>
        <ToolbarButton
          onClick={onImageUpload}
          title="Insert Image"
        >
          🖼️ Image
        </ToolbarButton>
        <ToolbarButton onClick={onInsertTable} title="Insert Table">
          📊 Table
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          💻 Code
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          💬 Quote
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          ➖ HR
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300" />

        {/* Templates */}
        <ToolbarSelect
          value=""
          onChange={(value) => {
            if (value) onInsertTemplate(value);
          }}
          placeholder="Templates"
          width="min-w-[120px]"
          options={[
            { value: 'basic', label: '📝 Basic Article' },
            { value: 'with-image', label: '🖼️ Article with Image' },
            { value: 'with-table', label: '📊 Article with Table' },
            { value: 'meeting-notes', label: '📋 Meeting Notes' },
            { value: 'report', label: '📊 Report Template' },
          ]}
        />

        <div className="w-px h-6 bg-gray-300" />

        {/* Language Selection for Code Blocks */}
        {editor.isActive('codeBlock') && (
          <ToolbarSelect
            value={editor.getAttributes('codeBlock').language || 'javascript'}
            onChange={(language) => {
              editor.chain().focus().updateAttributes('codeBlock', { language }).run();
            }}
            placeholder="Language"
            width="min-w-[100px]"
            options={[
              { value: 'javascript', label: 'JavaScript' },
              { value: 'typescript', label: 'TypeScript' },
              { value: 'html', label: 'HTML' },
              { value: 'css', label: 'CSS' },
              { value: 'python', label: 'Python' },
              { value: 'java', label: 'Java' },
              { value: 'php', label: 'PHP' },
              { value: 'ruby', label: 'Ruby' },
              { value: 'cpp', label: 'C++' },
              { value: 'csharp', label: 'C#' },
              { value: 'json', label: 'JSON' },
              { value: 'sql', label: 'SQL' },
              { value: 'go', label: 'Go' },
              { value: 'rust', label: 'Rust' },
              { value: 'kotlin', label: 'Kotlin' },
            ]}
          />
        )}

        {/* Table Controls */}
        {editor.isActive('table') && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().addRowBefore().run()}
                title="Add Row Before"
                size="sm"
              >
                ⬆️+
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().addRowAfter().run()}
                title="Add Row After"
                size="sm"
              >
                ⬇️+
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="Delete Row"
                size="sm"
                variant="danger"
              >
                ⬆️-
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                title="Add Column Before"
                size="sm"
              >
                ⬅️+
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                title="Add Column After"
                size="sm"
              >
                ➡️+
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="Delete Column"
                size="sm"
                variant="danger"
              >
                ⬅️-
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="Delete Table"
                size="sm"
                variant="danger"
              >
                🗑️
              </ToolbarButton>
            </div>
          </>
        )}

        <div className="ml-auto flex gap-1">
          <ToolbarButton
            onClick={onPreviewToggle}
            title={isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            variant={isPreviewMode ? 'primary' : 'default'}
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </ToolbarButton>
        </div>
      </div>
    </div>
  );
};