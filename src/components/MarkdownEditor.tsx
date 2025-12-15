import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: React.ReactNode;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  minHeight = '300px',
  label
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = document.querySelector('textarea[data-markdown-editor]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    let newText = '';
    let cursorOffset = 0;

    switch (syntax) {
      case 'bold':
        newText = value.substring(0, start) + `**${textToInsert}**` + value.substring(end);
        cursorOffset = start + 2 + textToInsert.length;
        break;
      case 'italic':
        newText = value.substring(0, start) + `*${textToInsert}*` + value.substring(end);
        cursorOffset = start + 1 + textToInsert.length;
        break;
      case 'heading':
        newText = value.substring(0, start) + `## ${textToInsert}` + value.substring(end);
        cursorOffset = start + 3 + textToInsert.length;
        break;
      case 'link':
        newText = value.substring(0, start) + `[${textToInsert || 'link text'}](url)` + value.substring(end);
        cursorOffset = start + (textToInsert ? textToInsert.length + 3 : 11);
        break;
      case 'bullet':
        newText = value.substring(0, start) + `\n- ${textToInsert}` + value.substring(end);
        cursorOffset = start + 3 + textToInsert.length;
        break;
      case 'number':
        newText = value.substring(0, start) + `\n1. ${textToInsert}` + value.substring(end);
        cursorOffset = start + 4 + textToInsert.length;
        break;
      case 'quote':
        newText = value.substring(0, start) + `\n> ${textToInsert}` + value.substring(end);
        cursorOffset = start + 3 + textToInsert.length;
        break;
      case 'code':
        newText = value.substring(0, start) + `\`${textToInsert}\`` + value.substring(end);
        cursorOffset = start + 1 + textToInsert.length;
        break;
      case 'table':
        const table = `\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`;
        newText = value.substring(0, start) + table + value.substring(end);
        cursorOffset = start + table.length;
        break;
      default:
        return;
    }

    onChange(newText);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorOffset, cursorOffset);
    }, 0);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Toolbar */}
      <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex items-center gap-2 flex-wrap">
        {/* Tab Switcher */}
        <div className="flex gap-1 mr-4">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1 text-sm font-medium rounded ${activeTab === 'write'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            ✍️ Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-sm font-medium rounded ${activeTab === 'preview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            👁️ Preview
          </button>
        </div>

        {/* Formatting Buttons */}
        <div className="flex gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => insertMarkdown('bold', 'bold text')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('italic', 'italic text')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 italic"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('heading', 'Heading')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
            title="Heading"
          >
            H
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('link')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
            title="Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('bullet', 'List item')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('number', 'List item')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
            title="Numbered List"
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('quote', 'Quote')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
            title="Quote"
          >
            💬
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('code', 'code')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 font-mono"
            title="Inline Code"
          >
            {'<>'}
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('table')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
            title="Table"
          >
            📊 Table
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="border border-t-0 border-gray-300 rounded-b-lg">
        {activeTab === 'write' ? (
          <textarea
            data-markdown-editor
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-b-lg resize-none"
            style={{ minHeight }}
          />
        ) : (
          <div
            className="prose prose-sm max-w-none p-4 overflow-auto"
            style={{ minHeight }}
          >
            {value ? (
              <ReactMarkdown
                components={{
                  // Style the markdown output
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mb-4 text-gray-900">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{children}</h3>
                  ),
                  p: ({ children }) => <p className="mb-4 text-gray-700">{children}</p>,
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 text-gray-700">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 text-gray-700">{children}</ol>
                  ),
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-600">
                      {children}
                    </code>
                  ),
                  table: ({ children }) => (
                    <table className="min-w-full border-collapse border border-gray-300 mb-4">
                      {children}
                    </table>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-100">{children}</thead>
                  ),
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
                  th: ({ children }) => (
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-4 py-2">{children}</td>
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Nothing to preview yet...</p>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500">
        <details className="cursor-pointer">
          <summary className="hover:text-gray-700">📖 Markdown Guide</summary>
          <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
            <p><strong>**bold**</strong> → <strong>bold</strong></p>
            <p><em>*italic*</em> → <em>italic</em></p>
            <p>## Heading → Heading</p>
            <p>[link text](url) → <span className="text-blue-600 underline">link text</span></p>
            <p>- List item → • List item</p>
            <p>1. Numbered item → 1. Numbered item</p>
            <p>&gt; Quote → <em>Quote</em></p>
            <p>`code` → <code className="bg-gray-100 px-1 rounded">code</code></p>
          </div>
        </details>
      </div>
    </div>
  );
}
