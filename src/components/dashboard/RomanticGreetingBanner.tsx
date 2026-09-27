import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Sparkles, Copy, Check, Shuffle, Flame } from 'lucide-react';
import {
  TimePeriod,
  getTimePeriod,
  PERIOD_THEMES,
} from '../../data/romanticGreetings';
import { getRandomFlirtLine } from '../../data/flirtLines';
import { useApp } from '../../context/AppContext';
import { FlirtLine } from '../../types';

// Animated emojis as requested: 😜🥰😘🥹💗🦋✨
const TELEGRAM_EMOJIS = [
  { emoji: '😜', label: 'Playful wink', animClass: 'telegram-emoji-bounce-1' },
  { emoji: '🥰', label: 'Warm affection', animClass: 'telegram-emoji-bounce-2' },
  { emoji: '😘', label: 'Sweet kiss', animClass: 'telegram-emoji-bounce-3' },
  { emoji: '🥹', label: 'Heart melting', animClass: 'telegram-emoji-bounce-4' },
  { emoji: '💗', label: 'Growing heart', animClass: 'telegram-emoji-heartbeat' },
  { emoji: '🦋', label: 'Butterflies', animClass: 'telegram-emoji-flutter' },
  { emoji: '✨', label: 'Pure magic', animClass: 'telegram-emoji-sparkle' },
];

