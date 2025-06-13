import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import type { Command, RawCommands } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    }
  }
}

// Custom Font Size Extension with heading size detection
export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string): Command => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: (): Command => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
});

// Utility function to get current font size including headings
export const getCurrentFontSize = (editor: Editor): string => {
  if (!editor) return '';

  // Check if it's a heading and return its default size
  if (editor.isActive('heading', { level: 1 })) return '40px'; // 2.5em = ~40px
  if (editor.isActive('heading', { level: 2 })) return '32px'; // 2em = ~32px
  if (editor.isActive('heading', { level: 3 })) return '28px'; // 1.75em = ~28px
  if (editor.isActive('heading', { level: 4 })) return '24px'; // 1.5em = ~24px
  if (editor.isActive('heading', { level: 5 })) return '20px'; // 1.25em = ~20px
  if (editor.isActive('heading', { level: 6 })) return '18px'; // 1.125em = ~18px

  // Check for custom font size
  const fontSize = editor.getAttributes('textStyle').fontSize;
  if (fontSize) return fontSize;

  // Default paragraph size
  return '14px';
};

// Utility function to get heading size info
export const getHeadingSizeInfo = (level: number): { size: string; em: string } => {
  const sizeMap = {
    1: { size: '40px', em: '2.5em' },
    2: { size: '32px', em: '2em' },
    3: { size: '28px', em: '1.75em' },
    4: { size: '24px', em: '1.5em' },
    5: { size: '20px', em: '1.25em' },
    6: { size: '18px', em: '1.125em' },
  };
  return sizeMap[level as keyof typeof sizeMap] || { size: '14px', em: '1em' };
};