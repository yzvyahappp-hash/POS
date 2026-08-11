import React from 'react';
import { Keyboard, X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keyCombo: 'Ctrl + Shift + N  /  Ctrl + O', label: 'Create New Order / Open Order Screen', category: 'Orders' },
    { keyCombo: 'Ctrl + K  /  Ctrl + S', label: 'Global Search (Orders, Menu, Tables, Bookings)', category: 'Search' },
    { keyCombo: 'Ctrl + D', label: 'Go to Main Dashboard', category: 'Navigation' },
    { keyCombo: 'Ctrl + M', label: 'Go to Menu Catalog', category: 'Navigation' },
    { keyCombo: 'Ctrl + F', label: 'Go to Floor Plan & Table Layout', category: 'Navigation' },
    { keyCombo: 'Ctrl + R', label: 'Go to Reservations & Bookings', category: 'Navigation' },
    { keyCombo: 'Ctrl + Shift + S', label: 'Go to Google Sheets Settings', category: 'Settings' },
    { keyCombo: 'Shift + ?', label: 'Open Keyboard Shortcuts Help Cheat Sheet', category: 'Help' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5 text-[#FF8A00]" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              POS Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Use these keyboard shortcuts anywhere in the POS app to navigate quickly.
          </p>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {shortcuts.map((sc, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-3 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/40"
              >
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {sc.label}
                </span>
                <span className="rounded-lg bg-white border border-gray-200 px-2.5 py-1 font-mono text-xs font-bold text-[#FF8A00] shadow-2xs dark:bg-gray-900 dark:border-gray-700">
                  {sc.keyCombo}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-center dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#FF8A00] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
