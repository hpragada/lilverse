/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './firebase/authContext';
import { AppPinProvider, useAppPin } from './context/AppPinContext';
import { AppProvider, useApp } from './context/AppContext';
import { FirebaseAuthScreen } from './components/auth/FirebaseAuthScreen';
import { AppPinScreen } from './components/auth/AppPinScreen';
import { AuthModal } from './components/auth/AuthModal';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { LifeDashboardView } from './components/dashboard/LifeDashboardView';
import { JournalView } from './components/journal/JournalView';
import { NotesView } from './components/notes/NotesView';
import { MemoriesView } from './components/memories/MemoriesView';
import { JoyJarView } from './components/joyjar/JoyJarView';
import { MoneyTrackerView } from './components/finance/MoneyTrackerView';
import { CalendarView } from './components/calendar/CalendarView';
import { DreamsView } from './components/dreams/DreamsView';
import { CareerView } from './components/career/CareerView';
import { FilesView } from './components/files/FilesView';
import { VaultView } from './components/vault/VaultView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { SettingsView } from './components/settings/SettingsView';
import { QuickActionsModal } from './components/common/QuickActionsModal';
import { WelcomeEntranceOverlay } from './components/common/WelcomeEntranceOverlay';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { ActiveReminderModal } from './components/calendar/ActiveReminderModal';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[#06050B] text-[#F3EEFB] flex flex-col md:flex-row relative overflow-hidden">
      {/* App Entrance Animation (Once per session) */}
      <WelcomeEntranceOverlay />

      {/* Ambient Soft Glow Backdrops */}
      <div className="fixed top-[-100px] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] left-[15%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[40%] left-[-100px] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top and Bottom Navigation */}
      <MobileNav />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-20 md:pb-12 overflow-y-auto">
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'dashboard' && <LifeDashboardView />}
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'journal' && <JournalView />}
        {activeTab === 'notes' && <NotesView />}
        {activeTab === 'letters' && <MoneyTrackerView />}
        {activeTab === 'memories' && <MemoriesView />}
        {activeTab === 'joyjar' && <JoyJarView />}
        {activeTab === 'files' && <FilesView />}
        {activeTab === 'vault' && <VaultView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'dreams' && <DreamsView />}
        {activeTab === 'career' && <CareerView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Shared Quick Action Modal */}
      <QuickActionsModal />

      {/* Active In-App Reminder Modal with Snooze & Complete */}
      <ActiveReminderModal />

      {/* PWA Android Install Banner */}
      <PWAInstallBanner />

      {/* Cloud Authentication Modal */}
      <AuthModal />
    </div>
  );
};

const AppGates: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const { isPinUnlocked } = useAppPin();

  // 1. Loading splash while Firebase Auth initializes session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080C] flex flex-col items-center justify-center text-[#EAE6F2]">
        <div className="w-10 h-10 rounded-full border-2 border-[#B8A4D8]/30 border-t-[#B8A4D8] animate-spin mb-4" />
        <span className="text-xs font-light text-[#AAA4B8] tracking-wider uppercase">Loading Sanctuary...</span>
      </div>
    );
  }

  // 2. Primary Gate: Firebase Authentication
  if (!currentUser) {
    return <FirebaseAuthScreen />;
  }

  // 3. Secondary Gate: 6-Digit App-Wide Secret PIN Lock
  if (!isPinUnlocked) {
    return <AppPinScreen />;
  }

  // 4. Authenticated & PIN-Unlocked Private Application Dashboard
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppPinProvider>
        <AppGates />
      </AppPinProvider>
    </AuthProvider>
  );
}

