"use client";
/* This component displays a list of notes with delete, rename, and move options. */
import Link from "next/link";
import { useState } from "react";
import type { Note, NoteFolder } from "@/types/models";
import { FolderInput, Edit2, Trash2 } from "lucide-react";

type NoteListProps = {
  notes: Note[];
  folders: NoteFolder[];
  onDelete: (noteId: string) => void;
  onRename: (noteId: string, newTitle: string) => void;
  onMove: (noteId: string, folderId: string | null) => void;
};

export function NoteList({ notes, folders, onDelete, onRename, onMove }: NoteListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [movingId, setMovingId] = useState<string | null>(null);

  function startEditing(note: Note, e: React.MouseEvent) {
    e.preventDefault();
    setEditingId(note.id);
    setEditTitle(note.title);
    setMovingId(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
  }

  function saveEditing(noteId: string, e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRename(noteId, editTitle.trim());
    }
    setEditingId(null);
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 p-12 text-center shadow-sm">
        <div className="text-4xl mb-3 opacity-50">📝</div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">No notes found</p>
        <p className="text-xs text-zinc-500 mt-1">Create a new note to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/30 p-5 transition-all hover:bg-white/80 dark:hover:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:shadow-md"
        >
          {editingId === note.id ? (
            <form 
              onSubmit={(e) => saveEditing(note.id, e)} 
              className="flex flex-col gap-3 h-full"
            >
              <input
                autoFocus
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-zinc-500"
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEditing();
                }}
              />
              <div className="flex gap-2 mt-auto">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-2 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : movingId === note.id ? (
            <div className="flex flex-col gap-3 h-full">
              <p className="text-xs font-medium text-zinc-500">Move to folder:</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                <button
                  onClick={() => { onMove(note.id, null); setMovingId(null); }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors ${note.folderId === null ? 'bg-zinc-100 dark:bg-zinc-800 font-medium' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'}`}
                >
                  All Notes (Root)
                </button>
                {folders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { onMove(note.id, f.id); setMovingId(null); }}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors ${note.folderId === f.id ? 'bg-zinc-100 dark:bg-zinc-800 font-medium' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setMovingId(null)}
                className="mt-auto w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <Link href={`/notes/${note.id}`} className="flex flex-col h-full">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors line-clamp-2">
                  {note.title || "Untitled"}
                </h3>
                
                {/* Preview snippet could go here if we extract text from HTML */}
                
                <div className="mt-auto pt-6 flex items-center justify-between">
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                    {new Date(note.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {note.folderId && (
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 truncate max-w-[100px]">
                      {folders.find(f => f.id === note.folderId)?.name || 'Folder'}
                    </span>
                  )}
                </div>
              </Link>
              
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 shadow-sm">
                <button
                  onClick={(e) => { e.preventDefault(); setMovingId(note.id); }}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  title="Move to folder"
                >
                  <FolderInput className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => startEditing(note, e)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center justify-center"
                  title="Rename note"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm("Are you sure you want to delete this note?")) {
                      onDelete(note.id);
                    }
                  }}
                  className="rounded p-1.5 text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center justify-center"
                  title="Delete note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}