/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  ArrowLeft,
  Check,
  Sparkles,
  Calendar,
  Clock,
  X,
  AlertTriangle,
  FilePlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Note } from '../../types';

type ViewMode = 'list' | 'view' | 'edit' | 'create';

export const NotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, togglePinNote } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for creating / editing
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editIsPinned, setEditIsPinned] = useState(false);

  // Delete modal state
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  // Active note currently being viewed or edited
  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // Filter notes by search query (matching titles)
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter((n) => n.title.toLowerCase().includes(q));
  }, [notes, searchQuery]);

  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.isPinned),
    [filteredNotes]
  );

  const unpinnedNotes = useMemo(
    () => filteredNotes.filter((n) => !n.isPinned),
    [filteredNotes]
  );

  // Handlers
  const handleStartCreate = () => {
    setEditTitle('');
    setEditContent('');
    setEditIsPinned(false);
    setSelectedNoteId(null);
    setViewMode('create');
  };

  const handleStartEdit = (note: Note) => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditIsPinned(!!note.isPinned);
    setViewMode('edit');
  };

  const handleOpenNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setViewMode('view');
  };

  const handleSaveNote = () => {
    const trimmedTitle = editTitle.trim() || 'Untitled Note';
    if (viewMode === 'create') {
      const created = addNote(trimmedTitle, editContent);
      if (editIsPinned) {
        togglePinNote(created.id);
      }
      setSelectedNoteId(created.id);
      setViewMode('view');
    } else if (viewMode === 'edit' && selectedNoteId) {
      updateNote(selectedNoteId, {
        title: trimmedTitle,
        content: editContent,
        isPinned: editIsPinned,
      });
      setViewMode('view');
    }
  };

  const ConfirmDeleteModal = () => {
    if (!noteToDelete) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06050B]/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-sm rounded-3xl bg-[#12101D] border border-[#262438] p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 text-rose-400">
            <div className="p-2.5 rounded-2xl bg-rose-950/40 border border-rose-800/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#EAE6F2]">Delete Note?</h3>
              <p className="text-[11px] text-[#AAA4B8]">This action cannot be undone.</p>
            </div>
          </div>

          <p className="text-xs text-[#AAA4B8] font-light bg-[#1A162B] p-3 rounded-2xl border border-[#262438] truncate font-mono">
            "{noteToDelete.title}"
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNoteToDelete(null)}
              className="px-4 py-2 rounded-xl bg-[#1A162B] hover:bg-[#262438] text-xs text-[#AAA4B8] hover:text-[#EAE6F2] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deleteNote(noteToDelete.id);
                setNoteToDelete(null);
                if (selectedNoteId === noteToDelete.id) {
                  setSelectedNoteId(null);
                  setViewMode('list');
                }
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-medium shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Format date helper
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  // Render Note Editor / Create Form
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
        {ConfirmDeleteModal()}
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-[#262438] pb-4">
          <button
            type="button"
            onClick={() => {
              if (selectedNote && viewMode === 'edit') {
                setViewMode('view');
              } else {
                setViewMode('list');
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12101D] border border-[#262438] hover:border-[#C084FC]/40 text-xs text-[#AAA4B8] hover:text-[#EAE6F2] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditIsPinned(!editIsPinned)}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                editIsPinned
                  ? 'bg-[#C084FC]/20 border-[#C084FC]/50 text-[#C084FC]'
                  : 'bg-[#12101D] border-[#262438] text-[#AAA4B8] hover:text-[#EAE6F2]'
              }`}
              title={editIsPinned ? 'Pinned to top' : 'Pin note to top'}
            >
              <Pin className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSaveNote}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#B8A4D8] via-[#C084FC] to-[#F472B6] text-[#06050B] text-xs font-medium shadow-[0_0_20px_rgba(192,132,252,0.35)] hover:scale-102 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Note</span>
            </button>
          </div>
        </div>

        {/* Editor Content Area */}
        <div className="space-y-4 p-6 rounded-3xl bg-[#12101D]/90 border border-[#262438] shadow-xl backdrop-blur-md">
          <div>
            <label className="block text-[11px] font-medium text-[#B4ACCA] tracking-wider uppercase mb-1.5">
              Note Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 rounded-2xl bg-[#08080C] border border-[#262438] focus:border-[#C084FC]/60 text-base text-[#EAE6F2] placeholder-[#AAA4B8]/50 outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-medium text-[#B4ACCA] tracking-wider uppercase">
                Note Content
              </label>
              <div className="text-[10px] text-[#AAA4B8] font-mono">
                {editContent.length} chars · {editContent.trim() ? editContent.trim().split(/\s+/).length : 0} words
              </div>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write your note thoughts here... (unlimited length)"
              rows={16}
              className="w-full p-4 rounded-2xl bg-[#08080C] border border-[#262438] focus:border-[#C084FC]/60 text-sm text-[#EAE6F2] placeholder-[#AAA4B8]/50 outline-none transition-all resize-y font-sans leading-relaxed"
            />
          </div>
        </div>
      </div>
    );
  }

  // Render Note Detail / View Mode
  if (viewMode === 'view' && selectedNote) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
        {ConfirmDeleteModal()}

        {/* Detail Top Navigation */}
        <div className="flex items-center justify-between gap-3 border-b border-[#262438] pb-4">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#12101D] border border-[#262438] hover:border-[#C084FC]/40 text-xs text-[#AAA4B8] hover:text-[#EAE6F2] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Notes</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => togglePinNote(selectedNote.id)}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                selectedNote.isPinned
                  ? 'bg-[#C084FC]/20 border-[#C084FC]/50 text-[#C084FC]'
                  : 'bg-[#12101D] border-[#262438] text-[#AAA4B8] hover:text-[#EAE6F2]'
              }`}
              title={selectedNote.isPinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleStartEdit(selectedNote)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A162B] border border-[#262438] hover:border-[#C084FC]/50 text-xs text-[#EAE6F2] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setNoteToDelete(selectedNote)}
              className="p-2 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 hover:bg-rose-900/40 transition-colors cursor-pointer"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Saved Note Card Display */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12101D]/90 border border-[#262438] shadow-2xl space-y-6 backdrop-blur-md relative overflow-hidden">
          {/* Subtle Ambient Sheen */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#C084FC]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 border-b border-[#262438] pb-5">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-medium text-[#EAE6F2] tracking-tight">
                {selectedNote.title}
              </h1>
              {selectedNote.isPinned && (
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#C084FC]/15 border border-[#C084FC]/30 text-[#C084FC] text-[10px] font-medium flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  Pinned
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[#AAA4B8] font-light">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C084FC]" />
                <span>Created {formatDate(selectedNote.createdAt)}</span>
              </div>
              {selectedNote.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B4ACCA]" />
                  <span>Updated {formatDate(selectedNote.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Full Note Saved Content Body */}
          <div className="text-sm text-[#EAE6F2]/90 leading-relaxed font-sans whitespace-pre-wrap min-h-[200px] selection:bg-[#C084FC]/20">
            {selectedNote.content || (
              <span className="italic text-[#AAA4B8]/60">This note is empty.</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Notes List View (Default)
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
      {ConfirmDeleteModal()}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#12101D] via-[#1A162B] to-[#12101D] border border-[#262438] shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-[#C084FC]/15 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC]">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-normal text-[#EAE6F2] tracking-wide">
              My Notes
            </h1>
            <Sparkles className="w-4 h-4 text-[#C084FC]" />
          </div>
          <p className="text-xs text-[#AAA4B8] font-light">
            Your private thoughts, quiet memos, and gentle ideas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="relative z-10 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#B8A4D8] via-[#C084FC] to-[#F472B6] text-[#06050B] text-xs font-medium shadow-[0_0_20px_rgba(192,132,252,0.35)] hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Note</span>
        </button>
      </div>

      {/* Search Bar */}
      {notes.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#AAA4B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search note titles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#12101D] border border-[#262438] focus:border-[#C084FC]/50 text-xs text-[#EAE6F2] placeholder-[#AAA4B8]/50 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#AAA4B8] hover:text-[#EAE6F2]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <div className="p-12 rounded-3xl bg-[#12101D]/70 border border-[#262438] text-center space-y-4 my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1A162B] border border-[#262438] flex items-center justify-center text-[#C084FC] mx-auto shadow-inner">
            <FilePlus className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-medium text-[#EAE6F2]">
              {searchQuery ? 'No matching note titles' : 'No notes created yet ✨'}
            </h3>
            <p className="text-xs text-[#AAA4B8] font-light">
              {searchQuery
                ? `No notes matched "${searchQuery}". Try a different title query.`
                : 'Tap "Create Note" to write down your thoughts, ideas, or sweet memos.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleStartCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A162B] border border-[#C084FC]/30 hover:border-[#C084FC]/60 text-xs text-[#EAE6F2] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>Create Note</span>
            </button>
          )}
        </div>
      )}

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#C084FC] uppercase tracking-wider px-1">
            <Pin className="w-3.5 h-3.5" />
            <span>Pinned Notes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onOpen={() => handleOpenNote(note)}
                onEdit={() => handleStartEdit(note)}
                onDelete={() => setNoteToDelete(note)}
                onTogglePin={() => togglePinNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Notes Section */}
      {unpinnedNotes.length > 0 && (
        <div className="space-y-3">
          {pinnedNotes.length > 0 && (
            <div className="text-xs font-medium text-[#AAA4B8] uppercase tracking-wider px-1 pt-2">
              <span>All Notes</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {unpinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onOpen={() => handleOpenNote(note)}
                onEdit={() => handleStartEdit(note)}
                onDelete={() => setNoteToDelete(note)}
                onTogglePin={() => togglePinNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

/**
 * NoteCard displays ONLY the note title/name and metadata.
 * It intentionally omits displaying full body content in the list view per requirements.
 */
const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onOpen,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  return (
    <div
      onClick={onOpen}
      className="group relative p-4 rounded-2xl bg-[#12101D]/90 hover:bg-[#181428] border border-[#262438] hover:border-[#C084FC]/40 shadow-lg hover:shadow-[0_4px_20px_rgba(192,132,252,0.15)] transition-all cursor-pointer flex flex-col justify-between gap-3 select-none"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-[#1A162B] border border-[#262438] group-hover:border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] shrink-0 transition-colors">
              <FileText className="w-3.5 h-3.5" />
            </div>
            {/* Note Title Only */}
            <h3 className="text-sm font-medium text-[#EAE6F2] group-hover:text-[#F3EEFB] truncate transition-colors">
              {note.title || 'Untitled Note'}
            </h3>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              note.isPinned
                ? 'text-[#C084FC] hover:text-[#EAE6F2]'
                : 'text-[#AAA4B8]/40 opacity-0 group-hover:opacity-100 hover:text-[#AAA4B8]'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Footer Meta Bar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#262438]/60 text-[11px] text-[#AAA4B8] font-light">
        <div className="flex items-center gap-1 text-[10px]">
          <Calendar className="w-3 h-3 text-[#C084FC]/80" />
          <span>
            {new Date(note.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Action icons on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
            title="Edit Note"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-[#AAA4B8] hover:text-rose-400 cursor-pointer"
            title="Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
