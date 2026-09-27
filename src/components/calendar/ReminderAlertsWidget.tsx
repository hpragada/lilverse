import React, { useState } from 'react';
import {
  Bell,
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Repeat,
  Heart,
  Calendar as CalendarIcon,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent } from '../../types';
import {
  isEventDueToday,
  getCuteReminderMessage,
} from '../../services/notificationService';
import { EditReminderModal } from './EditReminderModal';

interface ReminderAlertsWidgetProps {
  filterDate?: string; // Optional: specific date (e.g. in Calendar view). Defaults to today's active & repeating events
  title?: string;
  subtitle?: string;
  showAddButton?: boolean;
}

export const ReminderAlertsWidget: React.FC<ReminderAlertsWidgetProps> = ({
  filterDate,
  title = 'Sanctuary Reminders & Rituals',
  subtitle = 'Birthdays, appointments, gentle tasks & important dates',
  showAddButton = true,
}) => {
  const { events, deleteEvent, snoozeEvent, toggleEventCompleted } = useApp();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const targetDateStr = filterDate || todayStr;
  const targetDateObj = new Date(`${targetDateStr}T00:00:00`);

  // Filter events:
  // If filterDate is provided, check if event is scheduled for that date (or repeats on it).
  // Otherwise, show today's events plus any active snoozed reminders.
  const relevantEvents = events.filter((ev) => {
    if (!ev || !ev.title) return false;

    // If snoozed and not completed, keep visible
    if (ev.snoozedUntil && !ev.isCompleted) {
      return true;
    }

    if (filterDate) {
      return isEventDueToday(ev, targetDateObj) || ev.date === filterDate;
    }

    return isEventDueToday(ev, new Date());
  });

  // Sort: pending first, then completed
  const sortedEvents = [...relevantEvents].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return (a.time || '').localeCompare(b.time || '');
  });

  const pendingCount = sortedEvents.filter((e) => !e.isCompleted).length;

  const handleOpenCreate = () => {
    setIsCreating(true);
  };

  const handleSnooze = (id: string, mins: number) => {
    snoozeEvent(id, mins);
    setSnoozeOpenId(null);
  };

  return (
    <section className="relative w-full rounded-3xl bg-[#151520] border border-[#262438] p-5 sm:p-6 shadow-lg backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262438]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1B1A28] border border-[#3B3654] flex items-center justify-center text-[#B8A4D8]">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-[#EAE6F2] tracking-wide">
                {title}
              </h3>
              {pendingCount > 0 ? (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1B1A28] text-[#B8A4D8] border border-[#3B3654] font-light">
                  {pendingCount} Active
                </span>
              ) : (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-900/50 font-light">
                  All Quiet ✨
                </span>
              )}
            </div>
            <p className="text-xs font-light text-[#AAA4B8] mt-0.5">{subtitle}</p>
          </div>
        </div>

        {showAddButton && (
          <button
            onClick={handleOpenCreate}
            className="min-h-[36px] px-3.5 rounded-xl bg-[#1B1A28] hover:bg-[#252338] border border-[#3B3654] text-[#EAE6F2] hover:text-[#B8A4D8] text-xs font-light flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-[#B8A4D8]" />
            <span>Add Reminder</span>
          </button>
        )}
      </div>

      {/* Reminders List */}
      <div className="space-y-2.5">
        {sortedEvents.map((item) => {
          const cuteMsg = getCuteReminderMessage(item);
          const isSnoozed =
            Boolean(item.snoozedUntil) &&
            new Date(item.snoozedUntil!).getTime() > Date.now();
          const snoozeTimeFormatted = isSnoozed
            ? new Date(item.snoozedUntil!).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : null;

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                item.isCompleted
                  ? 'bg-[#101018]/60 border-[#262438]/60 opacity-60'
                  : 'bg-[#101018] border-[#262438] hover:border-[#3B3654] shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left: Complete toggle & Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleEventCompleted(item.id)}
                    className="mt-0.5 text-[#AAA4B8] hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    title={
                      item.isCompleted
                        ? 'Mark as incomplete'
                        : 'Mark as completed'
                    }
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 hover:stroke-emerald-400" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Badges Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1B1A28] border border-[#3B3654] text-[#B8A4D8]">
                        <span>{cuteMsg.emoji}</span>
                        <span>{cuteMsg.badge}</span>
                      </span>

                      <span className="text-[11px] font-light text-[#AAA4B8] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#B8A4D8]" />
                        <span>{item.time}</span>
                      </span>

                      {item.repeat && item.repeat !== 'none' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-[#1B1A28] border border-[#3B3654] text-[#B8A4D8] font-light capitalize">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>{item.repeat}</span>
                        </span>
                      )}

                      {isSnoozed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-900/50 font-light flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 animate-spin" />
                          <span>Snoozed until {snoozeTimeFormatted}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4
                      className={`text-xs sm:text-sm font-normal text-[#EAE6F2] ${
                        item.isCompleted ? 'line-through text-[#AAA4B8]' : ''
                      }`}
                    >
                      {item.title}
                    </h4>

                    {/* Cute Personalized Message Snippet */}
                    {!item.isCompleted && (
                      <p className="text-[11px] text-[#B8A4D8]/90 font-light italic leading-relaxed pt-0.5">
                        “{cuteMsg.body}”
                      </p>
                    )}

                    {/* Notes */}
                    {(item.notes || item.description) && (
                      <p className="text-[11px] text-[#AAA4B8] font-light pt-0.5 leading-relaxed">
                        {item.notes || item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0 self-start">
                  {/* Snooze Dropdown */}
                  {!item.isCompleted && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setSnoozeOpenId(
                            snoozeOpenId === item.id ? null : item.id
                          )
                        }
                        className="min-h-[30px] px-2 py-1 rounded-lg bg-[#1B1A28] hover:bg-[#252338] border border-[#262438] text-[11px] font-light text-[#B8A4D8] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        title="Snooze reminder"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Snooze</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      {snoozeOpenId === item.id && (
                        <div className="absolute right-0 top-full mt-1 z-30 w-32 rounded-xl bg-[#1B1A28] border border-[#3B3654] shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
                          {[5, 10, 30].map((m) => (
                            <button
                              key={m}
                              onClick={() => handleSnooze(item.id, m)}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-light text-[#EAE6F2] hover:bg-[#262438] transition-colors"
                            >
                              Snooze {m}m
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Edit */}
                  <button
                    onClick={() => setEditingEvent(item)}
                    className="w-7 h-7 rounded-lg bg-[#151520] hover:bg-[#1B1A28] text-[#AAA4B8] hover:text-[#EAE6F2] flex items-center justify-center transition-colors cursor-pointer"
                    title="Edit reminder"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteEvent(item.id)}
                    className="w-7 h-7 rounded-lg bg-[#151520] hover:bg-rose-500/20 text-[#AAA4B8] hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sortedEvents.length === 0 && (
          <div className="py-8 text-center text-xs font-light text-[#AAA4B8] space-y-1.5">
            <p>No reminders scheduled for this rhythm.</p>
            <p className="text-[11px] opacity-70">
              Add birthdays, gentle intentions, or appointments anytime ✨
            </p>
          </div>
        )}
      </div>

      {/* Edit / Create Modals */}
      {editingEvent && (
        <EditReminderModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {isCreating && (
        <EditReminderModal
          event={
            {
              id: '',
              title: '',
              date: targetDateStr,
              time: '09:00 AM',
              type: 'ritual',
              repeat: 'none',
            } as CalendarEvent
          }
          onClose={() => setIsCreating(false)}
        />
      )}
    </section>
  );
};
