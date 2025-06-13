import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Link as LinkIcon, Type, Target } from 'lucide-react';

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, text: string, target: '_blank' | '_self') => void;
  initialUrl?: string;
  initialText?: string;
  initialTarget?: '_blank' | '_self';
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialUrl = '',
  initialText = '',
  initialTarget = '_blank'
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [target, setTarget] = useState<'_blank' | '_self'>(initialTarget);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setText(initialText);
      setTarget(initialTarget);
      setTimeout(() => {
        urlInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialUrl, initialText, initialTarget]);

  useEffect(() => {
    // Validate URL
    if (!url) {
      setIsValidUrl(true);
      return;
    }

    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      setIsValidUrl(true);
    } catch {
      // Check if it's a relative URL or email
      const relativeUrlPattern = /^(\/|\.\/|\.\.\/)/;
      const emailPattern = /^mailto:/;
      setIsValidUrl(relativeUrlPattern.test(url) || emailPattern.test(url));
    }
  }, [url]);

  const handleSave = () => {
    if (!url) return;

    let finalUrl = url;
    if (!url.startsWith('http') && !url.startsWith('mailto:') && !url.startsWith('/')) {
      finalUrl = `https://${url}`;
    }

    onSave(finalUrl, text, target);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidUrl && url) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Insert Link</h3>
              <p className="text-sm text-gray-500">Add a link to your content</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* URL Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <ExternalLink className="w-4 h-4" />
              URL
            </label>
            <input
              ref={urlInputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://example.com or /relative-path"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${isValidUrl
                ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                }`}
            />
            {!isValidUrl && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                Please enter a valid URL
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Supports: https://example.com, /path, mailto:email@example.com
            </p>
          </div>

          {/* Link Text Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4" />
              Link Text (optional)
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Link display text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <p className="text-gray-500 text-xs mt-1">
              Leave empty to use the URL as display text
            </p>
          </div>

          {/* Target Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Target className="w-4 h-4" />
              Link Target
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all ${target === '_blank'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
                }`}>
                <input
                  type="radio"
                  name="target"
                  value="_blank"
                  checked={target === '_blank'}
                  onChange={() => setTarget('_blank')}
                  className="sr-only"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">New Tab</span>
                  <span className="text-xs text-gray-500">Open in new window</span>
                </div>
                {target === '_blank' && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </label>

              <label className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all ${target === '_self'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
                }`}>
                <input
                  type="radio"
                  name="target"
                  value="_self"
                  checked={target === '_self'}
                  onChange={() => setTarget('_self')}
                  className="sr-only"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Same Tab</span>
                  <span className="text-xs text-gray-500">Open in current window</span>
                </div>
                {target === '_self' && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!url || !isValidUrl}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${url && isValidUrl
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Insert Link
          </button>
        </div>
      </div>
    </div>
  );
};