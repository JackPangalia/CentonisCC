"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { useEffect, useCallback, useRef } from "react";
import EntityMentionExtension from "@/lib/tiptap/extensions/EntityMentionExtension";
import type { EntityMentionItem } from "@/components/mentions/EntityMentionList";
import { useAuth } from "@/hooks/useAuth";
import { listNotes } from "@/services/noteService";
import { listGoals } from "@/services/goalService";

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
};

export function RichTextEditor({
  content,
  onChange,
  editable = true,
  placeholder = "Type '/' for commands...",
}: RichTextEditorProps) {
  const { user } = useAuth();
  
  // Ref to hold the mentionable items list for stable access inside the Tiptap extension
  const mentionItemsRef = useRef<EntityMentionItem[]>([]);
  
  // We use a state just to trigger a re-render if we needed to show status, 
  // but mostly we just need the Ref to be up to date for the extension callback.
  // However, `useEditor` is initialized once. 
  
  // Fetch linkable items
  useEffect(() => {
    if (!user) return;

    const uid = user.uid;

    let isMounted = true;

    async function fetchItems() {
      const items: EntityMentionItem[] = [];
      
      try {
        // 1. Notes
        const notes = await listNotes(uid);
        if (isMounted) {
          notes.forEach(note => {
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
        // 2. Personal Goals
        const goals = await listGoals("personal", uid);
        if (isMounted) {
          goals.forEach(goal => {
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
    
    fetchItems();
    
    return () => { isMounted = false; };
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
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({
        placeholder,
      }),
      EntityMentionExtension.configure({
        getItems: getMentionItems,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base focus:outline-none min-h-[150px] max-w-none dark:prose-invert",
      },
    },
  });

  // Update content if it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-500 focus-within:border-zinc-500 transition-shadow">
      <div className="p-3 text-zinc-900 dark:text-zinc-100">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
