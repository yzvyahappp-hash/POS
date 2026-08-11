import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Clock,
  UserCheck,
  UserX,
  PlusCircle,
  Moon,
  Sun,
  Database,
  Globe,
  Keyboard,
  QrCode,
  LogOut,
} from 'lucide-react';
import { User, NotificationItem, RestaurantSettings } from '../types';
import { INITIAL_SETTINGS } from '../data/mockData';
import { useTranslation } from '../i18n/useTranslation';
import { Language } from '../i18n/translations';

interface HeaderProps {
  currentUser?: User | null;
  settings?: RestaurantSettings;
  notifications?: NotificationItem[];
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onOpenSearch?: () => void;
  onOpenShortcuts?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onOpenNewOrder?: () => void;
  onOpenGasModal?: () => void;
  onToggleTheme?: () => void;
  onToggleClockIn?: () => void;
  onMarkNotificationRead?: (id: string) => void;
  onLaunchCustomerMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser = null,
  settings = INITIAL_SETTINGS,
  notifications = [],
  isDarkMode = false,
  onToggleDarkMode,
  onOpenSearch,
  onOpenShortcuts,
  onOpenAuth,
  onLogout,
  onOpenNewOrder,
  onOpenGasModal,
  onToggleTheme,
  onToggleClockIn,
  onMarkNotificationRead,
  onLaunchCustomerMode,
}) => {
  const { lang, changeLanguage, t } = useTranslation();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const locale = lang === 'en' ? 'en-US' : 'zh-CN';
      setCurrentTime(
        now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Taipei' }) +
          ' | ' +
          now.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Taipei' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const safeNotifications = notifications || [];
  const safeSettings = settings || INITIAL_SETTINGS;
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const handleToggleTheme = () => {
    if (onToggleTheme) onToggleTheme();
    else if (onToggleDarkMode) onToggleDarkMode();
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-[72px] w-full items-center justify-end border-b border-gray-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/95">
      {/* Right: Search, Connection Status & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={() => onOpenSearch?.()}
          className="flex items-center space-x-2 rounded-xl border border-[#E5E7EB] bg-gray-50 px-3.5 py-2 text-xs text-gray-500 transition-colors hover:border-[#FF8A00] hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:w-60"
          title="Search (Press / or Ctrl+K)"
        >
          <Search className="h-4 w-4 text-gray-400" />
          <span className="truncate">{t('search_placeholder')}</span>
          <kbd className="hidden rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 sm:inline-block dark:bg-gray-700 dark:text-gray-300">
            Ctrl+K
          </kbd>
        </button>

        {/* Backend Connection Status Badge */}
        <button
          onClick={() => onOpenGasModal?.()}
          className={`flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            safeSettings.gasWebAppUrl
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span className="hidden md:inline">
            {safeSettings.gasWebAppUrl ? t('sheets_active') : t('connect_sheets')}
          </span>
        </button>

        {/* Quick New Order Button */}
        <button
          onClick={() => onOpenNewOrder?.()}
          className="btn-orange flex items-center space-x-1.5 text-xs active:scale-95 shadow-xs"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{t('new_order')}</span>
        </button>

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-1 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            title="Change Language"
          >
            <Globe className="h-4 w-4 text-[#FF8A00]" />
            <span className="uppercase">{lang}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    changeLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    lang === l.code
                      ? 'bg-orange-50 text-[#FF8A00] dark:bg-orange-950/40'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Button */}
        <button
          onClick={() => onOpenShortcuts?.()}
          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          title="Keyboard Shortcuts (Shift+?)"
        >
          <Keyboard className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={handleToggleTheme}
          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          title="Toggle Dark Mode"
        >
          {isDarkMode || safeSettings.theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  Notifications ({safeNotifications.length})
                </span>
                <span className="text-[10px] text-gray-400">Live alerts</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 py-1 dark:divide-gray-800">
                {safeNotifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-gray-400">No new notifications</p>
                ) : (
                  safeNotifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead?.(n.id)}
                      className={`cursor-pointer py-2 px-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                        !n.read ? 'bg-orange-50/40 dark:bg-orange-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Clock In/Out */}
        {currentUser ? (
          <div className="flex items-center space-x-2 border-l border-gray-200 pl-3 dark:border-gray-800">
            <button
              onClick={() => onToggleClockIn?.()}
              className={`flex items-center space-x-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                currentUser.isClockedIn
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
              title={currentUser.isClockedIn ? 'Click to Clock Out' : 'Click to Clock In'}
            >
              {currentUser.isClockedIn ? (
                <>
                  <UserCheck className="h-3 w-3 text-emerald-600" />
                  <span className="hidden sm:inline">Clocked In</span>
                </>
              ) : (
                <>
                  <UserX className="h-3 w-3 text-rose-600" />
                  <span className="hidden sm:inline">Clocked Out</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuth?.()}
                className="flex items-center space-x-2 rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Switch Staff Profile or Edit Account"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                />
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-none">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-[#FF8A00] font-medium leading-tight mt-0.5">
                    {currentUser.role}
                  </p>
                </div>
              </button>

              <button
                onClick={() => onLogout?.()}
                className="flex items-center space-x-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300 transition-all shadow-2xs"
                title="Log Out & Lock Terminal"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <span className="hidden md:inline">Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth?.()}
            className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
          >
            Sign In to Staff POS
          </button>
        )}
      </div>
    </header>
  );
};

