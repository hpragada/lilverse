/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Calendar,
  Heart,
  Plus,
  BookOpen,
  Image as ImageIcon,
  Compass,
  Smile,
  ArrowRight,
  Clock,
  X,
  GraduationCap,
  Briefcase,
  Plane,
  Check,
  CalendarClock,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Task,
  CalendarEvent,
  Dream,
  Memory,
  ScheduleItem,
  MoodType,
  DreamCategory,
} from '../../types';
import { MOOD_OPTIONS } from '../../data/initialData';

export const LifeDashboardView: React.FC = () => {
  const {
    userProfile,
    setMood,
    tasks,
    toggleTask,
    addTask,
    events,
    addEvent,
    toggleEventCompleted,
    schedules,
    dreams,
    addDream,
    toggleDreamCompleted,
    memories,
    setActiveTab,
  } = useApp();

  // Quick Action Modal States
  const [modalType, setModalType] = useState<
    'task' | 'event' | 'wishlist' | 'learning' | null
  >(null);

  // Form Fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<Task['category']>('focus');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [eventCategory, setEventCategory] = useState<CalendarEvent['type']>('personal');

  const [wishlistTitle, setWishlistTitle] = useState('');
  const [wishlistCategory, setWishlistCategory] = useState<DreamCategory>('Personal');
  const [wishlistTimeframe, setWishlistTimeframe] = useState('This Year');

  const [learningTitle, setLearningTitle] = useState('');
  const [learningNotes, setLearningNotes] = useState('');
  const [learningTimeframe, setLearningTimeframe] = useState('This Season');

  // Greeting based on current time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = userProfile.name || 'Friend';
    if (hour < 12) return `Good morning, ${name} ☕`;
    if (hour < 17) return `Good afternoon, ${name} 🌿`;
    return `Good evening, ${name} 🌙`;
  }, [userProfile.name]);

  // Today's formatted date
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Today's task metrics
  const completedTasksCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );
  const taskProgressPercent = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasksCount / tasks.length) * 100);
  }, [tasks, completedTasksCount]);

  // Upcoming Events & Schedules
  const todayDateStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.date >= todayDateStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [events, todayDateStr]);

  // Wishlist Items (Non-Learning Dreams)
  const wishlistItems = useMemo(() => {
    return dreams
      .filter((d) => d.category !== 'Learning' && d.category !== 'Career')
      .slice(0, 4);
  }, [dreams]);

  // Learning Hub Items (Learning & Career Dreams)
  const learningItems = useMemo(() => {
    return dreams
      .filter((d) => d.category === 'Learning' || d.category === 'Career')
      .slice(0, 4);
  }, [dreams]);

  // Recent Memories
  const recentMemories = useMemo(() => {
    return memories.slice(0, 3);
  }, [memories]);

  // Quick Action Handlers
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask(taskTitle.trim(), taskCategory);
    setTaskTitle('');
    setModalType(null);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    addEvent({
      title: eventTitle.trim(),
      date: eventDate,
      time: eventTime,
      type: eventCategory,
      category: eventCategory,
    });
    setEventTitle('');
    setModalType(null);
  };

  const handleSaveWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlistTitle.trim()) return;
    addDream({
      title: wishlistTitle.trim(),
      category: wishlistCategory,
      description: 'Nurtured in My Little Wishlist.',
      progressPercent: 20,
      timeframe: wishlistTimeframe,
      status: 'In Progress',
    });
    setWishlistTitle('');
    setModalType(null);
  };

  const handleSaveLearning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningTitle.trim()) return;
    addDream({
      title: learningTitle.trim(),
      category: 'Learning',
      description: learningNotes.trim() || 'Active learning path & skill cultivation.',
      progressPercent: 15,
      timeframe: learningTimeframe,
      status: 'In Progress',
    });
    setLearningTitle('');
    setLearningNotes('');
    setModalType(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300 select-none">
      {/* 1. Header & Greeting Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#151520] via-[#12111B] to-[#151520] border border-[#2E2942] p-6 sm:p-8 overflow-hidden shadow-xl shadow-[#7863A8]/10">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#B8A4D8]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#7863A8]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-light text-[#B8A4D8] tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-[#B8A4D8]" />
              <span>Personal Sanctuary</span>
              <span>·</span>
              <span>{todayFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-light text-[#EAE6F2] tracking-wide">
              {greeting}
            </h1>
            <p className="text-sm font-light text-[#AAA4B8] leading-relaxed">
              Here is your living overview — tasks, events, wishlist goals, learning paths, and sweet memories gathered in one peaceful place.
            </p>
          </div>

          {/* Current Mood Selector Badge */}
          <div className="p-4 rounded-2xl bg-[#1B1A28]/80 border border-[#2E2942] shrink-0 space-y-2">
            <div className="text-[11px] text-[#AAA4B8] font-light uppercase tracking-wider">
              Today's Feeling
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {MOOD_OPTIONS.map((m) => {
                const isSelected = userProfile.currentMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    title={`${m.label}: ${m.description}`}
                    className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#B8A4D8] text-[#08080C] font-medium shadow-sm'
                        : 'bg-[#151520] text-[#AAA4B8] hover:text-[#EAE6F2] border border-[#262438]'
                    }`}
                  >
                    <span>{m.symbol}</span>
                    <span className="capitalize">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#12111B] border border-[#2E2942] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#AAA4B8] font-light">
          <Plus className="w-4 h-4 text-[#B8A4D8]" />
          <span>Quick Add to Your Sanctuary:</span>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <button
            onClick={() => setModalType('task')}
            className="px-3.5 py-2 rounded-2xl bg-[#1B1A28] hover:bg-[#232136] border border-[#2E2942] text-xs font-light text-[#EAE6F2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#B8A4D8]" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => setModalType('event')}
            className="px-3.5 py-2 rounded-2xl bg-[#1B1A28] hover:bg-[#232136] border border-[#2E2942] text-xs font-light text-[#EAE6F2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#B8A4D8]" />
            <span>Add Event</span>
          </button>

          <button
            onClick={() => setModalType('wishlist')}
            className="px-3.5 py-2 rounded-2xl bg-[#1B1A28] hover:bg-[#232136] border border-[#2E2942] text-xs font-light text-[#EAE6F2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-[#B8A4D8]" />
            <span>Add Wishlist Goal</span>
          </button>

          <button
            onClick={() => setModalType('learning')}
            className="px-3.5 py-2 rounded-2xl bg-[#1B1A28] hover:bg-[#232136] border border-[#2E2942] text-xs font-light text-[#EAE6F2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#B8A4D8]" />
            <span>Add Course / Learning</span>
          </button>
        </div>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* SECTION A: TODAY'S TASKS */}
        <div className="p-6 rounded-3xl bg-[#12111B] border border-[#2E2942] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262438]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B8A4D8]" />
              <h2 className="text-base font-normal text-[#EAE6F2]">Today's Tasks</h2>
              <span className="text-xs text-[#AAA4B8] font-light">
                ({completedTasksCount}/{tasks.length})
              </span>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="text-xs text-[#B8A4D8] hover:underline font-light flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Progress Bar */}
          {tasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-[#1A1828] overflow-hidden">
                <div
                  className="h-full bg-[#B8A4D8] transition-all duration-500"
                  style={{ width: `${taskProgressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-[#AAA4B8] font-light text-right">
                {taskProgressPercent}% Completed
              </div>
            </div>
          )}

          {/* Task Items */}
          {tasks.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-[#AAA4B8]">
              <p className="text-xs font-light">No active tasks for today.</p>
              <button
                onClick={() => setModalType('task')}
                className="text-xs text-[#B8A4D8] underline hover:text-[#c7b6e4] cursor-pointer"
              >
                + Add a gentle task
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-[#151520]/40 border-[#262438] text-[#AAA4B8] line-through'
                      : 'bg-[#151520] border-[#262438] text-[#EAE6F2] hover:border-[#3B3654]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#B8A4D8] shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#AAA4B8] shrink-0" />
                    )}
                    <span className="text-xs font-normal">{task.title}</span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B1A28] border border-[#2E2942] text-[#AAA4B8] capitalize">
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION B: UPCOMING EVENTS & SCHEDULE */}
        <div className="p-6 rounded-3xl bg-[#12111B] border border-[#2E2942] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262438]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B8A4D8]" />
              <h2 className="text-base font-normal text-[#EAE6F2]">Upcoming Events</h2>
            </div>

            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-[#B8A4D8] hover:underline font-light flex items-center gap-1 cursor-pointer"
            >
              <span>View Calendar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-[#AAA4B8]">
              <p className="text-xs font-light">No upcoming events on your calendar.</p>
              <button
                onClick={() => setModalType('event')}
                className="text-xs text-[#B8A4D8] underline hover:text-[#c7b6e4] cursor-pointer"
              >
                + Schedule an event
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setActiveTab('calendar')}
                  className="p-3 rounded-2xl bg-[#151520] border border-[#262438] hover:border-[#3B3654] transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-normal text-[#EAE6F2]">{evt.title}</div>
                    <div className="text-[10px] text-[#AAA4B8] font-light flex items-center gap-2">
                      <span>{evt.date}</span>
                      <span>·</span>
                      <span>{evt.time}</span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B1A28] border border-[#2E2942] text-[#B8A4D8] capitalize shrink-0">
                    {evt.type || 'ritual'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION C: WISHLIST GOALS & PROGRESS */}
        <div className="p-6 rounded-3xl bg-[#12111B] border border-[#2E2942] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262438]">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#B8A4D8]" />
              <h2 className="text-base font-normal text-[#EAE6F2]">My Wishlist Goals</h2>
            </div>

            <button
              onClick={() => setActiveTab('dreams')}
              className="text-xs text-[#B8A4D8] hover:underline font-light flex items-center gap-1 cursor-pointer"
            >
              <span>View Wishlist</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-[#AAA4B8]">
              <p className="text-xs font-light">No goals in your wishlist yet.</p>
              <button
                onClick={() => setModalType('wishlist')}
                className="text-xs text-[#B8A4D8] underline hover:text-[#c7b6e4] cursor-pointer"
              >
                + Add a wishlist goal
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {wishlistItems.map((dream) => (
                <div
                  key={dream.id}
                  onClick={() => setActiveTab('dreams')}
                  className="p-3.5 rounded-2xl bg-[#151520] border border-[#262438] hover:border-[#3B3654] transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-normal text-[#EAE6F2]">{dream.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B1A28] text-[#B8A4D8]">
                      {dream.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#1A1828] overflow-hidden">
                    <div
                      className="h-full bg-[#B8A4D8]"
                      style={{ width: `${dream.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#AAA4B8] font-light">
                    <span>{dream.category}</span>
                    <span>Target: {dream.timeframe}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION D: LEARNING HUB & COURSES */}
        <div className="p-6 rounded-3xl bg-[#12111B] border border-[#2E2942] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262438]">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#B8A4D8]" />
              <h2 className="text-base font-normal text-[#EAE6F2]">Learning Hub & Courses</h2>
            </div>

            <button
              onClick={() => setActiveTab('career')}
              className="text-xs text-[#B8A4D8] hover:underline font-light flex items-center gap-1 cursor-pointer"
            >
              <span>View Learning Hub</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {learningItems.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-[#AAA4B8]">
              <p className="text-xs font-light">No active courses or learning goals yet.</p>
              <button
                onClick={() => setModalType('learning')}
                className="text-xs text-[#B8A4D8] underline hover:text-[#c7b6e4] cursor-pointer"
              >
                + Add a learning path
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {learningItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveTab('career')}
                  className="p-3.5 rounded-2xl bg-[#151520] border border-[#262438] hover:border-[#3B3654] transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-normal text-[#EAE6F2]">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                      In Flow
                    </span>
                  </div>

                  <p className="text-[11px] text-[#AAA4B8] font-light line-clamp-1">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#AAA4B8] font-light">
                    <span>{item.category}</span>
                    <span>Pace: {item.timeframe}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION E: RECENT MEMORIES */}
      <div className="p-6 rounded-3xl bg-[#12111B] border border-[#2E2942] shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#262438]">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#B8A4D8]" />
            <h2 className="text-base font-normal text-[#EAE6F2]">Recent Moments & Memories</h2>
          </div>

          <button
            onClick={() => setActiveTab('memories')}
            className="text-xs text-[#B8A4D8] hover:underline font-light flex items-center gap-1 cursor-pointer"
          >
            <span>View All Moments</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentMemories.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-[#AAA4B8]">
            <p className="text-xs font-light">No photo memories added yet.</p>
            <button
              onClick={() => setActiveTab('memories')}
              className="text-xs text-[#B8A4D8] underline hover:text-[#c7b6e4] cursor-pointer"
            >
              + Upload a memory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentMemories.map((mem) => (
              <div
                key={mem.id}
                onClick={() => setActiveTab('memories')}
                className="p-3 rounded-2xl bg-[#151520] border border-[#262438] hover:border-[#3B3654] transition-all cursor-pointer space-y-2 group"
              >
                {mem.imageSrc ? (
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-[#1A1828]">
                    <img
                      src={mem.imageSrc}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-xl bg-[#1B1A28] flex items-center justify-center text-[#B8A4D8]">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <div className="text-xs font-normal text-[#EAE6F2] truncate">{mem.title}</div>
                  <div className="text-[10px] text-[#AAA4B8] font-light flex items-center justify-between mt-0.5">
                    <span>{mem.date}</span>
                    {mem.location && <span>📍 {mem.location}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK ACTION MODALS */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <h3 className="text-sm font-normal text-[#EAE6F2] capitalize">
                Quick Add {modalType}
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TASK FORM */}
            {modalType === 'task' && (
              <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Task Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Read 20 pages, Watering plants..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as Task['category'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  >
                    <option value="focus">Focus</option>
                    <option value="gentle">Gentle</option>
                    <option value="ritual">Ritual</option>
                    <option value="rest">Rest</option>
                  </select>
                </div>
                <div className="pt-3 border-t border-[#2E2942] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-[#1B1A28] text-[#EAE6F2] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] font-medium cursor-pointer"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            )}

            {/* EVENT FORM */}
            {modalType === 'event' && (
              <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Afternoon tea, Design review..."
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#AAA4B8] block mb-1">Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#AAA4B8] block mb-1">Time</label>
                    <input
                      type="text"
                      placeholder="10:00 AM"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-[#2E2942] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-[#1B1A28] text-[#EAE6F2] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] font-medium cursor-pointer"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            )}

            {/* WISHLIST FORM */}
            {modalType === 'wishlist' && (
              <form onSubmit={handleSaveWishlist} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Wishlist Goal</label>
                  <input
                    type="text"
                    placeholder="e.g. Learn pottery, Travel to Kyoto..."
                    value={wishlistTitle}
                    onChange={(e) => setWishlistTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#AAA4B8] block mb-1">Category</label>
                    <select
                      value={wishlistCategory}
                      onChange={(e) => setWishlistCategory(e.target.value as DreamCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Travel">Travel</option>
                      <option value="Experiences">Experiences</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#AAA4B8] block mb-1">Timeframe</label>
                    <input
                      type="text"
                      value={wishlistTimeframe}
                      onChange={(e) => setWishlistTimeframe(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-[#2E2942] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-[#1B1A28] text-[#EAE6F2] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] font-medium cursor-pointer"
                  >
                    Save Wishlist Goal
                  </button>
                </div>
              </form>
            )}

            {/* LEARNING FORM */}
            {modalType === 'learning' && (
              <form onSubmit={handleSaveLearning} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Course / Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Master Typography & Design Systems..."
                    value={learningTitle}
                    onChange={(e) => setLearningTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#AAA4B8] block mb-1">Focus Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Studying layout math, color harmony..."
                    value={learningNotes}
                    onChange={(e) => setLearningNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  />
                </div>
                <div className="pt-3 border-t border-[#2E2942] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl bg-[#1B1A28] text-[#EAE6F2] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] font-medium cursor-pointer"
                  >
                    Save Learning Path
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
