import React, { useState } from 'react';
import { Phone, Delete, X, Hash } from 'lucide-react';

interface PhoneKeypadProps {
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const KEYPAD_BUTTONS = [
  { num: '1', sub: '' },
  { num: '2', sub: 'ABC' },
  { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' },
  { num: '5', sub: 'JKL' },
  { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' },
  { num: '8', sub: 'TUV' },
  { num: '9', sub: 'WXYZ' },
  { num: '*', sub: '' },
  { num: '0', sub: '+' },
  { num: '#', sub: '' },
];

export const PhoneKeypadInput: React.FC<PhoneKeypadProps> = ({
  value,
  onChange,
  label = 'Phone Number',
  placeholder = '0912-345-678',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyPress = (char: string) => {
    onChange(value + char);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const handleQuickPrefix = (prefix: string) => {
    if (!value.startsWith(prefix)) {
      onChange(prefix + value.replace(/^09/, ''));
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`text-xs px-2 py-0.5 rounded-md font-bold transition-all flex items-center space-x-1 border ${
              isOpen
                ? 'bg-[#FF8A00] text-white border-[#FF8A00] shadow-xs'
                : 'bg-orange-50 text-[#FF8A00] border-orange-200 hover:bg-orange-100 dark:bg-gray-800 dark:border-gray-700 dark:text-orange-400'
            }`}
          >
            <Phone className="w-3 h-3" />
            <span>{isOpen ? '收起撥號盤' : '📱 電話撥號盤'}</span>
          </button>
        </div>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-gray-200 p-2 pr-10 text-xs font-mono font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]/50"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="開啟電話撥號鍵盤"
          className="absolute right-2 p-1 text-gray-400 hover:text-[#FF8A00] transition-colors"
        >
          <Phone className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 p-5 sm:p-6 rounded-3xl bg-slate-950/98 text-white shadow-2xl border-2 border-slate-700/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50 w-full min-w-[320px] sm:min-w-[420px] max-w-xl mx-auto select-none">
          {/* Header & Number Display */}
          <div className="pb-3 mb-3 border-b border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                <span className="text-xs font-black tracking-wide text-slate-200">店員電話撥號盤 (Dial Pad)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-colors cursor-pointer active:scale-95"
                >
                  清空 (Clear)
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Display Box */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 font-mono text-lg sm:text-2xl font-black text-amber-400 tracking-wider shadow-inner min-h-[46px]">
              <span className="truncate">{value || <span className="text-slate-600 text-sm font-sans font-medium">請按鍵盤輸入號碼...</span>}</span>
              {value && (
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                  title="退格"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Prefixes */}
          <div className="flex items-center flex-wrap gap-2 mb-3.5">
            <span className="text-xs text-slate-400 font-bold">快速號碼:</span>
            <button
              type="button"
              onClick={() => handleQuickPrefix('09')}
              className="px-3 py-1 text-xs font-black rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 active:scale-95 transition-all cursor-pointer"
            >
              +09 (台灣手機)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrefix('02')}
              className="px-3 py-1 text-xs font-black rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              02 (市話)
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('-')}
              className="px-3 py-1 text-xs font-black rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              - (分隔號)
            </button>
          </div>

          {/* Keypad Grid 3x4 */}
          <div className="grid grid-cols-3 gap-3 w-full mx-auto">
            {KEYPAD_BUTTONS.map(({ num, sub }) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="group relative flex flex-col items-center justify-center h-16 sm:h-20 rounded-2xl bg-slate-800/90 hover:bg-[#FF8A00] hover:text-slate-950 text-white font-semibold transition-all active:scale-95 shadow-lg border border-slate-700/80 cursor-pointer select-none touch-manipulation"
              >
                <span className="text-2xl sm:text-3xl font-black leading-none">{num}</span>
                {sub ? (
                  <span className="text-[10px] font-extrabold tracking-widest text-slate-400 group-hover:text-slate-950 mt-1">
                    {sub}
                  </span>
                ) : (
                  <span className="h-3 mt-1" />
                )}
              </button>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBackspace}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 text-slate-200 text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Delete className="w-4 h-4" />
              <span>倒退刪除</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black transition-all active:scale-95 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              完成輸入 (Done)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
