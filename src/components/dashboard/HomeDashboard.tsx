import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Check,
  Plus,
  Trash2,
  Moon,
  ArrowRight,
  Mail,
  Lock,
  Bell,
  CalendarClock,
  Clock,
  Heart,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOOD_OPTIONS } from '../../data/initialData';
import { CalendarEvent, DayOfWeek, ScheduleItem } from '../../types';
import { RomanticGreetingBanner } from './RomanticGreetingBanner';
import { FocusTimer } from './FocusTimer';
import { ReminderAlertsWidget } from '../calendar/ReminderAlertsWidget';
import { EditReminderModal } from '../calendar/EditReminderModal';
import { CompletionCelebration } from '../common/CompletionCelebration';
import { notificationService } from '../../services/notificationService';

function getTodayDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay();
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

const CATEGORY_COLORS: Record<string, string> = {
  routine: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
  wellness: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  ritual: 'text-pink-300 border-pink-500/30 bg-pink-500/10',
  study: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  work: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
  personal: 'text-[#B8A4D8] border-[#B8A4D8]/30 bg-[#B8A4D8]/10',
};

export const HomeDashboard: React.FC = () => {
  const {
    userProfile,
    toggleLowEnergyMode,
    setMood,
    tasks,
    events,
    schedules,
    toggleScheduleCompletedToday,
    addTask,
    toggleTask,
    deleteTask,
    dreams,
    futureLetters,
    setActiveTab,
  } = useApp();

  const [newTaskInput, setNewTaskInput] = useState('');
  const [reminderModalEvent, setReminderModalEvent] = useState<CalendarEvent | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Background check for scheduled reminders (tasks, calendar events, sweet notes)
  useEffect(() => {
    notificationService.checkScheduledReminders(tasks, events);
    const interval = setInterval(() => {
      notificationService.checkScheduledReminders(tasks, events);
    }, 30000);
    return () => clearInterval(interval);
  }, [tasks, events]);

  // Format today's date dynamically
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const todayDateStr = today.toISOString().slice(0, 10);
  const todayDay = useMemo(() => getTodayDayOfWeek(), []);

  // Filter today's schedule items, sorted by time
  const todaySchedules = useMemo(() => {
    return schedules
      .filter((s) => s.day === todayDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, todayDay]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentMoodObj = MOOD_OPTIONS.find((m) => m.id === userProfile.currentMood) || MOOD_OPTIONS[0];

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    addTask(newTaskInput.trim());
    setNewTaskInput('');
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-9 space-y-6 sm:space-y-7 animate-in fade-in duration-300">
      {/* Floating Animated Emojis Decoration Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <span className="absolute top-[8%] left-[2%] text-lg opacity-70 animate-float-drift-1">
          💗
        </span>
        <span className="absolute top-[18%] right-[1%] text-lg opacity-75 animate-float-drift-2">
          ✨
        </span>
        <span className="absolute top-[45%] left-[1%] text-xl opacity-60 animate-float-drift-2">
          🎀
        </span>
        <span className="absolute top-[65%] right-[2%] text-lg opacity-75 animate-float-drift-1">
          🦋
        </span>
        <span className="absolute top-[85%] left-[3%] text-lg opacity-70 animate-float-drift-1">
          🌸
        </span>
        <span className="absolute top-[92%] right-[3%] text-lg opacity-70 animate-float-drift-2">
          ⭐
        </span>
      </div>

      {/* Completion Burst Overlay */}
      <CompletionCelebration
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
      {/* 1. Greeting Banner with Animated Cute Emojis */}
      <RomanticGreetingBanner />

      {/* 2. Upcoming Reminders & Active Alerts */}
      <ReminderAlertsWidget
        title="Upcoming & Active Reminders"
        subtitle="Today's celebrations, appointments, tasks & gentle alerts"
      />

      {/* 3. Compact Today's Schedule Preview */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[#151520] border border-[#262438] shadow-lg backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262438]">
          <div>
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-[#B8A4D8]" />
              <h2 className="text-sm font-medium text-[#EAE6F2] tracking-wide">
                Today’s Schedule Preview
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1B1A28] border border-[#302B45] text-[#B8A4D8] capitalize">
                {todayDay}
              </span>
            </div>
            <p className="text-xs font-light text-[#AAA4B8] mt-0.5">
              {formattedDate} · Planned routines & rhythm anchors for today
            </p>
          </div>

          <button
            onClick={() => setActiveTab('schedule')}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1B1A28] hover:bg-[#222133] border border-[#302B45] hover:border-[#B8A4D8]/40 text-[#EAE6F2] hover:text-[#B8A4D8] text-xs font-light transition-all cursor-pointer group"
          >
            <span>View Full Schedule</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#B8A4D8]" />
          </button>
        </div>

        {/* Schedule List Preview */}
        <div className="space-y-2">
          {todaySchedules.length > 0 ? (
            todaySchedules.slice(0, 4).map((item) => {
              const isCompletedToday = (item.completedDates || []).includes(todayDateStr);
              const badgeClass = item.category
                ? CATEGORY_COLORS[item.category] || CATEGORY_COLORS.personal
                : CATEGORY_COLORS.personal;

              return (
                <div
                  key={item.id}
                  className={`min-h-[50px] px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    isCompletedToday
                      ? 'bg-[#101018]/60 border-[#262438] text-[#AAA4B8]'
                      : 'bg-[#101018] border-[#262438] hover:border-[#3B3654] text-[#EAE6F2]'
                  }`}
                >
                  <button
                    onClick={() => toggleScheduleCompletedToday(item.id)}
                    className="flex items-center gap-3 text-left flex-1 min-h-[44px] cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                        isCompletedToday
                          ? 'bg-[#B8A4D8] border-[#B8A4D8] text-[#08080C]'
                          : 'border-[#302B45] bg-[#151520] text-transparent hover:border-[#B8A4D8]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-normal transition-all ${
                            isCompletedToday ? 'line-through text-[#AAA4B8]' : 'text-[#EAE6F2]'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.category && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border capitalize font-light ${badgeClass}`}
                          >
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#AAA4B8] font-light mt-0.5">
                        <Clock className="w-3 h-3 text-[#B8A4D8]" />
                        <span>
                          {item.startTime}
                          {item.endTime ? ` – ${item.endTime}` : ''}
                        </span>
                        {item.notes && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[200px] text-[#868096]">
                              {item.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="text-xs text-[#AAA4B8] hover:text-[#B8A4D8] font-light px-2 py-1 transition-colors shrink-0 cursor-pointer"
                    title="Edit in full schedule view"
                  >
                    Details
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs font-light text-[#AAA4B8] space-y-1">
              <p>No rhythm anchors set for today ({todayDay}).</p>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-[#B8A4D8] hover:underline text-xs cursor-pointer"
              >
                + Add anchors in the Schedule page
              </button>
            </div>
          )}

          {todaySchedules.length > 4 && (
            <div className="pt-1 text-center">
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs text-[#B8A4D8] hover:underline font-light cursor-pointer"
              >
                +{todaySchedules.length - 4} more anchors scheduled for today. View full schedule →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Compact Focus Sanctuary Timer */}
      <FocusTimer compact={true} />

      {/* 5. Daily Intentions / Tasks */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[#151520] border border-[#262438] shadow-lg backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#262438]">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#B8A4D8]" />
              <h2 className="text-sm font-normal text-[#EAE6F2] tracking-wide">
                {userProfile.lowEnergyMode
                  ? 'Gentle Daily Intentions'
                  : 'Today’s Intentions & Tasks'}
              </h2>
            </div>
            <p className="text-xs font-light text-[#AAA4B8] mt-0.5">
              {userProfile.lowEnergyMode
                ? 'Only tiny, nourishing things. Zero pressure.'
                : 'Small tasks and personal intentions to honor your day.'}
            </p>
          </div>

          {!userProfile.lowEnergyMode && totalCount > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto text-right">
              <span className="text-xs font-light text-[#B8A4D8] tabular-nums">
                {completedCount} of {totalCount} completed
              </span>
              <div className="w-20 h-2 rounded-full bg-[#101018] border border-[#262438] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#B8A4D8] to-[#9680C8] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-2 pt-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`min-h-[48px] px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                task.completed
                  ? 'bg-[#101018]/70 border-[#262438] text-[#AAA4B8]'
                  : 'bg-[#101018] border-[#262438] text-[#EAE6F2] hover:border-[#3B3654]'
              }`}
            >
              <button
                onClick={() => {
                  if (!task.completed) setShowCelebration(true);
                  toggleTask(task.id);
                }}
                className="flex items-center gap-3 text-left flex-1 min-h-[44px] cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                    task.completed
                      ? 'bg-[#B8A4D8] border-[#B8A4D8] text-[#08080C]'
                      : 'border-[#302B45] bg-[#151520] text-transparent hover:border-[#B8A4D8]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-light transition-all ${
                      task.completed ? 'line-through text-[#AAA4B8]' : 'text-[#EAE6F2]'
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.category && (
                    <span className="text-[10px] text-[#AAA4B8] capitalize font-light">
                      {task.category}
                    </span>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReminderModalEvent({
                      id: '',
                      title: task.title,
                      category: 'task',
                      type: 'task',
                      date: new Date().toISOString().split('T')[0],
                      time: '10:00 AM',
                      repeat: 'none',
                      notes: `Gentle reminder for: ${task.title}`,
                    });
                  }}
                  aria-label="Set reminder for task"
                  title="Create reminder for this intention"
                  className="min-h-[40px] px-2.5 text-[#AAA4B8] hover:text-[#B8A4D8] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-[#B8A4D8]" />
                  <span className="text-[11px] hidden sm:inline font-light">Remind</span>
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  aria-label="Remove intention"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#AAA4B8] hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="py-4 text-center text-xs font-light text-[#AAA4B8] space-y-1">
              <p>No intentions scheduled right now.</p>
            </div>
          )}
        </div>

        {/* Inline Add Task Input */}
        <form onSubmit={handleAddTaskSubmit} className="pt-2 flex items-center gap-2">
          <input
            type="text"
            placeholder={
              userProfile.lowEnergyMode
                ? 'Add a gentle anchor...'
                : 'Add a new intention for today...'
            }
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-2xl bg-[#101018] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8]/60 focus:outline-none focus:border-[#B8A4D8]/60 font-light"
          />
          <button
            type="submit"
            disabled={!newTaskInput.trim()}
            className="min-h-[44px] px-4 rounded-2xl bg-[#1B1A28] hover:bg-[#222133] border border-[#302B45] text-xs font-light text-[#EAE6F2] hover:text-[#B8A4D8] transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#B8A4D8]" />
            <span>Add</span>
          </button>
        </form>
      </section>

      {/* 6. Daily Mood Check-In & Sanctuary Controls */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[#151520] border border-[#262438] shadow-lg backdrop-blur-md space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-[#262438]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-light text-[#B8A4D8] uppercase tracking-wider">
              Daily Check-in
            </span>
            <span className="text-[#AAA4B8]">·</span>
            <span className="text-xs font-light text-[#EAE6F2]">
              How does your heart feel today?
            </span>
          </div>
          <span className="text-xs text-[#B8A4D8] font-light hidden sm:inline">
            Currently: {currentMoodObj.label}
          </span>
        </div>

        {/* Mood Options Carousel */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = userProfile.currentMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => setMood(mood.id)}
                className={`min-h-[48px] p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B1A28] border-[#B8A4D8]/60 text-[#EAE6F2] shadow-sm shadow-[#7863A8]/20 scale-102'
                    : 'bg-[#101018] border-[#262438] text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#151520]'
                }`}
              >
                <span
                  className={`text-base leading-none mb-1 transition-colors ${
                    isSelected ? 'text-[#B8A4D8]' : 'text-[#AAA4B8]'
                  }`}
                >
                  {mood.symbol}
                </span>
                <span className="text-[11px] font-light tracking-tight truncate max-w-full">
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs font-light text-[#AAA4B8]">
          <p>{currentMoodObj.description}</p>
          <button
            onClick={toggleLowEnergyMode}
            className={`min-h-[34px] px-3 rounded-full border text-xs font-light flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer ${
              userProfile.lowEnergyMode
                ? 'bg-[#B8A4D8]/20 border-[#B8A4D8]/50 text-[#B8A4D8]'
                : 'bg-[#101018] border-[#262438] text-[#AAA4B8] hover:text-[#B8A4D8]'
            }`}
          >
            <Moon className="w-3 h-3 text-[#B8A4D8]" />
            <span>
              {userProfile.lowEnergyMode ? 'Low Energy Mode Active' : 'Gentle Mode'}
            </span>
          </button>
        </div>
      </section>

      {/* Gentle Affirmation Footnote */}
      <footer className="pt-2 pb-6 text-center">
        <p className="text-xs font-light text-[#B8A4D8]/70 italic tracking-wide">
          “May your quiet hours be gentle, and your sleep peaceful tonight.”
        </p>
      </footer>

      {/* Task Reminder Setup Modal */}
      {reminderModalEvent && (
        <EditReminderModal
          event={reminderModalEvent}
          onClose={() => setReminderModalEvent(null)}
        />
      )}
    </div>
  );
};

