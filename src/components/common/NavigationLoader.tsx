import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const NavigationLoader: React.FC = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showSlowNotice, setShowSlowNotice] = useState(false);

  const timerRef = useRef<number | null>(null);
  const slowTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing timers
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (slowTimerRef.current) window.clearTimeout(slowTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);

    // Start progress
    setIsVisible(true);
    setProgress(25);
    setShowSlowNotice(false);

    // Simulate progressive loading steps
    const step1 = window.setTimeout(() => setProgress(60), 80);
    const step2 = window.setTimeout(() => setProgress(85), 180);

    // If still in progress after 250ms, show "Đang tải trang..." notice
    slowTimerRef.current = window.setTimeout(() => {
      setShowSlowNotice(true);
    }, 250);

    // Complete progress
    const completeTimer = window.setTimeout(() => {
      setProgress(100);
      hideTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        setShowSlowNotice(false);
        setProgress(0);
      }, 250);
    }, 380);

    return () => {
      window.clearTimeout(step1);
      window.clearTimeout(step2);
      window.clearTimeout(completeTimer);
      if (slowTimerRef.current) window.clearTimeout(slowTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [location.pathname, location.search]);

  if (!isVisible && !showSlowNotice) return null;

  return (
    <>
      {/* Top Slim Progress Bar */}
      {isVisible && (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3px] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#1C1A18] transition-all duration-200 ease-out shadow-[0_0_10px_rgba(16,185,129,0.7)]"
            style={{
              width: `${progress}%`,
              opacity: progress === 100 ? 0 : 1,
              transition: progress === 100 ? 'width 0.15s ease-out, opacity 0.25s 0.1s ease-in' : 'width 0.2s ease-out',
            }}
          />
        </div>
      )}

      {/* Floating Slow Loading Pill */}
      {showSlowNotice && (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none animate-fade-in flex items-center gap-2.5 bg-[#1C1A18]/95 text-white px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md text-xs font-medium border border-white/10">
          <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Đang tải nội dung...</span>
        </div>
      )}
    </>
  );
};
