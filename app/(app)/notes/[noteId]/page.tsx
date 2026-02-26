"use client";
/* This file renders the individual note editor page. */
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getNoteById, updateNote, deleteNote } from "@/services/noteService";
import { NoteEditor } from "@/components/notes/NoteEditor";
import type { Note } from "@/types/models";
import { toast } from "sonner";

export default function NotePage() {
  const params = useParams<{ noteId: string }>();
  const noteId = params.noteId;
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoadingNote, setIsLoadingNote] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadNote = useCallback(async () => {
    if (!noteId) return;
    try {
      setIsLoadingNote(true);
      const noteData = await getNoteById(noteId);
      if (!noteData) {
        router.replace("/notes");
        return;
      }
      // Check if user owns this note
      if (noteData.userId !== user?.uid) {
        router.replace("/notes");
        return;
      }
      setNote(noteData);
    } catch (error) {
      console.error("Failed to load note:", error);
      router.replace("/notes");
    } finally {
      setIsLoadingNote(false);
    }
  }, [noteId, user, router]);

  useEffect(() => {
    if (!isLoading && user) {
      void loadNote();
    }
  }, [isLoading, user, loadNote]);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
      // We intentionally do NOT clear the timeout here, 
      // so if they click back/close before 2s, it still saves in the background.
    };
  }, []);

  const debouncedSave = useCallback((content: string, title: string) => {
    if (!noteId || !note) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (isMounted.current) setIsSaving(true);
        await updateNote(noteId, { content, title });
      } catch (error) {
        console.error("Failed to save note:", error);
        toast.error(`Error saving note: ${(error as Error)?.message || "Unknown error"}`);
      } finally {
        if (isMounted.current) setIsSaving(false);
      }
    }, 1500); // Save 1.5 seconds after typing stops
  }, [noteId, note]);

  function handleContentChange(content: string) {
    if (!note) return;
    setNote({ ...note, content });
    debouncedSave(content, note.title);
  }

  async function handleDelete() {
    if (!noteId || !confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(noteId);
      router.push("/notes");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note. Please try again.");
    }
  }

  if (isLoading || isLoadingNote || !note) {
    return <p className="text-sm text-zinc-400">Loading note...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-32 pt-2">
      {/* Fixed Header Controls (Title + Back) */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-3 pointer-events-auto">
        <button
          onClick={() => {
            // Force save immediately if leaving early
            if (saveTimeoutRef.current && note) {
              clearTimeout(saveTimeoutRef.current);
              void updateNote(noteId as string, { content: note.content, title: note.title });
            }
            router.push("/notes");
          }}
          className="group flex items-center justify-center w-9 h-9 rounded-full bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all backdrop-blur-md shadow-sm"
          title="Back to notes"
        >
          <span className="text-lg leading-none">←</span>
        </button>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={note.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setNote({ ...note, title: newTitle });
              debouncedSave(note.content, newTitle);
            }}
            className="w-[200px] sm:w-[300px] bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-zinc-500 dark:focus:border-zinc-400 p-0 transition-all px-1 py-0.5"
            placeholder="Untitled Note"
          />
          {isSaving && (
            <span className="text-[10px] font-medium text-zinc-400 animate-pulse">Saving...</span>
          )}
        </div>
      </div>
      
      {/* Delete Button (Fixed Top-Right-ish) */}
      <div className="fixed top-4 right-40 md:right-48 z-50 pointer-events-auto">
        <button
          onClick={() => void handleDelete()}
          className="group flex items-center justify-center w-9 h-9 rounded-full bg-white/50 dark:bg-zinc-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 border border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-800/30 text-zinc-400 hover:text-red-500 transition-all backdrop-blur-md shadow-sm"
          title="Delete note"
        >
          <span className="text-sm">🗑️</span>
        </button>
      </div>

      <div className="px-4 md:px-8 space-y-6 pt-8">
        <NoteEditor
          key={note.id}
          content={note.content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
}
