import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface MentionLinkOptions {
  resolveTitleToUrl: (title: string) => string | undefined;
}

const MentionLinkExtension = Extension.create<MentionLinkOptions>({
  name: 'mentionLink',

  addOptions() {
    return {
      resolveTitleToUrl: () => undefined,
    };
  },

  addMarks() {
    return {
      mentionLink: {
        inclusive: false,
        group: 'link',
        
        addAttributes() {
          return {
            href: {
              default: null,
              parseHTML: (element) => element.getAttribute('href'),
            },
            target: {
              default: '_self',
              parseHTML: () => '_self',
            },
            rel: {
              default: 'noopener noreferrer',
              parseHTML: () => 'noopener noreferrer',
            },
          };
        },

        parseHTML() {
          return [
            {
              tag: 'a[data-type="mention-link"]',
            },
          ];
        },

        renderHTML({ HTMLAttributes }) {
          return ['a', { ...HTMLAttributes, 'data-type': 'mention-link' }, 0];
        },
      },
    };
  },

  addProseMirrorPlugins() {
    const { resolveTitleToUrl } = this.options;

    return [
      new Plugin({
        key: new PluginKey('mentionLinkPlugin'),
        appendTransaction: (transactions, oldState, newState) => {
          // Only process if the document has changed
          if (!transactions.some(tr => tr.docChanged)) {
            return null;
          }
          console.log("mentionLinkPlugin: doc changed");

          // Resolve the mark type from the current schema.
          // In some editor lifecycle phases this can be null, so we guard against it.
          const markType = newState.schema.marks.mentionLink;
          if (!markType) {
            return null;
          }
          console.log("mentionLinkPlugin: markType exists");

          let tr = newState.tr;
          let changed = false;

          // Iterate through nodes to find text that matches [[Title]]
          newState.doc.descendants((node, pos) => {
            if (node.isText) {
              const text = node.text || '';
              const regex = /\[\[(.*?)\]\]/g;
              let match;

              while ((match = regex.exec(text)) !== null) {
                const fullMatch = match[0];
                const title = match[1];
                const url = resolveTitleToUrl(title);
                console.log("mentionLinkPlugin: found match", { fullMatch, title, url });

                if (url) {
                  const start = pos + match.index;
                  const end = start + fullMatch.length;

                  // Check if this text is ALREADY a mentionLink
                  // More precise check: does the range in the doc already have this mark?
                  // We need to look at the document relative to the start/end positions
                  const rangeHasMark = newState.doc.rangeHasMark(start, end, markType);

                  if (!rangeHasMark) {
                    console.log("mentionLinkPlugin: adding mark", { start, end, href: url });
                    // Apply the mentionLink mark to the matched text
                    // We remove the [[ ]] brackets for cleaner look, or keep them?
                    // Let's replace the full "[[Title]]" with just "Title" that is linked
                    
                    // To replace text, we need to delete the brackets.
                    // This is more complex than just adding a mark.
                    // For simplicity in this first version, let's just mark the whole [[Title]] text.
                    
                    tr = tr.addMark(start, end, markType.create({ href: url }));
                    changed = true;
                  }
                }
              }
            }
          });

          return changed ? tr : null;
        },
      }),
    ];
  },
});

export default MentionLinkExtension;
