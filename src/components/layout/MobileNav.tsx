import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  Image,
  Sparkles,
  Calendar,
  Heart,
  Compass,
  Settings,
  Moon,
  Menu,
  X,
  Feather,
  Folder,
  Shield,
  Mail,
  HeartHandshake,
  CalendarClock,
  Smile,
  Flower2,
  Wallet,
  LayoutDashboard,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { UserStatusBadge } from '../auth/UserStatusBadge';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, userProfile, toggleLowEnergyMode } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  interface MenuItem {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
  }

  const bottomTabs: MenuItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'memories', label: 'Little Moments', icon: Image },
    { id: 'dreams', label: 'Wishlist', icon: Heart },
  ];

  const moreTabs: MenuItem[] = [
    { id: 'dashboard', label: 'My Life Dashboard', icon: LayoutDashboard, description: 'All-in-one personalized life overview' },
    { id: 'schedule', label: 'Schedule', icon: CalendarClock, description: 'Monday–Sunday weekly anchors & routines' },
    { id: 'notes', label: 'My Notes', icon: FileText, description: 'Personal memos & quick thoughts' },
    { id: 'letters', label: 'My Money Tracker', icon: Wallet, description: 'Income, expenses & monthly budgets' },
    { id: 'joyjar', label: 'Little Joy Jar', icon: Smile, description: 'Jar of happy moments & smiles' },
    { id: 'files', label: 'My Files', icon: Folder, description: 'Documents & project files' },
    { id: 'vault', label: 'Private Vault', icon: Shield, description: 'Client-encrypted private safe' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, description: 'Gentle rituals & dates' },
    { id: 'career', label: 'My Learning Hub', icon: GraduationCap, description: 'Courses, skills & study goals' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Sanctuary preferences' },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 h-14 bg-[#08080C]/95 backdrop-blur-md border-b border-[#262438] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#151520] border border-[#262438] flex items-center justify-center text-[#B8A4D8] shadow-sm shadow-[#7863A8]/20">
            <Feather className="w-3 h-3" />
          </div>
          <span className="text-sm font-normal tracking-wide text-[#EAE6F2]">
            LilVerse
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Low Energy Mode button */}
          <button
            onClick={toggleLowEnergyMode}
            className={`min-h-[36px] px-2.5 py-1 rounded-full border text-xs font-light flex items-center gap-1.5 transition-colors ${
              userProfile.lowEnergyMode
                ? 'bg-[#B8A4D8]/20 border-[#B8A4D8]/50 text-[#B8A4D8]'
                : 'bg-[#151520] border-[#262438] text-[#AAA4B8]'
            }`}
            title="Toggle low energy mode"
          >
            <Moon className="w-3 h-3" />
            <span className="text-[11px]">
              {userProfile.lowEnergyMode ? 'Low Energy' : 'Gentle'}
            </span>
          </button>

          {/* Quick Menu Drawer trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2]"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-[#08080C]/95 backdrop-blur-md border-t border-[#262438] px-2 flex items-center justify-around">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center transition-all ${
                isActive ? 'text-[#C084FC] drop-shadow-[0_0_8px_rgba(192,132,252,0.6)] font-medium' : 'text-[#B4ACCA]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-light mt-1 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* More Drawer Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            ['schedule', 'letters', 'joyjar', 'files', 'vault', 'calendar', 'career', 'settings'].includes(activeTab)
              ? 'text-[#B8A4D8]'
              : 'text-[#AAA4B8]'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-light mt-1 tracking-tight">
            More
          </span>
        </button>
      </nav>

      {/* Mobile Slide-Up Drawer for Additional Pages */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/70 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative z-10 bg-[#101018] border-t border-[#262438] rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto">
            {/* Grab handle */}
            <div className="w-10 h-1 bg-[#262438] rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-widest text-[#AAA4B8] font-light">
                All Sanctuary Spaces
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cloud Account Status */}
            <div className="mb-4">
              <UserStatusBadge />
            </div>

            <div className="space-y-2">
              {[...bottomTabs, ...moreTabs].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all min-h-[52px] ${
                      isActive
                        ? 'bg-gradient-to-r from-[#1E1B2E] via-[#1A162B] to-[#171426] border-[#C084FC]/50 text-[#F3EEFB] shadow-[0_0_18px_rgba(192,132,252,0.25)] font-medium'
                        : 'bg-[#12101D] border-[#2E2942] text-[#B4ACCA] hover:text-[#F3EEFB]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        isActive
                          ? 'border-[#B8A4D8]/40 bg-[#B8A4D8]/10 text-[#B8A4D8]'
                          : 'border-[#262438] bg-[#151520] text-[#AAA4B8]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-light text-[#EAE6F2]">
                        {tab.label}
                      </span>
                      {'description' in tab && (
                        <span className="text-xs text-[#AAA4B8] font-light">
                          {tab.description}
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B8A4D8] shadow-sm shadow-[#B8A4D8]/50" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Low Energy Mode Banner in Drawer */}
            <div className="mt-5 p-4 rounded-2xl bg-[#151520] border border-[#262438] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#EAE6F2] font-light block">
                  Low Energy Mode
                </span>
                <span className="text-[11px] text-[#AAA4B8] font-light">
                  Gentle minimal view with zero pressure
                </span>
              </div>
              <button
                onClick={toggleLowEnergyMode}
                className={`min-h-[44px] px-3 rounded-xl border text-xs font-light transition-colors ${
                  userProfile.lowEnergyMode
                    ? 'bg-[#B8A4D8] text-[#08080C] border-[#B8A4D8] font-medium'
                    : 'bg-[#101018] text-[#AAA4B8] border-[#262438]'
                }`}
              >
                {userProfile.lowEnergyMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
