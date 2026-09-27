/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Heart,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Calendar,
  X,
  Edit3,
  Trash2,
  Filter,
  Check,
  Compass,
  MapPin,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  Award,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Dream } from '../../types';

export type WishlistCategory =
  | 'Places to Visit'
  | 'Things to Buy'
  | 'Skills to Learn'
  | 'Experiences'
  | 'Personal Goals'
  | 'Other';

export type WishlistPriority = 'High' | 'Medium' | 'Low';
export type WishlistStatus = 'Want to Do' | 'In Progress' | 'Completed';

const WISHLIST_CATEGORIES: {
  id: WishlistCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'Places to Visit', label: 'Places to Visit', icon: MapPin },
  { id: 'Things to Buy', label: 'Things to Buy', icon: ShoppingBag },
  { id: 'Skills to Learn', label: 'Skills to Learn', icon: GraduationCap },
  { id: 'Experiences', label: 'Experiences', icon: Compass },
  { id: 'Personal Goals', label: 'Personal Goals', icon: Award },
  { id: 'Other', label: 'Other', icon: Sparkles },
];

/**
 * Safely maps existing legacy Dream items into normalized Wishlist items.
 */
function normalizeWishlistItem(dream: Dream): {
  id: string;
  title: string;
  description: string;
  category: WishlistCategory;
  priority: WishlistPriority;
  status: WishlistStatus;
  progressPercent: number;
  targetDate?: string;
  imageUrl?: string;
  rawDream: Dream;
} {
  // Category mapping
  let category: WishlistCategory = 'Other';
  const c = String(dream.category || '').toLowerCase();
  if (c.includes('travel') || c.includes('place')) category = 'Places to Visit';
  else if (c.includes('buy') || c.includes('shopping')) category = 'Things to Buy';
  else if (c.includes('learn') || c.includes('skill')) category = 'Skills to Learn';
  else if (c.includes('experience')) category = 'Experiences';
  else if (c.includes('personal') || c.includes('goal')) category = 'Personal Goals';
  else if (c.includes('career')) category = 'Skills to Learn';

  // Status mapping
  let status: WishlistStatus = 'Want to Do';
  const s = String(dream.status || '').toLowerCase();
  if (s === 'completed') status = 'Completed';
  else if (s === 'in progress') status = 'In Progress';
  else if (dream.progressPercent && dream.progressPercent > 0) status = 'In Progress';

  // Priority mapping
  let priority: WishlistPriority = 'Medium';
  if ((dream as any).priority) {
    priority = (dream as any).priority;
  } else if (dream.pinnedToHome) {
    priority = 'High';
  }

  return {
    id: dream.id,
    title: dream.title || 'Untitled Wishlist Item',
    description: dream.description || '',
    category,
    priority,
    status,
    progressPercent: typeof dream.progressPercent === 'number' ? dream.progressPercent : 0,
    targetDate: dream.targetDate || dream.timeframe,
    imageUrl: dream.coverImage || (dream as any).imageUrl,
    rawDream: dream,
  };
}

