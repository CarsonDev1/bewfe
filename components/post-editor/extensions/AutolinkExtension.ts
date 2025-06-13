import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// Auto-link extension to detect and linkify URLs
export const Autolink = Extension.create({
  name: 'autolink',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('autolink'),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, decorationSet) {
            const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
            const decorations: Decoration[] = [];

            tr.doc.descendants((node, pos) => {
              if (node.isText) {
                const text = node.text || '';
                let match;
                while ((match = urlRegex.exec(text)) !== null) {
                  const start = pos + match.index;
                  const end = start + match[0].length;

                  // Check if this text is already a link
                  const linkMark = tr.doc.rangeHasMark(start, end, tr.doc.type.schema.marks.link);
                  if (!linkMark) {
                    decorations.push(
                      Decoration.inline(start, end, {
                        class: 'autolink-detected',
                        style: 'color: #3182ce; text-decoration: underline; cursor: pointer;'
                      })
                    );
                  }
                }
              }
            });

            return DecorationSet.create(tr.doc, decorations);
          }
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleClick(view, pos, event) {
            const { schema, doc } = view.state;
            const clickPos = view.posAtCoords({ left: event.clientX, top: event.clientY });

            if (!clickPos) return false;

            const $pos = doc.resolve(clickPos.pos);
            const node = $pos.nodeAfter;

            if (node && node.isText) {
              const text = node.text || '';
              const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
              let match;

              while ((match = urlRegex.exec(text)) !== null) {
                const start = $pos.pos + match.index;
                const end = start + match[0].length;

                if (clickPos.pos >= start && clickPos.pos <= end) {
                  let url = match[0];
                  if (!url.startsWith('http')) {
                    url = 'https://' + url;
                  }

                  // Convert to actual link
                  const tr = view.state.tr.addMark(
                    start,
                    end,
                    schema.marks.link.create({
                      href: url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      class: 'editor-link'
                    })
                  );
                  view.dispatch(tr);

                  // Open the link
                  window.open(url, '_blank');
                  return true;
                }
              }
            }

            return false;
          }
        }
      })
    ];
  }
});