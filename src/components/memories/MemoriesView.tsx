/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Camera,
  Calendar,
  MapPin,
  Trash2,
  X,
  Plus,
  AlertCircle,
  Check,
  Grid,
  Clock,
  Search,
  Edit3,
  HardDrive,
  Info,
  Maximize2,
  Cloud,
  CloudOff,
  RefreshCw,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  History,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Memory } from '../../types';
import { processImageFile, updateMemoryDriveMeta } from '../../services/photoStorage';

interface StagedPhoto {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  caption: string;
  date: string;
  location: string;
  category: string;
}

export const MemoriesView: React.FC = () => {
  const {
    memories,
    addMultipleMemories,
    updateMemory,
    deleteMemory,
    driveAuthState,
    connectDrive,
    disconnectDrive,
  } = useApp();

  const [viewMode, setViewMode] = useState<'scrapbook' | 'timeline' | 'grid'>('scrapbook');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [driveActionNotice, setDriveActionNotice] = useState<string | null>(null);

  // Lightbox / Full-screen Viewer with Next/Prev
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(null);

  // Edit Memory Details State
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSaveNotice, setEditSaveNotice] = useState<string | null>(null);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Upload & Staging state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Common staging date & location
  const todayStr = new Date().toISOString().split('T')[0];
  const [batchDate, setBatchDate] = useState(todayStr);
  const [batchLocation, setBatchLocation] = useState('Personal Sanctuary');
  const [batchCategory, setBatchCategory] = useState('Quiet Moments');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera Capture state & refs
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSnapshotUrl, setCapturedSnapshotUrl] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Random Memory Discovery ("Remember this little moment?")
  const [randomDiscovered, setRandomDiscovered] = useState<Memory | null>(null);

  // Start real live camera via getUserMedia
  const startCamera = async () => {
    setCameraError(null);
    setCapturedSnapshotUrl(null);
    setIsCameraStarting(true);
    setIsCameraModalOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera (getUserMedia) is not supported by your browser or environment.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (envErr) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      }

      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Video play error:', e));
        }
      }, 100);
    } catch (err: any) {
      console.warn('[Camera] Failed to access camera:', err);
      let errMsg = 'Camera access was denied or no camera was found.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Camera permission was denied. Please allow camera access in your browser settings to take photos.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'No camera device was detected on your system.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setCameraError(errMsg);
    } finally {
      setIsCameraStarting(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedSnapshotUrl(dataUrl);
      stopCamera();
    }
  };

  const handleRetakeSnapshot = () => {
    setCapturedSnapshotUrl(null);
    startCamera();
  };

  const handleUseCapturedPhoto = async () => {
    if (!capturedSnapshotUrl) return;
    try {
      const res = await fetch(capturedSnapshotUrl);
      const blob = await res.blob();
      const file = new File([blob], `instant-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const { dataUrl } = await processImageFile(file);
      const newStaged: StagedPhoto = {
        id: `stage-cam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: dataUrl,
        title: 'Little Captured Moment',
        caption: 'A quiet, unhurried snapshot preserved in time.',
        date: batchDate,
        location: batchLocation,
        category: batchCategory,
      };

      setStagedPhotos((prev) => [...prev, newStaged]);
      setIsCameraModalOpen(false);
      setCapturedSnapshotUrl(null);
      setIsUploadModalOpen(true);
    } catch (err: any) {
      setCameraError(`Failed to process captured photo: ${err?.message || 'Unknown error'}`);
    }
  };

  // Extract all categories
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(memories.map((m) => m.category || 'Quiet Moments')))];
  }, [memories]);

  // Extract available years from memory dates
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    memories.forEach((m) => {
      const match = m.date.match(/\b(20\d\d)\b/);
      if (match) years.add(match[1]);
    });
    return ['All', ...Array.from(years).sort().reverse()];
  }, [memories]);

  // Filter memories
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      if (selectedCategory !== 'All' && (m.category || 'Quiet Moments') !== selectedCategory) {
        return false;
      }
      if (selectedYear !== 'All') {
        if (!m.date.includes(selectedYear)) return false;
      }
      if (selectedMonth !== 'All') {
        const lowerDate = m.date.toLowerCase();
        if (!lowerDate.includes(selectedMonth.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          m.title.toLowerCase().includes(q) ||
          m.caption.toLowerCase().includes(q) ||
          (m.location && m.location.toLowerCase().includes(q)) ||
          m.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [memories, selectedCategory, selectedYear, selectedMonth, searchQuery]);

  // Group memories by date for Timeline view
  const groupedByDate = useMemo(() => {
    const grouped: Record<string, Memory[]> = {};
    for (const m of filteredMemories) {
      const d = m.date || 'Unspecified Date';
      if (!grouped[d]) {
        grouped[d] = [];
      }
      grouped[d].push(m);
    }
    return grouped;
  }, [filteredMemories]);

  // On This Day (matching month and day in previous years)
  const onThisDayMemories = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();

    return memories.filter((m) => {
      try {
        const parsed = new Date(m.date);
        if (isNaN(parsed.getTime())) return false;
        return (
          parsed.getMonth() === currentMonth &&
          parsed.getDate() === currentDay &&
          parsed.getFullYear() < currentYear
        );
      } catch {
        return false;
      }
    });
  }, [memories]);

  // Handle files selected from file picker
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsProcessing(true);

    const newlyStaged: StagedPhoto[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { dataUrl } = await processImageFile(file);
        newlyStaged.push({
          id: `stage-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          previewUrl: dataUrl,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          caption: 'A cherished little moment.',
          date: batchDate,
          location: batchLocation,
          category: batchCategory,
        });
      } catch (err: any) {
        errors.push(`${file.name}: ${err?.message || 'Unsupported format'}`);
      }
    }

    if (errors.length > 0) {
      setUploadError(errors.join(' • '));
    }

    if (newlyStaged.length > 0) {
      setStagedPhotos((prev) => [...prev, ...newlyStaged]);
      setIsUploadModalOpen(true);
    }

    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveStagedPhoto = (id: string) => {
    setStagedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateStagedField = (
    id: string,
    field: keyof StagedPhoto,
    value: string
  ) => {
    setStagedPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveAllPhotos = async () => {
    if (stagedPhotos.length === 0) return;

    const formattedItems = stagedPhotos.map((photo) => {
      let displayDate = photo.date;
      try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(photo.date)) {
          const [y, m, d] = photo.date.split('-');
          const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
          displayDate = dt.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
        }
      } catch {
        displayDate = photo.date;
      }

      return {
        title: photo.title.trim() || 'Little Moment',
        caption: photo.caption.trim() || 'A quiet, unhurried moment held in memory.',
        date: displayDate,
        location: photo.location.trim() || undefined,
        imageSrc: photo.previewUrl,
        category: photo.category.trim() || 'Quiet Moments',
        aspect: 'landscape' as const,
      };
    });

    await addMultipleMemories(formattedItems);
    setStagedPhotos([]);
    setIsUploadModalOpen(false);
  };

  const handleOpenEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setEditTitle(memory.title);
    setEditCaption(memory.caption);

    let iso = todayStr;
    try {
      const parsed = new Date(memory.date);
      if (!isNaN(parsed.getTime())) {
        iso = parsed.toISOString().split('T')[0];
      }
    } catch {
      // ignore
    }
    setEditDate(iso);
    setEditLocation(memory.location || '');
    setEditCategory(memory.category || 'Quiet Moments');
  };

  const handleSaveMemoryEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory) return;

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

    const updated = {
      title: editTitle.trim() || 'Little Moment',
      caption: editCaption.trim(),
      date: displayDate,
      location: editLocation.trim() || undefined,
      category: editCategory.trim() || 'Quiet Moments',
    };

    await updateMemory(editingMemory.id, updated);
    setEditingMemory(null);
    setEditSaveNotice('Memory details updated safely.');
    setTimeout(() => setEditSaveNotice(null), 3000);
  };

  const handleDeleteConfirmed = async (id: string) => {
    await deleteMemory(id);
    setSelectedMemoryIndex(null);
    setConfirmDeleteId(null);
  };

  // Lightbox active memory
  const activeLightboxMemory = useMemo(() => {
    if (selectedMemoryIndex === null || filteredMemories.length === 0) return null;
    return filteredMemories[selectedMemoryIndex] || null;
  }, [selectedMemoryIndex, filteredMemories]);

  const handleNextMemory = () => {
    if (selectedMemoryIndex === null || filteredMemories.length === 0) return;
    setSelectedMemoryIndex((prev) => (prev !== null && prev < filteredMemories.length - 1 ? prev + 1 : 0));
  };

  const handlePrevMemory = () => {
    if (selectedMemoryIndex === null || filteredMemories.length === 0) return;
    setSelectedMemoryIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredMemories.length - 1));
  };

  // Random Rediscovery
  const handlePickRandomMemory = () => {
    if (memories.length === 0) return;
    const available = memories.filter((m) => !randomDiscovered || m.id !== randomDiscovered.id);
    const pool = available.length > 0 ? available : memories;
    const idx = Math.floor(Math.random() * pool.length);
    setRandomDiscovered(pool[idx]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300 select-none">
      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      {/* 1. Header & Welcome Scrapbook Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#151520] via-[#12111B] to-[#151520] border border-[#2E2942] p-6 sm:p-8 overflow-hidden shadow-xl shadow-[#7863A8]/10">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#B8A4D8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#7863A8]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-light text-[#B8A4D8] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#B8A4D8]" />
              <span>Personal Digital Scrapbook</span>
              <span>·</span>
              <span>✨</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-light text-[#EAE6F2] tracking-wide">
              My Life in Little Moments
            </h1>
            <p className="text-sm font-light text-[#AAA4B8] leading-relaxed">
              Little moments, big feelings. Collecting life's quiet treasures, cherished memories, and unhurried snapshots of joy in your safe sanctuary. 💜
            </p>
          </div>

          {/* Prominent Capture Action (Take Photo & Upload Photo) */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button
              onClick={startCamera}
              disabled={isProcessing}
              className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#B8A4D8] text-[#08080C] hover:bg-[#c7b6e4] transition-all text-xs font-medium flex items-center gap-2 shadow-lg shadow-[#B8A4D8]/20 cursor-pointer disabled:opacity-50"
              title="Capture a live photo using your camera or webcam"
            >
              <Camera className="w-4 h-4 text-[#08080C]" />
              <span>Take Photo</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#1B1A28] border border-[#3B3654] text-[#EAE6F2] hover:bg-[#232136] transition-all text-xs font-medium flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-[#B8A4D8]" />
              <span>{isProcessing ? 'Processing...' : 'Upload Photo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. "On This Day" & "Remember this little moment?" Feature Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* On This Day Section */}
        {onThisDayMemories.length > 0 && (
          <div className="p-5 rounded-2xl bg-[#12111B] border border-[#2E2942] flex items-center gap-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-[#1B1A28] border border-[#2E2942] flex items-center justify-center text-[#B8A4D8] shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-light text-[#B8A4D8] uppercase tracking-wider">
                <span>On This Day in Past Years</span>
                <span>🌿</span>
              </div>
              <p className="text-xs text-[#EAE6F2] font-normal truncate mt-0.5">
                {onThisDayMemories.length} memory found from this exact date previously!
              </p>
              <p className="text-[11px] text-[#AAA4B8] font-light truncate">
                {onThisDayMemories[0].title} — {onThisDayMemories[0].date}
              </p>
            </div>
            <button
              onClick={() => {
                const idx = filteredMemories.findIndex((m) => m.id === onThisDayMemories[0].id);
                if (idx !== -1) setSelectedMemoryIndex(idx);
                else {
                  const absoluteIdx = memories.findIndex((m) => m.id === onThisDayMemories[0].id);
                  if (absoluteIdx !== -1) setSelectedMemoryIndex(absoluteIdx);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-[#1B1A28] hover:bg-[#232136] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer shrink-0"
            >
              View
            </button>
          </div>
        )}

        {/* Random Rediscovery ("Remember this little moment?") */}
        <div className="p-5 rounded-2xl bg-[#12111B] border border-[#2E2942] flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-[#1B1A28] border border-[#2E2942] flex items-center justify-center text-[#B8A4D8] shrink-0">
            <Shuffle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-light text-[#B8A4D8] uppercase tracking-wider">
              <span>Remember this little moment?</span>
              <span>💜</span>
            </div>
            <p className="text-xs text-[#EAE6F2] font-normal truncate mt-0.5">
              {randomDiscovered ? randomDiscovered.title : memories.length > 0 ? 'Click to rediscover a random memory' : 'No memories saved yet'}
            </p>
            <p className="text-[11px] text-[#AAA4B8] font-light truncate">
              {randomDiscovered ? randomDiscovered.date : 'A gentle look back'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {randomDiscovered && (
              <button
                onClick={() => {
                  const idx = filteredMemories.findIndex((m) => m.id === randomDiscovered.id);
                  if (idx !== -1) setSelectedMemoryIndex(idx);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#1B1A28] hover:bg-[#232136] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                View
              </button>
            )}
            <button
              onClick={handlePickRandomMemory}
              disabled={memories.length === 0}
              className="px-3 py-1.5 rounded-xl bg-[#B8A4D8] text-[#08080C] hover:bg-[#c7b6e4] text-xs font-medium cursor-pointer disabled:opacity-50"
            >
              Discover
            </button>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#151520] border border-[#262438] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Categories / Folders */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-light whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#B8A4D8] text-[#08080C] font-medium shadow-sm'
                  : 'bg-[#1B1A28] text-[#AAA4B8] hover:text-[#EAE6F2] border border-[#262438]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & View Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#AAA4B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search moments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-56 pl-9 pr-3 py-1.5 rounded-xl bg-[#101018] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8] focus:outline-none focus:border-[#B8A4D8]"
            />
          </div>

          <div className="flex items-center rounded-xl bg-[#101018] border border-[#262438] p-0.5">
            <button
              onClick={() => setViewMode('scrapbook')}
              className={`px-3 py-1 rounded-lg text-xs font-light transition-colors cursor-pointer ${
                viewMode === 'scrapbook' ? 'bg-[#1B1A28] text-[#B8A4D8]' : 'text-[#AAA4B8] hover:text-[#EAE6F2]'
              }`}
              title="Scrapbook Grid"
            >
              Scrapbook
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-lg text-xs font-light transition-colors cursor-pointer ${
                viewMode === 'timeline' ? 'bg-[#1B1A28] text-[#B8A4D8]' : 'text-[#AAA4B8] hover:text-[#EAE6F2]'
              }`}
              title="Timeline View"
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {/* 4. Memories Scrapbook Content Grid */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-3xl bg-[#151520] border border-[#262438] space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#1B1A28] border border-[#262438] flex items-center justify-center text-[#B8A4D8] mx-auto shadow-sm">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-normal text-[#EAE6F2]">No moments captured yet</h3>
            <p className="text-xs text-[#AAA4B8] font-light max-w-sm mx-auto">
              Start your personal scrapbook by taking an instant live photo or uploading cherished pictures from your device.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] transition-colors cursor-pointer"
            >
              Take First Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-[#1B1A28] border border-[#262438] text-[#EAE6F2] text-xs font-light hover:bg-[#222133] transition-colors cursor-pointer"
            >
              Upload Photo
            </button>
          </div>
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([dateStr, dateMemories]) => (
            <div key={dateStr} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-light tracking-widest text-[#B8A4D8] uppercase px-3 py-1 rounded-full bg-[#151520] border border-[#262438]">
                  {dateStr}
                </span>
                <div className="flex-1 h-px bg-[#262438]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {dateMemories.map((memory) => {
                  const absoluteIndex = filteredMemories.findIndex((m) => m.id === memory.id);
                  return (
                    <MemoryScrapbookCard
                      key={memory.id}
                      memory={memory}
                      onClick={() => setSelectedMemoryIndex(absoluteIndex >= 0 ? absoluteIndex : 0)}
                      onEdit={() => handleOpenEdit(memory)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((memory, index) => (
            <MemoryScrapbookCard
              key={memory.id}
              memory={memory}
              onClick={() => setSelectedMemoryIndex(index)}
              onEdit={() => handleOpenEdit(memory)}
            />
          ))}
        </div>
      )}

      {/* 5. Full-Screen Lightbox Memory Viewer with Next/Prev */}
      {activeLightboxMemory && selectedMemoryIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          {/* Previous Button */}
          <button
            onClick={handlePrevMemory}
            className="absolute left-3 sm:left-6 p-2.5 rounded-full bg-[#151520]/80 border border-[#262438] text-[#EAE6F2] hover:bg-[#222133] transition-colors z-20 cursor-pointer"
            title="Previous moment"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNextMemory}
            className="absolute right-3 sm:right-6 p-2.5 rounded-full bg-[#151520]/80 border border-[#262438] text-[#EAE6F2] hover:bg-[#222133] transition-colors z-20 cursor-pointer"
            title="Next moment"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#101018] border border-[#262438] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
            {/* Image Preview Side */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[280px] md:min-h-[480px]">
              <img
                src={activeLightboxMemory.imageSrc}
                alt={activeLightboxMemory.title}
                className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain"
              />
            </div>

            {/* Details Side */}
            <div className="w-full md:w-80 bg-[#12111B] p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#262438] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#262438]">
                  <div className="flex items-center gap-1.5 text-xs text-[#AAA4B8] font-light">
                    <Calendar className="w-3.5 h-3.5 text-[#B8A4D8]" />
                    <span>{activeLightboxMemory.date}</span>
                  </div>
                  <button
                    onClick={() => setSelectedMemoryIndex(null)}
                    className="w-7 h-7 rounded-full bg-[#1B1A28] border border-[#262438] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1B1A28] border border-[#262438] text-[#B8A4D8] inline-block font-light">
                    {activeLightboxMemory.category}
                  </span>
                  <h2 className="text-base sm:text-lg font-normal text-[#EAE6F2]">
                    {activeLightboxMemory.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-light text-[#AAA4B8] leading-relaxed whitespace-pre-line">
                    {activeLightboxMemory.caption}
                  </p>
                </div>

                {activeLightboxMemory.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#AAA4B8] font-light pt-2">
                    <MapPin className="w-3.5 h-3.5 text-[#B8A4D8]" />
                    <span>{activeLightboxMemory.location}</span>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-6 mt-6 border-t border-[#262438] flex items-center justify-between">
                <button
                  onClick={() => handleOpenEdit(activeLightboxMemory)}
                  className="px-3 py-2 rounded-xl bg-[#1B1A28] hover:bg-[#232136] border border-[#262438] text-xs font-light text-[#EAE6F2] flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#B8A4D8]" />
                  <span>Edit</span>
                </button>

                {confirmDeleteId === activeLightboxMemory.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDeleteConfirmed(activeLightboxMemory.id)}
                      className="px-3 py-2 rounded-xl bg-rose-900/60 border border-rose-500/50 text-xs font-light text-rose-200 cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1 text-xs text-[#AAA4B8] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(activeLightboxMemory.id)}
                    className="px-3 py-2 rounded-xl text-xs font-light text-[#AAA4B8] hover:text-rose-400 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Live Camera Modal */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1B1A28] border border-[#2E2942] flex items-center justify-center text-[#B8A4D8]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-normal text-[#EAE6F2]">Instant Camera</h3>
                  <p className="text-[11px] text-[#AAA4B8] font-light">Capture a quiet moment live</p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setIsCameraModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs leading-relaxed space-y-3">
                <p>{cameraError}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startCamera()}
                    className="px-3.5 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-100 text-xs font-medium cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setIsCameraModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-[#1B1A28] hover:bg-[#232136] text-[#AAA4B8] hover:text-[#EAE6F2] text-xs font-medium cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-4/3 w-full bg-black rounded-2xl overflow-hidden border border-[#2E2942]">
                  {capturedSnapshotUrl ? (
                    <img
                      src={capturedSnapshotUrl}
                      alt="Captured preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  {capturedSnapshotUrl ? (
                    <>
                      <button
                        onClick={handleRetakeSnapshot}
                        className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] hover:bg-[#232136] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#B8A4D8]" />
                        <span>Retake</span>
                      </button>
                      <button
                        onClick={handleUseCapturedPhoto}
                        className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-[#B8A4D8] text-[#08080C] hover:bg-[#c7b6e4] text-xs font-medium cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use Photo</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCaptureSnapshot}
                      disabled={isCameraStarting}
                      className="w-full min-h-[48px] px-6 py-3 rounded-2xl bg-[#B8A4D8] text-[#08080C] hover:bg-[#c7b6e4] text-xs font-medium cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Snapshot</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Staging / Batch Upload Modal */}
      {isUploadModalOpen && stagedPhotos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2E2942]">
              <div>
                <h3 className="text-base font-normal text-[#EAE6F2]">
                  Review & Save Little Moments ({stagedPhotos.length})
                </h3>
                <p className="text-xs text-[#AAA4B8] font-light mt-0.5">
                  Add captions, dates, and folder categories before adding to your scrapbook.
                </p>
              </div>
              <button
                onClick={() => {
                  setStagedPhotos([]);
                  setIsUploadModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs">
                {uploadError}
              </div>
            )}

            {/* Batch defaults bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#151520] border border-[#262438] text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-[#AAA4B8]">Default Date</label>
                <input
                  type="date"
                  value={batchDate}
                  onChange={(e) => {
                    setBatchDate(e.target.value);
                    setStagedPhotos((prev) => prev.map((p) => ({ ...p, date: e.target.value })));
                  }}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#101018] border border-[#262438] text-[#EAE6F2] text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-[#AAA4B8]">Location</label>
                <input
                  type="text"
                  value={batchLocation}
                  onChange={(e) => {
                    setBatchLocation(e.target.value);
                    setStagedPhotos((prev) => prev.map((p) => ({ ...p, location: e.target.value })));
                  }}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#101018] border border-[#262438] text-[#EAE6F2] text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-[#AAA4B8]">Category / Folder</label>
                <input
                  type="text"
                  value={batchCategory}
                  onChange={(e) => {
                    setBatchCategory(e.target.value);
                    setStagedPhotos((prev) => prev.map((p) => ({ ...p, category: e.target.value })));
                  }}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#101018] border border-[#262438] text-[#EAE6F2] text-xs"
                />
              </div>
            </div>

            {/* Staged photos list */}
            <div className="space-y-4">
              {stagedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="p-4 rounded-2xl bg-[#151520] border border-[#262438] flex flex-col sm:flex-row gap-4 items-start"
                >
                  <div className="relative aspect-4/3 w-32 rounded-xl bg-black overflow-hidden shrink-0 border border-[#262438]">
                    <img
                      src={photo.previewUrl}
                      alt="Staged preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveStagedPhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-rose-900 text-white cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <label className="text-[11px] text-[#AAA4B8] font-light">Title</label>
                      <input
                        type="text"
                        value={photo.title}
                        onChange={(e) => handleUpdateStagedField(photo.id, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-[#101018] border border-[#262438] text-xs text-[#EAE6F2] mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#AAA4B8] font-light">Caption / Feeling</label>
                      <textarea
                        rows={2}
                        value={photo.caption}
                        onChange={(e) => handleUpdateStagedField(photo.id, 'caption', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-[#101018] border border-[#262438] text-xs text-[#EAE6F2] mt-0.5 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setStagedPhotos([]);
                  setIsUploadModalOpen(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAllPhotos}
                className="px-6 py-2.5 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] cursor-pointer shadow-sm"
              >
                Save to Scrapbook ({stagedPhotos.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Edit Single Memory Modal */}
      {editingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveMemoryEdits}
            className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <h3 className="text-sm font-normal text-[#EAE6F2]">Edit Memory Details</h3>
              <button
                type="button"
                onClick={() => setEditingMemory(null)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#AAA4B8]">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101018] border border-[#262438] text-[#EAE6F2] mt-0.5"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8]">Caption / Reflection</label>
                <textarea
                  rows={3}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101018] border border-[#262438] text-[#EAE6F2] mt-0.5 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#AAA4B8]">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#101018] border border-[#262438] text-[#EAE6F2] mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#AAA4B8]">Category / Folder</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#101018] border border-[#262438] text-[#EAE6F2] mt-0.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8]">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101018] border border-[#262438] text-[#EAE6F2] mt-0.5"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMemory(null)}
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

/**
 * Aesthetic Scrapbook Memory Card component
 */
const MemoryScrapbookCard: React.FC<{
  memory: Memory;
  onClick: () => void;
  onEdit: () => void;
}> = ({ memory, onClick, onEdit }) => {
  return (
    <div
      onClick={onClick}
      className="group rounded-3xl bg-[#151520] border border-[#262438] hover:border-[#B8A4D8]/50 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col relative shadow-md hover:shadow-xl shadow-[#7863A8]/5"
    >
      <div className="relative aspect-4/3 w-full bg-[#101018] overflow-hidden">
        <img
          src={memory.imageSrc}
          alt={memory.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* Category / Folder Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 text-[10px] font-light text-[#B8A4D8] bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
            <span>{memory.category || 'Quiet Moments'}</span>
          </span>
        </div>

        {memory.location && (
          <div className="absolute bottom-3 left-3 text-[11px] font-light text-white/90 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#B8A4D8]" />
            <span className="truncate max-w-[200px]">{memory.location}</span>
          </div>
        )}

        {/* Quick Edit Overlay button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white/80 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm"
          title="Edit caption and date"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#AAA4B8] font-light">
            <span>{memory.date}</span>
            <span>✨</span>
          </div>
          <h3 className="text-sm font-normal text-[#EAE6F2] group-hover:text-[#B8A4D8] transition-colors line-clamp-1 mt-1">
            {memory.title}
          </h3>
          <p className="text-xs font-light text-[#AAA4B8] line-clamp-2 leading-relaxed mt-1">
            {memory.caption}
          </p>
        </div>

        <div className="pt-3 flex items-center justify-between border-t border-[#262438] text-[11px] text-[#AAA4B8] font-light">
          <span>Open memory</span>
          <span className="text-[#B8A4D8] group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </div>
    </div>
  );
};
