import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

export default function SecurityWrapper({ children }: SecurityWrapperProps) {
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    // 1. Disable context menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable common keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        return false;
      }

      // Disable PrintScreen - Note: Hard to catch on all platforms, but helpful
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText(''); // Clear clipboard
        alert('Screenshots are disabled for security reasons.');
        e.preventDefault();
      }
    };

    // 3. Detect focus loss (for Snipping Tools / Win+Shift+S)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsSecure(false);
      } else {
        setIsSecure(true);
      }
    };

    const handleBlur = () => {
      setIsSecure(false);
    };

    const handleFocus = () => {
      setIsSecure(true);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className="relative min-h-screen no-select">
      {/* Content */}
      <div className="transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
