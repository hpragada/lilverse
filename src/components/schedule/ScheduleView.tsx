import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Check,
  Bell,
  Sparkles,
  AlertCircle,
  X,
  ChevronRight,
  Coffee,
  BookOpen,
  Briefcase,
  Heart,
  Feather,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DayOfWeek, ScheduleItem } from '../../types';

const DAYS_OF_WEEK: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' },
];

const CATEGORIES: {
  id: NonNullable<ScheduleItem['category']>;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'routine', label: 'Routine', color: 'text-sky-300 border-sky-500/30 bg-sky-500/10', icon: Coffee },
  { id: 'wellness', label: 'Wellness', color: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10', icon: Heart },
  { id: 'ritual', label: 'Ritual', color: 'text-pink-300 border-pink-500/30 bg-pink-500/10', icon: Sparkles },
  { id: 'study', label: 'Study', color: 'text-amber-300 border-amber-500/30 bg-amber-500/10', icon: BookOpen },
  { id: 'work', label: 'Work', color: 'text-purple-300 border-purple-500/30 bg-purple-500/10', icon: Briefcase },
  { id: 'personal', label: 'Personal', color: 'text-[#B8A4D8] border-[#B8A4D8]/30 bg-[#B8A4D8]/10', icon: Feather },
];

// Determine today's day of week
function getTodayDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, ...
  const map: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return map[dayIndex] || 'monday';
}