export const DreamsView: React.FC = () => {
  const { dreams, addDream, updateDream, deleteDream } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<WishlistCategory>('Places to Visit');
  const [formPriority, setFormPriority] = useState<WishlistPriority>('Medium');
  const [formStatus, setFormStatus] = useState<WishlistStatus>('Want to Do');
  const [formProgress, setFormProgress] = useState<number>(0);
  const [formTargetDate, setFormTargetDate] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Delete Confirm State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Map and filter wishlist items
  const wishlistItems = useMemo(() => {
    return dreams.map(normalizeWishlistItem);
  }, [dreams]);

  const filteredItems = useMemo(() => {
    return wishlistItems.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [wishlistItems, selectedCategory, selectedStatus, searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Places to Visit');
    setFormPriority('Medium');
    setFormStatus('Want to Do');
    setFormProgress(0);
    setFormTargetDate('');
    setFormImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ReturnType<typeof normalizeWishlistItem>) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormCategory(item.category);
    setFormPriority(item.priority);
    setFormStatus(item.status);
    setFormProgress(item.progressPercent);
    setFormTargetDate(item.targetDate || '');
    setFormImageUrl(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingId) {
      updateDream(editingId, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory as any,
        progressPercent: formProgress,
        status: formStatus as any,
        targetDate: formTargetDate.trim() || undefined,
        timeframe: formTargetDate.trim() || 'Someday',
        coverImage: formImageUrl.trim() || undefined,
        ...( { priority: formPriority } as any ),
      });
    } else {
      addDream({
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory as any,
        progressPercent: formProgress,
        status: formStatus as any,
        targetDate: formTargetDate.trim() || undefined,
        timeframe: formTargetDate.trim() || 'Someday',
        coverImage: formImageUrl.trim() || undefined,
        ...( { priority: formPriority } as any ),
      });
    }

    setIsModalOpen(false);
  };

  const handleQuickStatusToggle = (item: ReturnType<typeof normalizeWishlistItem>) => {
    let nextStatus: WishlistStatus = 'In Progress';
    let nextProgress = 50;

    if (item.status === 'Want to Do') {
      nextStatus = 'In Progress';
      nextProgress = 50;
    } else if (item.status === 'In Progress') {
      nextStatus = 'Completed';
      nextProgress = 100;
    } else {
      nextStatus = 'Want to Do';
      nextProgress = 0;
    }

    updateDream(item.id, {
      status: nextStatus as any,
      progressPercent: nextProgress,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300 select-none">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#151520] via-[#12111B] to-[#151520] border border-[#2E2942] p-6 sm:p-8 overflow-hidden shadow-xl shadow-[#7863A8]/10">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#B8A4D8]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#7863A8]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-light text-[#B8A4D8] tracking-wider uppercase">
              <Heart className="w-4 h-4 text-[#B8A4D8]" />
              <span>Personal Desires & Dreams</span>
              <span>·</span>
              <span>MY LITTLE WISHLIST</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-light text-[#EAE6F2] tracking-wide">
              My Little Wishlist ✨
            </h1>
            <p className="text-sm font-light text-[#AAA4B8] leading-relaxed">
              A gentle space to collect places to visit, things to buy, skills to learn, and personal goals. Nurture your aspirations at your own peaceful pace.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="min-h-[42px] px-5 py-2.5 rounded-2xl bg-[#B8A4D8] text-[#08080C] hover:bg-[#c7b6e4] transition-all text-xs font-medium flex items-center gap-2 shadow-lg shadow-[#B8A4D8]/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#08080C]" />
            <span>Add Wishlist Goal</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#AAA4B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search wishlist items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8] focus:outline-none focus:border-[#B8A4D8]"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#151520] border border-[#262438] rounded-xl px-3 py-2 text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8] cursor-pointer"
          >
            <option value="All">All Categories</option>
            {WISHLIST_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status Filter buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['All', 'Want to Do', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-light transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-[#B8A4D8] text-[#08080C] font-medium'
                    : 'bg-[#151520] text-[#AAA4B8] hover:text-[#EAE6F2] border border-[#262438]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Wishlist Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-3xl bg-[#12111B] border border-[#2E2942] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1B1A28] border border-[#2E2942] flex items-center justify-center text-[#B8A4D8] mx-auto">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-normal text-[#EAE6F2]">No wishlist goals found</h3>
          <p className="text-xs text-[#AAA4B8] font-light max-w-sm mx-auto">
            There are no items matching your current filter. Click "Add Wishlist Goal" above to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const CatIcon =
              WISHLIST_CATEGORIES.find((c) => c.id === item.category)?.icon || Sparkles;

            const isCompleted = item.status === 'Completed';

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-[#12111B] border border-[#2E2942] hover:border-[#3B3654] transition-all duration-300 space-y-4 shadow-lg flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Optional Image */}
                  {item.imageUrl && (
                    <div className="w-full h-36 rounded-2xl overflow-hidden bg-[#1A1828]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Top Bar: Category & Priority */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-[#1B1A28] border border-[#262438] text-[#B8A4D8] flex items-center gap-1.5 text-[11px] font-light">
                      <CatIcon className="w-3 h-3 text-[#B8A4D8]" />
                      <span>{item.category}</span>
                    </span>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-light ${
                        item.priority === 'High'
                          ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                          : item.priority === 'Medium'
                          ? 'bg-[#B8A4D8]/15 border-[#B8A4D8]/40 text-[#B8A4D8]'
                          : 'bg-[#151520] border-[#262438] text-[#AAA4B8]'
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3
                      className={`text-base font-normal tracking-wide ${
                        isCompleted
                          ? 'text-[#AAA4B8] line-through'
                          : 'text-[#EAE6F2]'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-[#AAA4B8] font-light line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#262438]">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#AAA4B8] font-light">
                      <span>Progress</span>
                      <span>{item.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1A1828] overflow-hidden">
                      <div
                        className="h-full bg-[#B8A4D8] transition-all duration-300"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Target Date & Actions */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-[#AAA4B8] text-[11px] font-light">
                      <Calendar className="w-3 h-3 text-[#B8A4D8]" />
                      <span>{item.targetDate || 'No target date'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Status Toggle Button */}
                      <button
                        onClick={() => handleQuickStatusToggle(item)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-light border cursor-pointer transition-colors ${
                          isCompleted
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                            : item.status === 'In Progress'
                            ? 'bg-[#B8A4D8]/20 border-[#B8A4D8]/50 text-[#EAE6F2]'
                            : 'bg-[#151520] border-[#262438] text-[#AAA4B8]'
                        }`}
                      >
                        {item.status}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#1B1A28] cursor-pointer"
                        title="Edit goal"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#B8A4D8]" />
                      </button>

                      {/* Delete Button */}
                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              deleteDream(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-rose-900 text-rose-200 text-[10px] cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[10px] text-[#AAA4B8] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 rounded-lg text-[#AAA4B8] hover:text-rose-400 hover:bg-[#1B1A28] cursor-pointer"
                          title="Delete goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveForm}
            className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#B8A4D8]" />
                <h3 className="text-sm font-normal text-[#EAE6F2]">
                  {editingId ? 'Edit Wishlist Goal' : 'Add Wishlist Goal'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Travel to Kyoto, Learn Piano..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Why is this meaningful to you?"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as WishlistCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  >
                    {WISHLIST_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as WishlistPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as WishlistStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  >
                    <option value="Want to Do">Want to Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formProgress}
                    onChange={(e) => setFormProgress(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Target Date / Season</label>
                <input
                  type="text"
                  placeholder="e.g. Autumn 2026, Dec 2026..."
                  value={formTargetDate}
                  onChange={(e) => setFormTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Optional Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] cursor-pointer shadow-sm"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
