"use client";
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { useEffect } from "react";

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
  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({
        placeholder,
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
        class: "prose prose-sm sm:prose-base focus:outline-none min-h-[150px] max-w-none",
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
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
      {editable && (
        <>
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="flex overflow-hidden rounded border border-slate-200 bg-white shadow-lg"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-2 py-1 text-sm hover:bg-slate-100 ${
                editor.isActive("bold") ? "bg-slate-100 text-blue-600" : "text-slate-600"
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-2 py-1 text-sm hover:bg-slate-100 ${
                editor.isActive("italic") ? "bg-slate-100 text-blue-600" : "text-slate-600"
              }`}
            >
              Italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`px-2 py-1 text-sm hover:bg-slate-100 ${
                editor.isActive("strike") ? "bg-slate-100 text-blue-600" : "text-slate-600"
              }`}
            >
              Strike
            </button>
          </BubbleMenu>

          <FloatingMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="flex overflow-hidden rounded border border-slate-200 bg-white shadow-lg"
          >
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-2 py-1 text-sm hover:bg-slate-100 ${
                editor.isActive("heading", { level: 1 }) ? "bg-slate-100 text-blue-600" : "text-slate-600"
              }`}
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2 py-1 text-sm hover:bg-slate-100 ${
                editor.isActive("heading", { level: 2 }) ? "bg-slate-100 text-blue-600" : "text-slate-600"
              }`}
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-2 py-1 text-sm hover:bg-slate-100 ${
                editor.isActive("bulletList") ? "bg-slate-100 text-blue-600" : "text-slate-600"
              }`}
            >
              Bullet List
            </button>
          </FloatingMenu>
        </>
      )}
      
      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
