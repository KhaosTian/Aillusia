
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div 
      className="flex-1 h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden relative transition-all duration-300 ease-in-out"
    >
      {children}

      {/* 
          Modal Root for Workspace-specific overlays (History, Context Browser).
          Positioned absolute to cover only the Layout area (excluding Sidebar).
          pointer-events-none allows clicks to pass through when empty.
      */}
      <div id="workspace-modal-root" className="absolute inset-0 z-[100] pointer-events-none"></div>
    </div>
  );
};