export const RomanticGreetingBanner: React.FC = () => {
  const { isFlirtFavorite, addFlirtFavorite, removeFlirtFavorite } = useApp();

  const [period, setPeriod] = useState<TimePeriod>(() => getTimePeriod());
  const [currentLine, setCurrentLine] = useState<FlirtLine>(() => getRandomFlirtLine('all'));
  const [copied, setCopied] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [activeEmojiIndex, setActiveEmojiIndex] = useState<number | null>(null);
  const [burstHearts, setBurstHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Update time period dynamically
  useEffect(() => {
    const checkTime = () => {
      const currentPeriod = getTimePeriod(new Date());
      setPeriod((prevPeriod) => {
        if (currentPeriod !== prevPeriod) {
          return currentPeriod;
        }
        return prevPeriod;
      });
    };

    const intervalId = setInterval(checkTime, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const theme = PERIOD_THEMES[period];

  const getTimeGreeting = (p: TimePeriod): string => {
    switch (p) {
      case 'morning':
        return 'Good morning, Haari! ☀️';
      case 'afternoon':
        return 'Good afternoon, Haari! 🌸';
      case 'evening':
        return 'Good evening, Haari! ✨';
      case 'night':
        return 'Good night, Haari! 🌙';
      default:
        return 'Good day, Haari! 💗';
    }
  };

  const handleShuffleLine = useCallback(() => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 450);
    const nextLine = getRandomFlirtLine('all', currentLine.id);
    setCurrentLine(nextLine);
  }, [currentLine.id]);

  const handleCopyLine = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`"${currentLine.text}" 💗`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFlirtFavorite(currentLine.id)) {
      removeFlirtFavorite(currentLine.id);
    } else {
      addFlirtFavorite(currentLine, 'Favorited from Home Greeting 💕');
    }
  };

  // Interactive Telegram-style emoji tap
  const handleEmojiClick = (index: number, e: React.MouseEvent) => {
    setActiveEmojiIndex(index);
    setTimeout(() => setActiveEmojiIndex(null), 600);

    const rect = e.currentTarget.getBoundingClientRect();
    const newBurst = {
      id: Date.now() + Math.random(),
      x: rect.left + rect.width / 2,
      y: rect.top,
    };
    setBurstHearts((prev) => [...prev.slice(-4), newBurst]);
    setTimeout(() => {
      setBurstHearts((prev) => prev.filter((b) => b.id !== newBurst.id));
    }, 800);
  };

  const isFavorited = isFlirtFavorite(currentLine.id);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#C084FC]/30 bg-gradient-to-br from-[#1E1A2E] via-[#151322] to-[#0E0C17] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(192,132,252,0.15)] transition-all duration-500 group select-none p-5 sm:p-7">
      {/* Background Soft Ambient Glows */}
      <div
        className="absolute -top-16 -left-16 w-64 h-64 bg-gradient-to-r from-[#9680C8]/20 to-[#7863A8]/20 opacity-30 blur-3xl pointer-events-none rounded-full"
      />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-gradient-to-r from-[#B8A4D8]/15 to-[#7863A8]/15 opacity-30 blur-3xl pointer-events-none rounded-full" />

      {/* Floating Pastel Hearts Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <span className="absolute left-[6%] bottom-0 text-[11px] text-[#B8A4D8]/40 animate-float-heart-1">
          💗
        </span>
        <span className="absolute left-[24%] bottom-0 text-[10px] text-[#9680C8]/35 animate-float-heart-2">
          ✨
        </span>
        <span className="absolute left-[48%] bottom-0 text-[12px] text-[#B8A4D8]/40 animate-float-heart-3">
          ✦
        </span>
        <span className="absolute left-[70%] bottom-0 text-[10px] text-[#9680C8]/35 animate-float-heart-4">
          💕
        </span>
        <span className="absolute left-[88%] bottom-0 text-[11px] text-[#B8A4D8]/35 animate-float-heart-5">
          🦋
        </span>
        <span className="absolute left-[95%] bottom-0 text-[10px] text-[#9680C8]/30 animate-float-heart-6">
          💗
        </span>
      </div>

      {/* Main Banner Content */}
      <div className="relative z-10 space-y-5">
        {/* Top Header Row: Time Greeting & Animated Telegram Emojis */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#262438]">
          {/* Time-Based Greeting Tag */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#1B1A28] border border-[#3B3654] text-[#EAE6F2] shadow-sm">
              <span className="text-sm">{theme.badgeIcon}</span>
              <span>{getTimeGreeting(period)}</span>
            </span>
          </div>

          {/* Animated Telegram-Style Bouncing Emojis Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto bg-[#101018]/90 px-3 py-1.5 rounded-2xl border border-[#262438] backdrop-blur-sm shadow-inner">
            {TELEGRAM_EMOJIS.map((item, idx) => (
              <button
                key={item.emoji}
                onClick={(e) => handleEmojiClick(idx, e)}
                title={`${item.label} (Tap for bounce!)`}
                className={`text-lg sm:text-xl p-1 rounded-lg transition-transform duration-200 hover:scale-130 active:scale-95 cursor-pointer ${
                  item.animClass
                } ${activeEmojiIndex === idx ? 'scale-140 rotate-12' : ''}`}
                style={{
                  filter: 'drop-shadow(0 2px 6px rgba(184, 164, 216, 0.35))',
                }}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Central Headline */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#EAE6F2] tracking-tight drop-shadow-sm flex items-center gap-2 flex-wrap">
            <span>Welcome to LilVerse, Haari!</span>
            <span className="text-[#B8A4D8] inline-block telegram-emoji-heartbeat">
              💗
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-light text-[#AAA4B8] mt-1.5 tracking-wide">
            Your gentle, dreamy digital sanctuary — filled with quiet moments, calm rhythms, and sweetest thoughts.
          </p>
        </div>

        {/* Random Cute Flirty Message Card */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-[#101018]/90 border border-[#262438] shadow-lg relative overflow-hidden backdrop-blur-md">
          {/* Subtle Lavender Gradient Sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#B8A4D8]/5 via-[#9680C8]/5 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Flirty Message Text with Emoji */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="text-2xl mt-0.5 select-none shrink-0 filter drop-shadow">
                {currentLine.emoji || '💕'}
              </span>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider font-medium text-[#B8A4D8]">
                    Cute Flirty Whisper · {currentLine.category}
                  </span>
                  {currentLine.tag && (
                    <span className="text-[10px] text-[#9680C8] font-light">
                      #{currentLine.tag}
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base font-light text-[#EAE6F2] italic leading-relaxed tracking-wide pt-0.5">
                  “{currentLine.text}”
                </p>
              </div>
            </div>

            {/* Quick Action Controls: Another, Favorite, Copy */}
            <div className="flex items-center gap-1.5 self-end md:self-center shrink-0 pt-1 md:pt-0">
              {/* Roll Another Line Button */}
              <button
                onClick={handleShuffleLine}
                title="Roll another cute flirty line"
                className="min-h-[36px] px-3 rounded-xl bg-[#1B1A28] hover:bg-[#252338] border border-[#3B3654] text-[#EAE6F2] hover:text-[#B8A4D8] text-xs font-light flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              >
                <Shuffle
                  className={`w-3.5 h-3.5 text-[#B8A4D8] transition-transform duration-300 ${
                    isRotating ? 'rotate-180' : ''
                  }`}
                />
                <span>Another 💕</span>
              </button>

              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                title={isFavorited ? 'Saved in favorites' : 'Save to favorites'}
                className={`min-h-[36px] min-w-[36px] px-2 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${
                  isFavorited
                    ? 'bg-[#B8A4D8]/20 border-[#B8A4D8]/50 text-[#B8A4D8]'
                    : 'bg-[#151520] border-[#262438] text-[#AAA4B8] hover:text-[#B8A4D8]'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isFavorited ? 'fill-[#B8A4D8] text-[#B8A4D8]' : ''
                  }`}
                />
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopyLine}
                title="Copy flirty whisper"
                className="min-h-[36px] min-w-[36px] px-2 rounded-xl bg-[#151520] hover:bg-[#1B1A28] border border-[#262438] text-[#AAA4B8] hover:text-[#EAE6F2] text-xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Micro-Heart Bursts on Tap */}
      {burstHearts.map((b) => (
        <div
          key={b.id}
          className="fixed pointer-events-none text-sm animate-micro-burst z-50 text-[#B8A4D8]"
          style={{ left: b.x, top: b.y }}
        >
          💗
        </div>
      ))}
    </div>
  );
};
