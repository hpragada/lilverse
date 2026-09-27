/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  Sparkles,
  Heart,
  Smile,
  Plus,
  Search,
  Trash2,
  Edit3,
  X,
  Shuffle,
  Calendar,
  Image as ImageIcon,
  Upload,
  Camera,
  Check,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JoyEntry } from '../../types';
import { processImageFile } from '../../services/photoStorage';

const CURATED_EMOJIS = ['✨', '☀️', '🌸', '☕', '🐱', '🍓', '📖', '🎧', '💖', '🌿', '🎨', '🌙', '🦋', '🥖'];

export const JoyJarView: React.FC = () => {
  const { joyEntries, addJoyEntry, updateJoyEntry, deleteJoyEntry } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOpenJarModalOpen, setIsOpenJarModalOpen] = useState(false);
  const [drawnJoy, setDrawnJoy] = useState<JoyEntry | null>(null);

  // Add Form State
  const [joyText, setJoyText] = useState('');
  const [joyEmoji, setJoyEmoji] = useState('✨');
  const [joyDate, setJoyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [joyImageSrc, setJoyImageSrc] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  // Edit State
  const [editingJoy, setEditingJoy] = useState<JoyEntry | null>(null);
  const [editTexs, setEditText] = useState('');
  const [editEmoji, setEditEmoji] = useState('✨');
  const [editDate, setEditDate] = useState('');
  const [editImageSrc, setEditImageSrc] = useState<string | null>(null);

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Filtered joy entries
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return joyEntries;
    const q = searchQuery.toLowerCase();
    return joyEntries.filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        item.date.toLowerCase().includes(q) ||
        item.emoji.includes(q)
    );
  }, [joyEntries, searchQuery]);

  // Handle Photo attachment for new joy
  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    try {
      const { dataUrl } = await processImageFile(file);
      setJoyImageSrc(dataUrl);
    } catch (err: any) {
      console.warn('Failed to process image:', err);
    } finally {
      setIsProcessingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle Photo attachment for edit joy
  const handleEditPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await processImageFile(file);
      setEditImageSrc(dataUrl);
    } catch (err: any) {
      console.warn('Failed to process image:', err);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveNewJoy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joyText.trim()) return;

    let displayDate = joyDate;
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(joyDate)) {
        const [y, m, d] = joyDate.split('-');
        const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        displayDate = dt.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      displayDate = joyDate;
    }

    addJoyEntry({
      text: joyText.trim(),
      emoji: joyEmoji,
      date: displayDate,
      imageSrc: joyImageSrc || undefined,
    });

    setJoyText('');
    setJoyEmoji('✨');
    setJoyImageSrc(null);
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (entry: JoyEntry) => {
    setEditingJoy(entry);
    setEditText(entry.text);
    setEditEmoji(entry.emoji);
    let iso = new Date().toISOString().split('T')[0];
    try {
      const parsed = new Date(entry.date);
      if (!isNaN(parsed.getTime())) {
        iso = parsed.toISOString().split('T')[0];
      }
    } catch {
      // ignore
    }
    setEditDate(iso);
    setEditImageSrc(entry.imageSrc || null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJoy || !editTexs.trim()) return;

    let displayDate = editDate;
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(editDate)) {
        const [y, m, d] = editDate.split('-');
        const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        displayDate = dt.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      displayDate = editDate;
    }

    updateJoyEntry(editingJoy.id, {
      text: editTexs.trim(),
      emoji: editEmoji,
      date: displayDate,
      imageSrc: editImageSrc || undefined,
    });

    setEditingJoy(null);
  };

  const handleDrawRandomJoy = () => {
    if (joyEntries.length === 0) return;
    const available = joyEntries.filter((item) => !drawnJoy || item.id !== drawnJoy.id);
    const pool = available.length > 0 ? available : joyEntries;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setDrawnJoy(pool[randomIndex]);
    setIsOpenJarModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300 select-none">
      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handlePhotoSelected}
      />

      {/* 1. Header Banner with Animated Jar Feel */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#151520] via-[#12111B] to-[#151520] border border-[#2E2942] p-6 sm:p-8 overflow-hidden shadow-xl shadow-[#7863A8]/10">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#B8A4D8]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#7863A8]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-light text-[#B8A4D8] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#B8A4D8]" />
              <span>Sanctuary Keepsake</span>
              <span>·</span>
              <span>JAR OF SMILES</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-light text-[#EAE6F2] tracking-wide">
              Little Joy Jar 🫙✨
            </h1>
            <p className="text-sm font-light text-[#AAA4B8] leading-relaxed">
              A personal, comforting space to save and rediscover your little happy moments, warm smiles, and gentle blessings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#B8A4D8] text-[#08080C] hover:bg-[#c7b6e4] transition-all text-xs font-medium flex items-center gap-2 shadow-lg shadow-[#B8A4D8]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#08080C]" />
              <span>Save a Little Joy</span>
            </button>

            <button
              onClick={handleDrawRandomJoy}
              disabled={joyEntries.length === 0}
              className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#1B1A28] border border-[#3B3654] text-[#EAE6F2] hover:bg-[#232136] transition-all text-xs font-medium flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4 text-[#B8A4D8]" />
              <span>Open My Joy Jar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Animated Jar Showcase Banner */}
      <div className="relative rounded-3xl bg-[#12111B] border border-[#2E2942] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#B8A4D8]/5 via-transparent to-[#7863A8]/5 pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-24 rounded-2xl bg-[#1B1A28]/80 border-2 border-[#B8A4D8]/40 flex flex-col items-center justify-center relative shadow-inner shadow-[#B8A4D8]/20 group hover:border-[#B8A4D8] transition-all cursor-pointer"
               onClick={handleDrawRandomJoy}
               title="Click to open jar">
            {/* Jar lid */}
            <div className="absolute -top-2.5 w-12 h-2.5 rounded-md bg-[#B8A4D8]/60 border border-[#B8A4D8]" />
            <span className="text-2xl animate-bounce">✨</span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs">💖</span>
              <span className="text-xs">🌿</span>
              <span className="text-xs">☀️</span>
            </div>
            <div className="absolute bottom-1.5 text-[10px] text-[#B8A4D8] font-light tracking-wider">
              {joyEntries.length} JOYS
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-normal text-[#EAE6F2]">
              {joyEntries.length === 0 ? 'Your jar is waiting for its first joy' : `${joyEntries.length} happy moments preserved`}
            </h2>
            <p className="text-xs font-light text-[#AAA4B8] max-w-md leading-relaxed">
              Every time something makes you smile — a warm drink, a kind text, a sunset — drop it in. Open the jar anytime you need a gentle lift. 💜
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 z-10">
          <Search className="w-3.5 h-3.5 text-[#AAA4B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved joys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8] focus:outline-none focus:border-[#B8A4D8]"
          />
        </div>
      </div>

      {/* 3. Joy Entries Grid or Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-3xl bg-[#151520] border border-[#262438] space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#1B1A28] border border-[#262438] flex items-center justify-center text-[#B8A4D8] mx-auto shadow-sm">
            <Smile className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-normal text-[#EAE6F2]">No joy notes found</h3>
            <p className="text-xs text-[#AAA4B8] font-light max-w-sm mx-auto">
              Your jar is currently empty. Click "Save a Little Joy" above to write down your first happy moment!
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] transition-colors cursor-pointer"
            >
              Save First Joy
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl bg-[#151520] border border-[#262438] hover:border-[#B8A4D8]/40 transition-all duration-300 p-5 flex flex-col justify-between space-y-4 shadow-sm group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2 rounded-xl bg-[#1B1A28] border border-[#262438]">
                    {entry.emoji}
                  </span>
                  <span className="text-[11px] font-light text-[#AAA4B8]">
                    {entry.date}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-light text-[#EAE6F2] leading-relaxed whitespace-pre-line">
                  {entry.text}
                </p>

                {entry.imageSrc && (
                  <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-[#262438]">
                    <img
                      src={entry.imageSrc}
                      alt="Joy memory"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#262438] flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenEdit(entry)}
                  className="px-3 py-1.5 rounded-lg bg-[#1B1A28] hover:bg-[#232136] text-[#AAA4B8] hover:text-[#EAE6F2] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#B8A4D8]" />
                  <span>Edit</span>
                </button>

                {confirmDeleteId === entry.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        deleteJoyEntry(entry.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-900/60 border border-rose-500/50 text-rose-200 cursor-pointer"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(entry.id)}
                    className="p-1.5 rounded-lg text-[#AAA4B8] hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. "Open My Joy Jar" Random Draw Modal */}
      {isOpenJarModalOpen && drawnJoy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-6 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B8A4D8]" />
                <span className="text-xs uppercase tracking-widest text-[#B8A4D8] font-light">
                  A Random Little Joy
                </span>
              </div>
              <button
                onClick={() => setIsOpenJarModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1B1A28] border border-[#2E2942] flex items-center justify-center text-3xl mx-auto shadow-inner">
                {drawnJoy.emoji}
              </div>

              <span className="text-xs text-[#AAA4B8] font-light block">
                {drawnJoy.date}
              </span>

              <p className="text-sm sm:text-base font-light text-[#EAE6F2] leading-relaxed px-2">
                "{drawnJoy.text}"
              </p>

              {drawnJoy.imageSrc && (
                <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-[#2E2942] max-w-sm mx-auto">
                  <img
                    src={drawnJoy.imageSrc}
                    alt="Joy memory"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-center gap-3">
              <button
                onClick={handleDrawRandomJoy}
                className="px-5 py-2.5 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Draw Another</span>
              </button>
              <button
                onClick={() => setIsOpenJarModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Save a Little Joy Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveNewJoy}
            className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B8A4D8]" />
                <h3 className="text-sm font-normal text-[#EAE6F2]">Save a Little Joy</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Emoji selector */}
              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1.5">Choose an Emoji</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CURATED_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setJoyEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        joyEmoji === em
                          ? 'bg-[#B8A4D8]/20 border-[#B8A4D8] scale-105'
                          : 'bg-[#151520] border-[#262438] hover:bg-[#1B1A28]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Happy Moment / Blessing</label>
                <textarea
                  rows={3}
                  placeholder="What little thing brought a smile to your face today?"
                  value={joyText}
                  onChange={(e) => setJoyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8] focus:outline-none focus:border-[#B8A4D8] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Date</label>
                  <input
                    type="date"
                    value={joyDate}
                    onChange={(e) => setJoyDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Optional Photo</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingPhoto}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#AAA4B8] hover:text-[#EAE6F2] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#B8A4D8]" />
                    <span>{joyImageSrc ? 'Photo Attached ✓' : 'Attach Photo'}</span>
                  </button>
                </div>
              </div>

              {joyImageSrc && (
                <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-[#262438] max-w-xs mx-auto">
                  <img src={joyImageSrc} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setJoyImageSrc(null)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-rose-900 text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] cursor-pointer shadow-sm"
              >
                Drop in Jar ✨
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Edit Joy Modal */}
      {editingJoy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEdit}
            className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <h3 className="text-sm font-normal text-[#EAE6F2]">Edit Joy Entry</h3>
              <button
                type="button"
                onClick={() => setEditingJoy(null)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1.5">Emoji</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CURATED_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEditEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        editEmoji === em
                          ? 'bg-[#B8A4D8]/20 border-[#B8A4D8] scale-105'
                          : 'bg-[#151520] border-[#262438] hover:bg-[#1B1A28]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Happy Moment</label>
                <textarea
                  rows={3}
                  value={editTexs}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Photo</label>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditPhotoSelected}
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#AAA4B8] hover:text-[#EAE6F2] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#B8A4D8]" />
                    <span>{editImageSrc ? 'Change Photo' : 'Add Photo'}</span>
                  </button>
                </div>
              </div>

              {editImageSrc && (
                <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-[#262438] max-w-xs mx-auto">
                  <img src={editImageSrc} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setEditImageSrc(null)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-rose-900 text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingJoy(null)}
                className="px-4 py-2 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