export const ScheduleView: React.FC = () => {
  const {
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleScheduleCompletedToday,
    userProfile,
  } = useApp();

  const todayDay = useMemo(() => getTodayDayOfWeek(), []);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDay);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form Fields
  const [formDay, setFormDay] = useState<DayOfWeek>(todayDay);
  const [formTitle, setFormTitle] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00 AM');
  const [formEndTime, setFormEndTime] = useState('10:00 AM');
  const [formCategory, setFormCategory] = useState<ScheduleItem['category']>('routine');
  const [formNotes, setFormNotes] = useState('');
  const [formHasReminder, setFormHasReminder] = useState(true);
  const [formReminderLead, setFormReminderLead] = useState<number>(10);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deletingItem, setDeletingItem] = useState<ScheduleItem | null>(null);

  // Today's date string for completion check
  const todayDateStr = new Date().toISOString().slice(0, 10);

  // Filter items for selected day, sorted chronologically
  const dayItems = useMemo(() => {
    return schedules
      .filter((s) => s.day === selectedDay)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [schedules, selectedDay]);

  // Counts per day
  const countsByDay = useMemo(() => {
    const counts: Record<DayOfWeek, number> = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };
    schedules.forEach((s) => {
      if (counts[s.day] !== undefined) {
        counts[s.day]++;
      }
    });
    return counts;
  }, [schedules]);

  // Open modal for new entry
  const handleOpenAdd = (dayToSet?: DayOfWeek) => {
    setEditingItem(null);
    setFormDay(dayToSet || selectedDay);
    setFormTitle('');
    setFormStartTime('09:00 AM');
    setFormEndTime('10:00 AM');
    setFormCategory('routine');
    setFormNotes('');
    setFormHasReminder(true);
    setFormReminderLead(10);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormDay(item.day);
    setFormTitle(item.title);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime || '');
    setFormCategory(item.category || 'routine');
    setFormNotes(item.notes || '');
    setFormHasReminder(Boolean(item.hasReminder));
    setFormReminderLead(item.reminderMinutesBefore ?? 10);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save entry
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please provide a title for this schedule entry.');
      return;
    }
    if (!formStartTime.trim()) {
      setFormError('Please enter a start time.');
      return;
    }

    if (editingItem) {
      updateSchedule(editingItem.id, {
        day: formDay,
        title: formTitle.trim(),
        startTime: formStartTime.trim(),
        endTime: formEndTime.trim() || undefined,
        category: formCategory,
        notes: formNotes.trim() || undefined,
        hasReminder: formHasReminder,
        reminderMinutesBefore: formHasReminder ? formReminderLead : undefined,
      });
    } else {
      addSchedule({
        day: formDay,
        title: formTitle.trim(),
        startTime: formStartTime.trim(),
        endTime: formEndTime.trim() || undefined,
        category: formCategory,
        notes: formNotes.trim() || undefined,
        hasReminder: formHasReminder,
        reminderMinutesBefore: formHasReminder ? formReminderLead : undefined,
        completedDates: [],
      });
    }

    setIsModalOpen(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (deletingItem) {
      deleteSchedule(deletingItem.id);
      setDeletingItem(null);
    }
  };

  const completedTodayCount = dayItems.filter((i) =>
    (i.completedDates || []).includes(todayDateStr)
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-7 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-light text-[#AAA4B8] tracking-wider uppercase">
            <span>Rhythm</span>
            <span>·</span>
            <span className="text-[#B8A4D8]">Weekly Schedules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#EAE6F2] tracking-wide mt-1">
            Weekly Schedule & Anchors
          </h1>
          <p className="text-xs sm:text-sm font-light text-[#AAA4B8] mt-1">
            Plan your daily flow from Monday through Sunday with gentle routines, notes, and reminders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View toggle (Day vs Week) */}
          <div className="flex items-center p-1 rounded-xl bg-[#101018] border border-[#262438]">
            <button
              onClick={() => setViewMode('day')}
              title="Daily Focused View"
              className={`px-3 py-1.5 rounded-lg text-xs font-light flex items-center gap-1.5 transition-colors ${
                viewMode === 'day'
                  ? 'bg-[#151520] text-[#EAE6F2] border border-[#3B3654] shadow-sm'
                  : 'text-[#AAA4B8] hover:text-[#EAE6F2]'
              }`}
            >
              <List className="w-3.5 h-3.5 text-[#B8A4D8]" />
              <span className="hidden sm:inline">Day</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              title="Full Week Overview"
              className={`px-3 py-1.5 rounded-lg text-xs font-light flex items-center gap-1.5 transition-colors ${
                viewMode === 'week'
                  ? 'bg-[#151520] text-[#EAE6F2] border border-[#3B3654] shadow-sm'
                  : 'text-[#AAA4B8] hover:text-[#EAE6F2]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#B8A4D8]" />
              <span className="hidden sm:inline">Weekly View</span>
            </button>
          </div>

          {/* Add New Schedule Button */}
          <button
            onClick={() => handleOpenAdd()}
            className="px-4 py-2 rounded-xl bg-[#B8A4D8] hover:bg-[#a792cb] text-[#08080C] text-xs font-medium flex items-center gap-1.5 shadow-md shadow-[#7863A8]/20 transition-all cursor-pointer min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Anchor</span>
          </button>
        </div>
      </div>

      {/* Weekday Selector Bar (Monday - Sunday) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl bg-[#101018] border border-[#262438]">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          const isToday = todayDay === day.id;
          const count = countsByDay[day.id];

          return (
            <button
              key={day.id}
              onClick={() => {
                setSelectedDay(day.id);
                if (viewMode === 'week') setViewMode('day');
              }}
              className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer min-h-[60px] sm:min-h-[70px] ${
                isSelected
                  ? 'bg-[#151520] border-[#3B3654] text-[#EAE6F2] shadow-sm shadow-[#7863A8]/15 scale-[1.02]'
                  : 'bg-[#0E0E14] border-transparent text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#151520]'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-normal tracking-wide">
                  {day.short}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8A4D8]" title="Today" />
                )}
              </div>

              <div className="mt-1 flex items-center gap-1">
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-[#B8A4D8]/20 text-[#B8A4D8]'
                      : 'bg-[#1B1A28] text-[#AAA4B8]'
                  }`}
                >
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* VIEW MODE 1: DAY FOCUSED VIEW */}
      {viewMode === 'day' && (
        <section className="space-y-4">
          {/* Day Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-[#151520] border border-[#262438]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#101018] border border-[#262438] flex items-center justify-center text-[#B8A4D8]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium text-[#EAE6F2] capitalize">
                    {selectedDay}’s Anchors
                  </h2>
                  {selectedDay === todayDay && (
                    <span className="px-2 py-0.5 rounded-full bg-[#B8A4D8]/15 border border-[#B8A4D8]/30 text-[#B8A4D8] text-[10px] font-medium">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-xs font-light text-[#AAA4B8]">
                  {dayItems.length === 0
                    ? 'No routines scheduled for this day yet.'
                    : `${dayItems.length} scheduled ritual${dayItems.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {selectedDay === todayDay && dayItems.length > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-[#AAA4B8] font-light">
                <span>{completedTodayCount} of {dayItems.length} completed today</span>
                <div className="w-20 h-1.5 rounded-full bg-[#101018] border border-[#262438] overflow-hidden">
                  <div
                    className="h-full bg-[#B8A4D8] transition-all duration-300"
                    style={{
                      width: `${dayItems.length > 0 ? (completedTodayCount / dayItems.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* List of Schedule Items for Selected Day */}
          <div className="space-y-2.5">
            {dayItems.map((item) => {
              const isCompletedToday = (item.completedDates || []).includes(todayDateStr);
              const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[0];
              const CategoryIcon = catObj.icon;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompletedToday
                      ? 'bg-[#101018]/80 border-[#222030] text-[#AAA4B8]'
                      : 'bg-[#151520] border-[#262438] text-[#EAE6F2] hover:border-[#3B3654]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Complete toggle & Content */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Checkbox button */}
                      <button
                        onClick={() => toggleScheduleCompletedToday(item.id)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isCompletedToday
                            ? 'bg-[#B8A4D8] border-[#B8A4D8] text-[#08080C]'
                            : 'border-[#3B3654] bg-[#101018] text-transparent hover:border-[#B8A4D8]'
                        }`}
                        title={isCompletedToday ? 'Mark incomplete for today' : 'Mark completed today'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Meta tags: Time, Category, Reminder */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {/* Time */}
                          <div className="flex items-center gap-1 font-mono text-[11px] text-[#B8A4D8] bg-[#101018] px-2 py-0.5 rounded-md border border-[#262438]">
                            <Clock className="w-3 h-3 text-[#B8A4D8]" />
                            <span>{item.startTime}</span>
                            {item.endTime && (
                              <>
                                <span className="text-[#AAA4B8]">–</span>
                                <span>{item.endTime}</span>
                              </>
                            )}
                          </div>

                          {/* Category Tag */}
                          <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border capitalize font-light ${catObj.color}`}>
                            <CategoryIcon className="w-2.5 h-2.5" />
                            <span>{catObj.label}</span>
                          </div>

                          {/* Reminder Indicator */}
                          {item.hasReminder && (
                            <div className="flex items-center gap-1 text-[10px] text-[#B8A4D8] bg-[#B8A4D8]/10 border border-[#B8A4D8]/20 px-2 py-0.5 rounded-md">
                              <Bell className="w-2.5 h-2.5" />
                              <span>{item.reminderMinutesBefore ?? 10}m before</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3
                          className={`text-sm font-normal tracking-wide transition-all ${
                            isCompletedToday ? 'line-through text-[#AAA4B8]' : 'text-[#EAE6F2]'
                          }`}
                        >
                          {item.title}
                        </h3>

                        {/* Notes */}
                        {item.notes && (
                          <p className="text-xs font-light text-[#AAA4B8] leading-relaxed pt-0.5">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-xl text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#101018] transition-colors cursor-pointer"
                        title="Edit schedule entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-2 rounded-xl text-[#AAA4B8] hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer"
                        title="Delete schedule entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state for the day */}
            {dayItems.length === 0 && (
              <div className="py-12 px-4 rounded-2xl bg-[#151520] border border-dashed border-[#262438] text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#101018] border border-[#262438] mx-auto flex items-center justify-center text-[#B8A4D8]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-normal text-[#EAE6F2] capitalize">
                    No scheduled items for {selectedDay}
                  </h3>
                  <p className="text-xs font-light text-[#AAA4B8] mt-1 max-w-sm mx-auto">
                    Enjoy quiet relaxation, or add a gentle daily anchor like morning tea, study flow, or peaceful stretching.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAdd(selectedDay)}
                  className="px-4 py-2 rounded-xl bg-[#101018] hover:bg-[#1B1A28] border border-[#262438] text-xs font-light text-[#B8A4D8] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="capitalize">Add Routine for {selectedDay}</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* VIEW MODE 2: WEEKLY OVERVIEW (ALL 7 DAYS) */}
      {viewMode === 'week' && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const itemsForDay = schedules
                .filter((s) => s.day === day.id)
                .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
              const isToday = todayDay === day.id;

              return (
                <div
                  key={day.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isToday
                      ? 'bg-[#151520] border-[#3B3654] shadow-sm shadow-[#7863A8]/10'
                      : 'bg-[#151520] border-[#262438]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#262438]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#EAE6F2] capitalize">
                        {day.label}
                      </span>
                      {isToday && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#B8A4D8]/20 text-[#B8A4D8] font-medium">
                          Today
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleOpenAdd(day.id)}
                      className="p-1 rounded-lg text-[#AAA4B8] hover:text-[#B8A4D8] hover:bg-[#101018] transition-colors"
                      title={`Add entry for ${day.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {itemsForDay.length > 0 ? (
                    <div className="space-y-2">
                      {itemsForDay.map((item) => {
                        const isDone = (item.completedDates || []).includes(todayDateStr);
                        return (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                              isDone
                                ? 'bg-[#101018] border-[#202026] text-[#AAA4B8]'
                                : 'bg-[#101018] border-[#262438] text-[#EAE6F2]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[11px] font-mono text-[#B8A4D8] shrink-0">
                                {item.startTime}
                              </span>
                              <span className={`truncate font-light ${isDone ? 'line-through text-[#AAA4B8]' : ''}`}>
                                {item.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1 text-[#AAA4B8] hover:text-[#EAE6F2]"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeletingItem(item)}
                                className="p-1 text-[#AAA4B8] hover:text-rose-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] font-light text-[#AAA4B8] italic py-2 text-center">
                      No anchors scheduled.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-[#101018] border border-[#262438] rounded-2xl p-6 space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#262438]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1B1A28] flex items-center justify-center text-[#B8A4D8]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-medium text-[#EAE6F2]">
                  {editingItem ? 'Edit Schedule Anchor' : 'New Schedule Anchor'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#AAA4B8] hover:text-[#EAE6F2] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-3.5">
              {/* Day of Week */}
              <div>
                <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                  Day of Week
                </label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8] capitalize"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#151520] capitalize">
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                  Title & Anchor
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Focus Flow Block, Morning Tea & Stretching"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8]/50 focus:outline-none focus:border-[#B8A4D8]"
                />
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs font-mono text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                    End Time (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="10:30 AM"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs font-mono text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setFormCategory(cat.id)}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-light capitalize flex items-center justify-center gap-1.5 transition-colors ${
                        formCategory === cat.id
                          ? `${cat.color} font-medium`
                          : 'bg-[#151520] border-[#262438] text-[#AAA4B8] hover:text-[#EAE6F2]'
                      }`}
                    >
                      <cat.icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-light text-[#AAA4B8] mb-1">
                  Gentle Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes, intentions, cozy mindset..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8]/50 focus:outline-none focus:border-[#B8A4D8] resize-none"
                />
              </div>

              {/* Reminders Toggle & Lead Time */}
              <div className="p-3 rounded-xl bg-[#151520] border border-[#262438] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-[#B8A4D8]" />
                    <span className="text-xs font-light text-[#EAE6F2]">
                      In-App & Browser Reminder
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormHasReminder(!formHasReminder)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      formHasReminder ? 'bg-[#B8A4D8]' : 'bg-[#262438]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#08080C] transition-transform ${
                        formHasReminder ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {formHasReminder && (
                  <div className="pt-2 border-t border-[#262438] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#AAA4B8] font-light">
                      Remind before start
                    </span>
                    <select
                      value={formReminderLead}
                      onChange={(e) => setFormReminderLead(parseInt(e.target.value, 10))}
                      className="px-2 py-1 rounded-lg bg-[#1B1A28] border border-[#262438] text-[11px] text-[#EAE6F2] focus:outline-none"
                    >
                      <option value={0}>At start time</option>
                      <option value={5}>5 minutes before</option>
                      <option value={10}>10 minutes before</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[#151520] hover:bg-[#1B1A28] border border-[#262438] text-xs text-[#AAA4B8] hover:text-[#EAE6F2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#B8A4D8] hover:bg-[#a792cb] text-[#08080C] font-medium text-xs transition-colors cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Create Anchor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setDeletingItem(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-[#101018] border border-[#262438] rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-medium">Delete Schedule Anchor?</h3>
            </div>
            <p className="text-xs font-light text-[#AAA4B8] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#EAE6F2]">"{deletingItem.title}"</strong> from your {deletingItem.day} schedule? This will sync across your devices.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2 rounded-xl bg-[#151520] hover:bg-[#1B1A28] border border-[#262438] text-xs text-[#AAA4B8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900/80 border border-rose-700/50 text-rose-200 font-medium text-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
