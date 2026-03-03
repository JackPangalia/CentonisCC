"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
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
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListTodo,
  Quote,
  Code,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Highlighter,
} from "lucide-react";
import EntityMentionExtension from "@/lib/tiptap/extensions/EntityMentionExtension";
import SlashCommandExtension from "@/lib/tiptap/extensions/SlashCommandExtension";
import type { EntityMentionItem } from "@/components/mentions/EntityMentionList";

type NoteEditorProps = {
  content: string;
  onChange: (html: string) => void;
  onTitleChange?: (title: string) => void;
};

const KEYBOARD_SHORTCUTS = [
  { label: "Heading 1", shortcut: "⌘+Opt+1" },
  { label: "Heading 2", shortcut: "⌘+Opt+2" },
  { label: "Heading 3", shortcut: "⌘+Opt+3" },
  { label: "Bold", shortcut: "⌘+B" },
  { label: "Italic", shortcut: "⌘+I" },
  { label: "Underline", shortcut: "⌘+U" },
  { label: "Strikethrough", shortcut: "⌘+Shift+X" },
  { label: "Highlight", shortcut: "⌘+Shift+H" },
  { label: "Inline Code", shortcut: "⌘+E" },
  { label: "Bullet List", shortcut: "⌘+Shift+8" },
  { label: "Numbered List", shortcut: "⌘+Shift+7" },
  { label: "Todo List", shortcut: "⌘+Shift+9" },
  { label: "Blockquote", shortcut: "⌘+Shift+B" },
  { label: "Code Block", shortcut: "⌘+Alt+C" },
  { label: "Divider", shortcut: "---" },
  { label: "Slash Command", shortcut: "/" },
  { label: "Undo", shortcut: "⌘+Z" },
  { label: "Redo", shortcut: "⌘+Shift+Z" },
];

export function NoteEditor({ content, onChange }: NoteEditorProps) {
  const [showLegend, setShowLegend] = useState(false);
  const [isTouchLayout, setIsTouchLayout] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  const mentionItemsRef = useRef<EntityMentionItem[]>([]);

  const refreshTouchLayout = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsTouchLayout(window.innerWidth < 1024);
  }, []);

  const handleToolbarPointerDown = useCallback(
    (event: { preventDefault: () => void }) => {
      // Keep editor focus when tapping toolbar buttons on touch devices.
      event.preventDefault();
    },
    [],
  );

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
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: false,
        underline: false,
      }),
      Typography,
      Underline,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Start typing...' }),
      EntityMentionExtension.configure({ getItems: getMentionItems }),
      SlashCommandExtension,
      BubbleMenuExtension,
    ],
    content,
    editable: true,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      handleDOMEvents: {
        focus: () => {
          setIsEditorFocused(true);
          return false;
        },
        blur: () => {
          setIsEditorFocused(false);
          return false;
        },
      },
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert focus:outline-none min-h-[500px] max-w-none pb-24 text-zinc-900 dark:text-zinc-100 prose-p:my-1.5 prose-p:leading-relaxed prose-headings:font-bold prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-[1.75rem] prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:border-l-4 prose-blockquote:border-zinc-300 dark:prose-blockquote:border-zinc-700 prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-800/80 prose-pre:text-zinc-800 dark:prose-pre:text-zinc-200",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  useEffect(() => {
    refreshTouchLayout();
    window.addEventListener("resize", refreshTouchLayout);
    return () => {
      window.removeEventListener("resize", refreshTouchLayout);
    };
  }, [refreshTouchLayout]);

  if (!editor) return null;

  const menuBtn =
    "p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";
  const menuBtnActive =
    "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100";
  const touchToolbarButton =
    "flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed";
  const touchToolbarButtonActive =
    "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100";
  const showTouchToolbar = isTouchLayout && isEditorFocused;

  const touchActions = [
    {
      id: "bold",
      label: "Bold",
      icon: Bold,
      isActive: editor.isActive("bold"),
      canRun: editor.can().chain().focus().toggleBold().run(),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      id: "italic",
      label: "Italic",
      icon: Italic,
      isActive: editor.isActive("italic"),
      canRun: editor.can().chain().focus().toggleItalic().run(),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      id: "underline",
      label: "Underline",
      icon: UnderlineIcon,
      isActive: editor.isActive("underline"),
      canRun: editor.can().chain().focus().toggleUnderline().run(),
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      id: "heading1",
      label: "H1",
      icon: Heading1,
      isActive: editor.isActive("heading", { level: 1 }),
      canRun: editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
      run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: "heading2",
      label: "H2",
      icon: Heading2,
      isActive: editor.isActive("heading", { level: 2 }),
      canRun: editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: "bullet",
      label: "Bullet",
      icon: List,
      isActive: editor.isActive("bulletList"),
      canRun: editor.can().chain().focus().toggleBulletList().run(),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      id: "todo",
      label: "Todo",
      icon: ListTodo,
      isActive: editor.isActive("taskList"),
      canRun: editor.can().chain().focus().toggleTaskList().run(),
      run: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      id: "quote",
      label: "Quote",
      icon: Quote,
      isActive: editor.isActive("blockquote"),
      canRun: editor.can().chain().focus().toggleBlockquote().run(),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      id: "code",
      label: "Code",
      icon: Code,
      isActive: editor.isActive("code"),
      canRun: editor.can().chain().focus().toggleCode().run(),
      run: () => editor.chain().focus().toggleCode().run(),
    },
    {
      id: "link",
      label: "Link",
      icon: LinkIcon,
      isActive: editor.isActive("link"),
      canRun: true,
      run: setLink,
    },
    {
      id: "undo",
      label: "Undo",
      icon: Undo2,
      isActive: false,
      canRun: editor.can().chain().focus().undo().run(),
      run: () => editor.chain().focus().undo().run(),
    },
    {
      id: "redo",
      label: "Redo",
      icon: Redo2,
      isActive: false,
      canRun: editor.can().chain().focus().redo().run(),
      run: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div
      className={`relative min-h-[calc(100vh-200px)] ${showTouchToolbar ? "pb-24" : ""}`}
    >
      <div className="min-h-full transition-shadow">
        <EditorContent editor={editor} />
      </div>

      {!isTouchLayout && (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${menuBtn} ${editor.isActive("bold") ? menuBtnActive : ""}`}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${menuBtn} ${editor.isActive("italic") ? menuBtnActive : ""}`}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${menuBtn} ${editor.isActive("underline") ? menuBtnActive : ""}`}
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`${menuBtn} ${editor.isActive("code") ? menuBtnActive : ""}`}
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`${menuBtn} ${editor.isActive("highlight") ? menuBtnActive : ""}`}
          >
            <Highlighter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={setLink}
            className={`${menuBtn} ${editor.isActive("link") ? menuBtnActive : ""}`}
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </BubbleMenu>
      )}

      {showTouchToolbar && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-2"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {touchActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onPointerDown={handleToolbarPointerDown}
                  onClick={action.run}
                  disabled={!action.canRun}
                  className={`${touchToolbarButton} ${action.isActive ? touchToolbarButtonActive : ""}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={`fixed right-6 z-40 ${isTouchLayout ? "hidden" : "bottom-6"}`}>
        {showLegend ? (
          <div className="w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-t-xl">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowLegend(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              <div className="space-y-1">
                {KEYBOARD_SHORTCUTS.map((cmd, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="text-zinc-700 dark:text-zinc-400 font-medium">
                      {cmd.label}
                    </span>
                    <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                      {cmd.shortcut}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            title="Keyboard Shortcuts"
          >
            &#x2328;&#xFE0F;
          </button>
        )}
      </div>
    </div>
  );
}
