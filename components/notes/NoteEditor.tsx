"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* This component provides a clean note editor relying on native Tiptap shortcuts. */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useCallback, useEffect, useRef, useState } from "react";
import EntityMentionExtension from "@/lib/tiptap/extensions/EntityMentionExtension";
import type { EntityMentionItem } from "@/components/mentions/EntityMentionList";
import { useAuth } from "@/hooks/useAuth";
import { listNotes } from "@/services/noteService";
import { listGoals } from "@/services/goalService";

type NoteEditorProps = {
  content: string;
  onChange: (html: string) => void;
  onTitleChange?: (title: string) => void;
};

const KEYBOARD_SHORTCUTS = [
  // Headings
  { label: "Heading 1", shortcut: "⌘+Opt+1" },
  { label: "Heading 2", shortcut: "⌘+Opt+2" },
  { label: "Heading 3", shortcut: "⌘+Opt+3" },
  { label: "Heading 4", shortcut: "⌘+Opt+4" },
  { label: "Heading 5", shortcut: "⌘+Opt+5" },
  { label: "Heading 6", shortcut: "⌘+Opt+6" },
  
  // Basic Formatting
  { label: "Bold", shortcut: "⌘+B" },
  { label: "Italic", shortcut: "⌘+I" },
  { label: "Underline", shortcut: "⌘+U" },
  { label: "Strikethrough", shortcut: "⌘+Shift+X" },
  { label: "Highlight", shortcut: "⌘+Shift+H" },
  { label: "Inline Code", shortcut: "⌘+E" },

  // Lists & Structure
  { label: "Bullet List", shortcut: "⌘+Shift+8" },
  { label: "Numbered List", shortcut: "⌘+Shift+7" },
  { label: "Todo List", shortcut: "⌘+Shift+9" },
  { label: "Blockquote", shortcut: "⌘+Shift+B" },
  { label: "Code Block", shortcut: "⌘+Alt+C" },
  { label: "Divider", shortcut: "---" },

  // Alignment
  { label: "Align Left", shortcut: "⌘+Shift+L" },
  { label: "Align Center", shortcut: "⌘+Shift+E" },
  { label: "Align Right", shortcut: "⌘+Shift+R" },
  { label: "Justify", shortcut: "⌘+Shift+J" },

  // History
  { label: "Undo", shortcut: "⌘+Z" },
  { label: "Redo", shortcut: "⌘+Shift+Z" },
];

export function NoteEditor({ content, onChange, onTitleChange }: NoteEditorProps) {
  const [showLegend, setShowLegend] = useState(false);
  const { user } = useAuth();

  const mentionItemsRef = useRef<EntityMentionItem[]>([]);

  // Fetch linkable items for [[Title]] mentions (notes + personal goals)
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function fetchItems() {
      const items: EntityMentionItem[] = [];

      try {
        const notes = await listNotes(user.uid);
        if (isMounted) {
          notes.forEach((note) => {
            if (note.title) {
              items.push({
                id: note.id,
                label: note.title,
                href: `/notes/${note.id}`,
                type: "note",
              });
            }
          });
        }
      } catch (e) {
        console.error("Failed to fetch notes for linking", e);
      }

      try {
        const goals = await listGoals("personal", user.uid);
        if (isMounted) {
          goals.forEach((goal) => {
            if (goal.title) {
              items.push({
                id: goal.id,
                label: goal.title,
                href: `/goals/${goal.id}`,
                type: "goal",
              });
            }
          });
        }
      } catch (e) {
        console.error("Failed to fetch goals for linking", e);
      }

      if (isMounted) {
        mentionItemsRef.current = items;
      }
    }

    void fetchItems();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getMentionItems = useCallback((query: string) => {
    const all = mentionItemsRef.current;
    if (!query) return all.slice(0, 20);
    const lower = query.toLowerCase();
    return all
      .filter((item) => item.label.toLowerCase().includes(lower))
      .slice(0, 20);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Tiptap's StarterKit includes: 
        // Blockquote, BulletList, CodeBlock, Document, HardBreak, Heading, 
        // HorizontalRule, ListItem, OrderedList, Paragraph, Text, 
        // Bold, Code, Italic, Strike, Dropcursor, Gapcursor, History
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        // We provide dedicated Link and Underline extensions below,
        // so we disable any built-in versions to avoid duplicate names.
        link: false,
        underline: false,
      }),
      Typography,
      Underline,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: "Start typing...",
      }),
      EntityMentionExtension.configure({
        getItems: getMentionItems,
      }),
    ],
    content,
    editable: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-zinc dark:prose-invert focus:outline-none min-h-[500px] max-w-none py-6 text-zinc-900 dark:text-zinc-200",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <div className="min-h-full transition-shadow">
        <EditorContent editor={editor} />
      </div>

      {/* Command Legend / Key */}
      <div className="fixed bottom-6 right-6 z-40">
        {showLegend ? (
          <div className="w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-t-xl">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Keyboard Shortcuts</h3>
              <button 
                onClick={() => setShowLegend(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              <div className="space-y-1">
                {KEYBOARD_SHORTCUTS.map((cmd, index) => (
                  <div key={index} className="flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <span className="text-zinc-700 dark:text-zinc-400 font-medium">{cmd.label}</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                        {cmd.shortcut}
                      </code>
                    </div>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 px-2 text-[10px] text-zinc-500">
                  <p>Most standard markdown syntax is also supported (e.g. # for H1, * for list).</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            title="Keyboard Shortcuts"
          >
            ⌨️
          </button>
        )}
      </div>
    </div>
  );
}
