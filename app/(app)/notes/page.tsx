"use client";
/* This file renders the notes list page. */
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { listNotes, createNote, deleteNote, updateNote, listFolders, createFolder, deleteFolder, updateFolder } from "@/services/noteService";
import { NoteList } from "@/components/notes/NoteList";
import type { Note, NoteFolder } from "@/types/models";
import { toast } from "sonner";
import { Folder, FolderPlus, Search, FileText, Trash2, Edit2 } from "lucide-react";

export default function NotesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Folder creation state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Folder editing state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");

  const folderCreateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreatingFolder && folderCreateInputRef.current) {
      folderCreateInputRef.current.focus();
    }
  }, [isCreatingFolder]);

  async function loadData() {
    if (!user) return;
    try {
      const [notesData, foldersData] = await Promise.all([
        listNotes(user.uid),
        listFolders(user.uid)
      ]);
      
      notesData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      foldersData.sort((a, b) => a.name.localeCompare(b.name));
      
      setNotes(notesData);
      setFolders(foldersData as NoteFolder[]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleCreateNote() {
    if (!user) return;
    setIsCreating(true);
    try {
      const noteId = await createNote(user.uid, selectedFolderId);
      router.push(`/notes/${noteId}`);
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note. Please try again.");
      setIsCreating(false);
    }
  }

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newFolderName.trim()) return;
    try {
      await createFolder(user.uid, newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
      await loadData();
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error(`Error: ${(error as Error)?.message || "Failed to create folder"}`);
    }
  }

  async function handleUpdateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!editingFolderId || !editFolderName.trim()) return;
    try {
      await updateFolder(editingFolderId, editFolderName.trim());
      setEditingFolderId(null);
      await loadData();
    } catch (error) {
      console.error("Failed to update folder:", error);
      toast.error(`Error: ${(error as Error)?.message || "Failed to update folder"}`);
    }
  }

  async function handleDeleteFolder(folderId: string) {
    if (!confirm("Are you sure you want to delete this folder? Notes inside will be moved to 'All Notes'.")) return;
    if (!user) return;
    try {
      await deleteFolder(folderId, user.uid);
      if (selectedFolderId === folderId) setSelectedFolderId(null);
      await loadData();
    } catch (error) {
      console.error("Failed to delete folder:", error);
      toast.error(`Error: ${(error as Error)?.message || "Failed to delete folder."}`);
    }
  }

  async function handleDeleteNote(noteId: string) {
    try {
      await deleteNote(noteId);
      await loadData();
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note.");
    }
  }

  async function handleRenameNote(noteId: string, newTitle: string) {
    try {
      await updateNote(noteId, { title: newTitle });
      await loadData();
    } catch (error) {
      console.error("Failed to rename note:", error);
      toast.error("Failed to rename note.");
    }
  }

  async function handleMoveNote(noteId: string, folderId: string | null) {
    try {
      await updateNote(noteId, { folderId });
      await loadData();
      toast.success("Note moved successfully.");
    } catch (error) {
      console.error("Failed to move note:", error);
      toast.error("Failed to move note.");
    }
  }

  if (isLoading || isLoadingData) {
    return <p className="text-sm text-zinc-400">Loading workspace...</p>;
  }

  // Filter notes based on search and selected folder
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === "" || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // If searching, ignore folder selection to show all matches
    if (searchQuery !== "") return matchesSearch;
    
    const matchesFolder = selectedFolderId === null ? true : note.folderId === selectedFolderId;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search all notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 pl-9 pr-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Folders</h2>
            <button 
              onClick={() => setIsCreatingFolder(true)}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => { setSelectedFolderId(null); setSearchQuery(""); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFolderId === null && !searchQuery
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" 
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <FileText className="h-4 w-4" />
            All Notes
            <span className="ml-auto text-xs text-zinc-400">{notes.length}</span>
          </button>

          {isCreatingFolder && (
            <div className="px-2 py-1">
              <input
                ref={folderCreateInputRef}
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newFolderName.trim()) {
                      void handleCreateFolder(e as unknown as React.FormEvent);
                    }
                  } else if (e.key === 'Escape') {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }
                }}
                onBlur={() => {
                  // Ignore blur if empty
                  if (!newFolderName.trim()) {
                    setIsCreatingFolder(false);
                  }
                }}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
              />
            </div>
          )}

          {folders.map(folder => (
            <div key={folder.id} className="group relative flex items-center">
              {editingFolderId === folder.id ? (
                <div className="w-full px-2 py-1">
                  <input
                    autoFocus
                    type="text"
                    value={editFolderName}
                    onChange={(e) => setEditFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editFolderName.trim() && editFolderName.trim() !== folder.name) {
                          void handleUpdateFolder(e as unknown as React.FormEvent);
                        } else {
                          setEditingFolderId(null);
                        }
                      } else if (e.key === 'Escape') {
                        setEditingFolderId(null);
                      }
                    }}
                    onBlur={() => setEditingFolderId(null)}
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => { setSelectedFolderId(folder.id); setSearchQuery(""); }}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedFolderId === folder.id && !searchQuery
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" 
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <Folder className="h-4 w-4" />
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-auto text-xs text-zinc-400">
                      {notes.filter(n => n.folderId === folder.id).length}
                    </span>
                  </button>
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/80 rounded-md p-1">
                    <button 
                      onClick={() => { setEditingFolderId(folder.id); setEditFolderName(folder.name); }}
                      className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => void handleDeleteFolder(folder.id)}
                      className="p-1 text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {searchQuery ? "Search Results" : selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "All Notes"}
            </h1>
            {searchQuery && (
              <p className="text-sm text-zinc-500 mt-1">Showing matches for &quot;{searchQuery}&quot;</p>
            )}
          </div>
          <button
            onClick={() => void handleCreateNote()}
            disabled={isCreating}
            className="rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "New Note"}
          </button>
        </div>

        <NoteList 
          notes={filteredNotes} 
          folders={folders}
          onDelete={handleDeleteNote}
          onRename={handleRenameNote}
          onMove={handleMoveNote}
        />
      </div>
    </div>
  );
}
