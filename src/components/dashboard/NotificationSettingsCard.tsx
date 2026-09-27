import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  AlertCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';
import {
  notificationService,
  NotificationPreferences,
  NotificationDispatchResult,
} from '../../services/notificationService';

export const NotificationSettingsCard: React.FC = () => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(() =>
    notificationService.getPreferences()
  );
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    () => notificationService.getPermissionStatus()
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [testing, setTesting] = useState<boolean>(false);
  const [previewNotice, setPreviewNotice] = useState<string | null>(null);

  const isInIframe = notificationService.isInIframe();

  // Function to refresh permission and synchronize state reactively
  const refreshPermissionState = useCallback(() => {
    const current = notificationService.getPermissionStatus();
    setPermission((prev) => {
      if (prev !== current) {
        // If permission became granted, ensure preferences reflect active state
        if (current === 'granted') {
          setPrefs((p) => {
            if (!p.enabled) {
              const updated = { ...p, enabled: true };
              notificationService.savePreferences(updated);
              return updated;
            }
            return p;
          });
        }
        return current;
      }
      return prev;
    });
  }, []);

  // Reactive Permission Listener: Permissions API, visibilitychange, focus & gentle interval
  useEffect(() => {
    refreshPermissionState();

    // 1. Permissions API listener (Chrome, Edge, Firefox)
    let permStatusObj: PermissionStatus | null = null;
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'notifications' as PermissionName })
        .then((status) => {
          permStatusObj = status;
          status.onchange = () => {
            refreshPermissionState();
          };
        })
        .catch(() => {
          // Permissions query might be restricted in some iframes
        });
    }

    // 2. Window focus & visibility changes (e.g. user toggles permissions in browser settings)
    const handleWindowFocus = () => refreshPermissionState();
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('visibilitychange', handleWindowFocus);

    // 3. Gentle interval fallback to guarantee zero stale state
    const intervalId = setInterval(refreshPermissionState, 2500);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('visibilitychange', handleWindowFocus);
      clearInterval(intervalId);
      if (permStatusObj) {
        permStatusObj.onchange = null;
      }
    };
  }, [refreshPermissionState]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Turn on/off master app notification toggle
  const handleToggleMaster = () => {
    const nextState = !prefs.enabled;
    const next = { ...prefs, enabled: nextState };
    setPrefs(next);
    notificationService.savePreferences(next);
    showToast(nextState ? 'Notifications active 💕' : 'Notifications muted');
  };

  // Enable Notifications button handler
  const handleEnableClick = async () => {
    setPreviewNotice(null);
    const currentPerm = notificationService.getPermissionStatus();
    setPermission(currentPerm);

    // 1. If permission is ALREADY granted in browser:
    // Never call Notification.requestPermission() repeatedly (avoids iframe rejection error)
    if (currentPerm === 'granted') {
      const next = { ...prefs, enabled: true };
      setPrefs(next);
      notificationService.savePreferences(next);
      showToast('Notifications enabled! Sending real test notification 💕');
      await handleSendTest();
      return;
    }

    // 2. If permission is blocked/denied in browser
    if (currentPerm === 'denied') {
      showToast('Notifications are blocked by your browser settings. Please allow notifications in site settings.');
      return;
    }

    // 3. If permission is "default" (not prompted yet)
    const result = await notificationService.requestPermission();
    const updatedPerm = notificationService.getPermissionStatus();
    setPermission(updatedPerm);

    if (result.granted || updatedPerm === 'granted') {
      const next = { ...prefs, enabled: true };
      setPrefs(next);
      notificationService.savePreferences(next);
      showToast('Notifications enabled! Sending real test notification 💕');
      await handleSendTest();
    } else if (result.error) {
      setPreviewNotice(result.error);
    }
  };

  // Real Browser Test Notification Sender
  const handleSendTest = async () => {
    setTesting(true);
    setPreviewNotice(null);

    const result: NotificationDispatchResult = await notificationService.sendTestNotification();
    setTesting(false);

    if (result.nativeDispatched) {
      showToast('Real browser notification sent! 💕 Check your system tray');
    } else if (result.previewBlocked) {
      setPreviewNotice(
        'The Google AI Studio preview iframe blocked the native notification popup. Open the app in a standalone browser tab for native desktop/phone alerts.'
      );
    } else if (result.error) {
      showToast(result.error);
    }
  };

  const handleUpdatePref = <K extends keyof NotificationPreferences>(
    key: K,
    val: NotificationPreferences[K]
  ) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    notificationService.savePreferences(next);
  };

  const isBrowserGranted = permission === 'granted';
  const isBrowserDenied = permission === 'denied';

  // Get current standalone URL
  const standaloneUrl = typeof window !== 'undefined' ? window.location.href : '#';

  return (
    <div className="relative w-full rounded-2xl bg-[#121215]/85 border border-[#27272B] p-4 sm:p-5 shadow-lg backdrop-blur-md transition-all duration-300">
      {/* Toast Notification Popup */}
      {toastMsg && (
        <div className="absolute top-3 right-4 z-30 px-3.5 py-1.5 rounded-full bg-[#1F1728] border border-pink-500/40 text-pink-200 text-xs font-light shadow-xl flex items-center gap-1.5 animate-in fade-in duration-200">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header / Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Icon & Title & Badges */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              prefs.enabled && isBrowserGranted
                ? 'bg-pink-500/15 border border-pink-500/30 text-pink-300'
                : 'bg-[#18181D] border border-[#27272B] text-[#929099]'
            }`}
          >
            {prefs.enabled && isBrowserGranted ? (
              <BellRing className="w-4 h-4 text-pink-300 animate-pulse" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-normal text-[#E8E6EB] tracking-wide">
                Sanctuary Notifications
              </h3>

              {/* Browser Permission Badge (Reactive) */}
              {isBrowserGranted ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-light flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Browser: Granted ✨</span>
                </span>
              ) : isBrowserDenied ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-light">
                  Browser: Blocked
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-light">
                  Browser: Not Set
                </span>
              )}

              {/* App Status Badge */}
              {prefs.enabled ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 font-light">
                  Active
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E1E24] text-[#929099] border border-[#27272B] font-light">
                  Muted
                </span>
              )}
            </div>

            <p className="text-xs font-light text-[#929099] mt-0.5">
              Desktop & phone alerts for focus timer, gentle tasks, events, and sweet notes
            </p>
          </div>
        </div>

        {/* Right Side: Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Test Notification Button (Always available when permission is granted) */}
          {isBrowserGranted && (
            <button
              onClick={handleSendTest}
              disabled={testing}
              title="Send a real browser notification to your device"
              className="min-h-[34px] px-3 rounded-xl bg-[#18181D] hover:bg-[#22222A] border border-pink-500/30 text-xs font-light text-pink-200 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[11px] font-normal">{testing ? 'Sending...' : 'Test Notification'}</span>
            </button>
          )}

          {/* Options Dropdown Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title="Notification preferences"
            className="min-h-[34px] px-2.5 rounded-xl bg-[#18181D] hover:bg-[#22222A] border border-[#27272B] text-xs font-light text-[#929099] hover:text-[#E8E6EB] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-[11px]">Options</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Master Enable/Toggle Button */}
          {isBrowserGranted ? (
            <button
              onClick={handleToggleMaster}
              title={prefs.enabled ? 'Mute notifications' : 'Turn on notifications'}
              className={`min-h-[34px] px-3.5 rounded-xl text-xs font-light flex items-center gap-1.5 transition-all cursor-pointer ${
                prefs.enabled
                  ? 'bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-200'
                  : 'bg-[#18181D] hover:bg-[#252530] border border-[#27272B] text-[#929099] hover:text-[#E8E6EB]'
              }`}
            >
              {prefs.enabled ? (
                <>
                  <Check className="w-3.5 h-3.5 text-pink-300" />
                  <span>On</span>
                </>
              ) : (
                <span>Turn On</span>
              )}
            </button>
          ) : (
            <button
              onClick={handleEnableClick}
              className={`min-h-[36px] px-4 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isBrowserDenied
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isBrowserDenied ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>Blocked in Browser</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>Enable Notifications 💕</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Google AI Studio Preview Iframe Notice (Clean, informative, actionable) */}
      {previewNotice && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-[#1C1724] border border-purple-500/40 text-purple-200 text-xs font-light space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-purple-200">Preview Context Notice</p>
              <p className="text-[11px] leading-relaxed text-purple-200/80">
                {previewNotice}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <a
              href={standaloneUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-200 text-xs font-normal transition-colors"
            >
              <span>Open Standalone App Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => setPreviewNotice(null)}
              className="px-2.5 py-1.5 rounded-lg border border-[#27272B] text-xs text-[#929099] hover:text-[#E8E6EB] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Blocked in Browser Hint */}
      {isBrowserDenied && !previewNotice && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-light flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-medium text-amber-300">Browser Permissions Blocked</p>
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              Chrome or your browser has blocked notifications for this origin. Click the lock/site settings icon in your browser URL bar, change Notifications to "Allow", and reload.
            </p>
          </div>
        </div>
      )}

      {/* Expanded Customization Panel */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#27272B]/60 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Focus Timer Alerts */}
            <div className="p-3 rounded-xl bg-[#16161B] border border-[#27272B] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-[#E8E6EB]">Focus Timer Alerts</span>
                <p className="text-[11px] text-[#929099] font-light">
                  Celebration & flirty hugs when focus sessions finish
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.focusTimer}
                onChange={(e) => handleUpdatePref('focusTimer', e.target.checked)}
                className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
              />
            </div>

            {/* 2. Audio Chime */}
            <div className="p-3 rounded-xl bg-[#16161B] border border-[#27272B] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-[#E8E6EB]">Chime Sound</span>
                <p className="text-[11px] text-[#929099] font-light">
                  Gentle synthesized chime with notifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.soundEnabled}
                onChange={(e) => handleUpdatePref('soundEnabled', e.target.checked)}
                className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
              />
            </div>

            {/* 3. Task Reminders with Custom Time */}
            <div className="p-3 rounded-xl bg-[#16161B] border border-[#27272B] space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-[#E8E6EB]">Gentle Task Reminder</span>
                  <p className="text-[11px] text-[#929099] font-light">
                    Friendly reminder of your daily gentle tasks
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.taskReminders}
                  onChange={(e) => handleUpdatePref('taskReminders', e.target.checked)}
                  className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
                />
              </div>

              {prefs.taskReminders && (
                <div className="flex items-center gap-2 pt-1 border-t border-[#27272B]/40 text-xs text-[#929099]">
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  <span>Notify at:</span>
                  <input
                    type="time"
                    value={prefs.taskReminderTime}
                    onChange={(e) => handleUpdatePref('taskReminderTime', e.target.value)}
                    className="px-2 py-0.5 rounded-lg bg-[#101014] border border-[#27272B] text-xs text-[#E8E6EB] focus:outline-none focus:border-pink-500"
                  />
                </div>
              )}
            </div>

            {/* 4. Calendar Event Reminders */}
            <div className="p-3 rounded-xl bg-[#16161B] border border-[#27272B] space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-[#E8E6EB]">Upcoming Event Reminders</span>
                  <p className="text-[11px] text-[#929099] font-light">
                    Alerts for calendar dates and special moments
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.eventReminders}
                  onChange={(e) => handleUpdatePref('eventReminders', e.target.checked)}
                  className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
                />
              </div>

              {prefs.eventReminders && (
                <div className="flex items-center gap-2 pt-1 border-t border-[#27272B]/40 text-xs text-[#929099]">
                  <span>Lead time:</span>
                  <select
                    value={prefs.eventReminderLeadMinutes}
                    onChange={(e) =>
                      handleUpdatePref('eventReminderLeadMinutes', parseInt(e.target.value) || 15)
                    }
                    className="px-2 py-0.5 rounded-lg bg-[#101014] border border-[#27272B] text-xs text-[#E8E6EB] focus:outline-none focus:border-pink-500"
                  >
                    <option value="0">At event time</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                  </select>
                </div>
              )}
            </div>

            {/* 5. Midday Sweet Love Notes */}
            <div className="p-3 rounded-xl bg-[#16161B] border border-[#27272B] space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                    <span className="text-xs font-medium text-[#E8E6EB]">Midday Sweet Love Notes</span>
                  </div>
                  <p className="text-[11px] text-[#929099] font-light">
                    Random cute, romantic check-in whisper to warm your heart during the day
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.sweetLoveNotes}
                  onChange={(e) => handleUpdatePref('sweetLoveNotes', e.target.checked)}
                  className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
                />
              </div>

              {prefs.sweetLoveNotes && (
                <div className="flex items-center gap-2 pt-1 border-t border-[#27272B]/40 text-xs text-[#929099]">
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  <span>Send whisper around:</span>
                  <input
                    type="time"
                    value={prefs.sweetNoteTime}
                    onChange={(e) => handleUpdatePref('sweetNoteTime', e.target.value)}
                    className="px-2 py-0.5 rounded-lg bg-[#101014] border border-[#27272B] text-xs text-[#E8E6EB] focus:outline-none focus:border-pink-500"
                  />
                </div>
              )}
            </div>
            {/* 6. In-App Interactive Popups */}
            <div className="p-3 rounded-xl bg-[#16161B] border border-[#27272B] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-[#E8E6EB]">In-App Reminder Popups</span>
                <p className="text-[11px] text-[#929099] font-light">
                  Show aesthetic popup with snooze & complete actions when due
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.inAppPopups !== false}
                onChange={(e) => handleUpdatePref('inAppPopups', e.target.checked)}
                className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
              />
            </div>

            {/* 7. Default Snooze Duration */}
            <div className="p-3 rounded-xl bg-[#16161B] border border-[#27272B] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-[#E8E6EB]">Default Snooze Length</span>
                <p className="text-[11px] text-[#929099] font-light">
                  Quick snooze delay for active reminders
                </p>
              </div>
              <select
                value={prefs.defaultSnoozeMinutes || 10}
                onChange={(e) =>
                  handleUpdatePref('defaultSnoozeMinutes', parseInt(e.target.value) || 10)
                }
                className="px-2.5 py-1 rounded-lg bg-[#101014] border border-[#27272B] text-xs text-[#E8E6EB] focus:outline-none focus:border-pink-500"
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>

            {/* 8. Reminder Categories Filter */}
            <div className="p-3 rounded-xl bg-[#16161B] border border-[#27272B] space-y-2 md:col-span-2">
              <span className="text-xs font-medium text-[#E8E6EB] block">
                Active Reminder Types
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#101014] border border-[#27272B] text-xs text-[#929099] hover:text-[#E8E6EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.reminderBirthdays !== false}
                    onChange={(e) => handleUpdatePref('reminderBirthdays', e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-pink-500"
                  />
                  <span>🎂 Birthdays</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#101014] border border-[#27272B] text-xs text-[#929099] hover:text-[#E8E6EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.reminderAnniversaries !== false}
                    onChange={(e) => handleUpdatePref('reminderAnniversaries', e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-pink-500"
                  />
                  <span>💖 Anniversaries</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#101014] border border-[#27272B] text-xs text-[#929099] hover:text-[#E8E6EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.reminderAppointments !== false}
                    onChange={(e) => handleUpdatePref('reminderAppointments', e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-pink-500"
                  />
                  <span>🩺 Appointments</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#101014] border border-[#27272B] text-xs text-[#929099] hover:text-[#E8E6EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.reminderTasks !== false}
                    onChange={(e) => handleUpdatePref('reminderTasks', e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-pink-500"
                  />
                  <span>📝 Tasks</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#101014] border border-[#27272B] text-xs text-[#929099] hover:text-[#E8E6EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.reminderRituals !== false}
                    onChange={(e) => handleUpdatePref('reminderRituals', e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-pink-500"
                  />
                  <span>🌿 Rituals</span>
                </label>
              </div>
            </div>
          </div>

          {/* Desktop & Mobile Background Support Note */}
          <div className="p-3 rounded-xl bg-[#101014] border border-[#27272B]/60 flex items-start gap-2.5 text-[11px] text-[#929099] font-light">
            <div className="flex items-center gap-1 shrink-0 text-[#B8A4D8] mt-0.5">
              <Laptop className="w-3.5 h-3.5" />
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1">
              <p className="leading-relaxed">
                Notifications work across desktop and mobile while your browser is open or minimized in the background via Service Worker.
              </p>
              <p className="leading-relaxed text-[10px] opacity-75">
                Note: Delivering notifications when the browser app is completely terminated/closed requires Web Push (VAPID) push infrastructure with a persistent cloud messaging gateway.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
