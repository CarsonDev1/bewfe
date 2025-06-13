import { Extension } from '@tiptap/core';
import { Transaction, EditorState } from '@tiptap/pm/state';
import type { Command, RawCommands } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    }
  }
}

export const Indent = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const style = element.getAttribute('style');
              if (style) {
                const match = style.match(/margin-left:\s*(\d+)px/);
                return match ? parseInt(match[1]) / 40 : 0; // 40px per indent level
              }
              return 0;
            },
            renderHTML: attributes => {
              if (attributes.indent > 0) {
                return {
                  style: `margin-left: ${attributes.indent * 40}px`,
                };
              }
              return {};
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: (): Command => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { from, to } = selection;

        if (dispatch) {
          state.doc.nodesBetween(from, to, (node: any, pos: number) => {
            if (node.type.name === 'paragraph' || node.type.name === 'heading') {
              const currentIndent = node.attrs.indent || 0;
              const newIndent = Math.min(currentIndent + 1, 10); // Max 10 levels
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: newIndent });
            }
          });
        }

        return true;
      },

      outdent: (): Command => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { from, to } = selection;

        if (dispatch) {
          state.doc.nodesBetween(from, to, (node: any, pos: number) => {
            if (node.type.name === 'paragraph' || node.type.name === 'heading') {
              const currentIndent = node.attrs.indent || 0;
              const newIndent = Math.max(currentIndent - 1, 0);
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: newIndent });
            }
          });
        }

        return true;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.commands.sinkListItem('listItem');
        }
        return editor.commands.indent();
      },
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.commands.liftListItem('listItem');
        }
        return editor.commands.outdent();
      },
    };
  },
});