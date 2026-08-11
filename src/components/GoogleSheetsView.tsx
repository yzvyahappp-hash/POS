import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Code,
  FileSpreadsheet,
  Lock,
  Unlock,
  Key,
  X,
} from 'lucide-react';
import { RestaurantSettings } from '../types';
import { gasService, GOOGLE_APPS_SCRIPT_CODE, GAS_INDEX_HTML_TEMPLATE, DEFAULT_GAS_URL } from '../services/gasService';
import { useTranslation } from '../i18n/useTranslation';

interface GoogleSheetsViewProps {
  settings: RestaurantSettings;
  onUpdateSettings?: (settings: RestaurantSettings) => void;
  fullDataState?: Record<string, unknown>;
}

export const GoogleSheetsView: React.FC<GoogleSheetsViewProps> = ({
  settings,
  onUpdateSettings,
  fullDataState = {},
}) => {
  const { t } = useTranslation();
  const [gasUrl, setGasUrl] = useState(settings.gasWebAppUrl || DEFAULT_GAS_URL);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'code' | 'sync'>('guide');
  const [codeSubTab, setCodeSubTab] = useState<'gs' | 'html'>('gs');
  const [copiedHtmlCode, setCopiedHtmlCode] = useState(false);

  const handleCopyHtmlCode = () => {
    navigator.clipboard.writeText(GAS_INDEX_HTML_TEMPLATE);
    setCopiedHtmlCode(true);
    setTimeout(() => setCopiedHtmlCode(false), 2500);
  };

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setIsUnlocked(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect security password.');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestConnection = async () => {
    const targetUrl = gasUrl || DEFAULT_GAS_URL;
    setIsTesting(true);
    setTestResult(null);
    const result = await gasService.testConnection(targetUrl);
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      const updated = { ...settings, gasWebAppUrl: targetUrl, autoSyncToSheets: true };
      gasService.setScriptUrl(targetUrl);
      onUpdateSettings?.(updated);
    }
  };

  const handleSyncAll = async () => {
    const targetUrl = gasUrl || settings.gasWebAppUrl || DEFAULT_GAS_URL;
    setIsSyncing(true);
    const result = await gasService.syncAllToGoogleSheets(targetUrl, fullDataState);
    setTestResult(result);
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-gray-900 dark:text-white">
                  {t('sheets_integration_title')}
                </h1>
                {settings.gasWebAppUrl ? (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{t('sheets_active')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Not Connected</span>
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('sheets_subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : t('sync_all_now')}</span>
            </button>
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <span>sheets.new</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-4">
        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'guide'
              ? 'border-[#FF8A00] text-[#FF8A00]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Step-by-Step Integration Guide
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'code'
              ? 'border-[#FF8A00] text-[#FF8A00]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Apps Script Source Code
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'sync'
              ? 'border-[#FF8A00] text-[#FF8A00]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Connection Status & Controls
        </button>
      </div>

      {/* WEB APP URL INPUT BOX */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
            <Database className="mr-2 h-4 w-4 text-[#FF8A00]" /> Google Apps Script Web App URL
          </h3>
          {isUnlocked ? (
            <span className="inline-flex items-center space-x-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Unlock className="h-3 w-3" />
              <span>Unlocked</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Lock className="h-3 w-3" />
              <span>Fixed URL (Locked)</span>
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Deployed Google Apps Script Web App URL for synchronizing restaurant data to Google Sheets.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="url"
            value={gasUrl}
            readOnly={!isUnlocked}
            onChange={e => setGasUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className={`w-full flex-1 rounded-xl border p-2.5 text-xs font-mono transition-all ${
              !isUnlocked
                ? 'bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-300 cursor-not-allowed'
                : 'border-[#FF8A00] ring-2 ring-[#FF8A00]/20 dark:bg-gray-800 dark:text-white'
            }`}
          />
          {isUnlocked ? (
            <button
              type="button"
              onClick={() => setIsUnlocked(false)}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 shrink-0"
            >
              <Lock className="h-3.5 w-3.5 text-gray-500" />
              <span>Lock Field</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPasswordInput('');
                setPasswordError('');
                setShowPasswordModal(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0"
            >
              <Key className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Unlock URL</span>
            </button>
          )}

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-[#FF8A00] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all disabled:opacity-50 shrink-0"
          >
            {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            <span>{isTesting ? 'Testing...' : t('test_connection')}</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`mt-4 flex items-center space-x-2 rounded-xl p-3 text-xs font-medium ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Security Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                <Lock className="h-5 w-5" />
                <span>Password Required</span>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              This Web App URL is fixed by system configuration. Please enter the password to modify the URL.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  autoFocus
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-amber-500 focus:ring-amber-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {passwordError && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                  {passwordError}
                </p>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700"
                >
                  Confirm & Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: STEP BY STEP GUIDE */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden">
            <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-[#FF8A00] dark:bg-orange-950">
              1
            </span>
            <div className="flex items-center space-x-3 mb-3">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t('step_1_title')}</h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              {t('step_1_desc')}
            </p>
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-bold text-[#FF8A00] hover:underline"
            >
              <span>Open sheets.new</span> <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden">
            <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-[#FF8A00] dark:bg-orange-950">
              2
            </span>
            <div className="flex items-center space-x-3 mb-3">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                <Code className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t('step_2_title')}</h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('step_2_desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden">
            <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-[#FF8A00] dark:bg-orange-950">
              3
            </span>
            <div className="flex items-center space-x-3 mb-3">
              <div className="rounded-xl bg-purple-100 p-2 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                <Copy className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t('step_3_title')}</h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              {t('step_3_desc')}
            </p>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1.5 rounded-xl bg-[#FF8A00]/10 px-3 py-1.5 text-xs font-bold text-[#FF8A00] hover:bg-[#FF8A00]/20"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? t('copied') : t('copy')}</span>
            </button>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden">
            <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-[#FF8A00] dark:bg-orange-950">
              4
            </span>
            <div className="flex items-center space-x-3 mb-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t('step_4_title')}</h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('step_4_desc')}
            </p>
          </div>

          {/* Step 5 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden md:col-span-2 lg:col-span-2">
            <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700 dark:bg-emerald-950">
              5
            </span>
            <div className="flex items-center space-x-3 mb-3">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t('step_5_title')}</h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('step_5_desc')}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: CODE DISPLAY */}
      {activeTab === 'code' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-3">
            <div className="flex space-x-2">
              <button
                onClick={() => setCodeSubTab('gs')}
                className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  codeSubTab === 'gs'
                    ? 'bg-[#FF8A00] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                <Code className="h-4 w-4" />
                <span>Code.gs (Backend & Database API)</span>
              </button>
              <button
                onClick={() => setCodeSubTab('html')}
                className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  codeSubTab === 'html'
                    ? 'bg-[#FF8A00] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Index.html (Web App View)</span>
              </button>
            </div>

            {codeSubTab === 'gs' ? (
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all cursor-pointer"
              >
                {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedCode ? 'Copied Code.gs!' : 'Copy Code.gs'}</span>
              </button>
            ) : (
              <button
                onClick={handleCopyHtmlCode}
                className="flex items-center space-x-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-all cursor-pointer"
              >
                {copiedHtmlCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedHtmlCode ? 'Copied Index.html!' : 'Copy Index.html'}</span>
              </button>
            )}
          </div>

          {codeSubTab === 'gs' ? (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Create a file named <strong>Code.gs</strong> in Google Apps Script and paste the following code:
              </p>
              <div className="max-h-[500px] overflow-y-auto rounded-xl bg-gray-950 p-4 font-mono text-xs text-emerald-400">
                <pre className="whitespace-pre-wrap leading-relaxed">{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Create an HTML file named <strong>Index.html</strong> in Google Apps Script and paste the following code:
              </p>
              <div className="max-h-[500px] overflow-y-auto rounded-xl bg-gray-950 p-4 font-mono text-xs text-amber-300">
                <pre className="whitespace-pre-wrap leading-relaxed">{GAS_INDEX_HTML_TEMPLATE}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONTROLS & AUTO-SYNC */}
      {activeTab === 'sync' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
            <RefreshCw className="mr-2 h-4 w-4 text-[#FF8A00]" /> Real-time Synchronization Options
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <span className="text-xs font-bold text-gray-800 dark:text-white">Auto-Sync New Orders</span>
              <p className="text-[11px] text-gray-500 mt-1">
                Automatically push every completed order and payment to the 'Orders' and 'Payments' sheets immediately.
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600">Active</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <span className="text-xs font-bold text-gray-800 dark:text-white">Full Database Sync</span>
              <p className="text-[11px] text-gray-500 mt-1">
                Manually push all current menu items, tables, reservations, customers, and inventory to Google Sheets.
              </p>
              <button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="mt-3 flex items-center space-x-1.5 text-xs font-bold text-[#FF8A00] hover:underline"
              >
                <span>Run Full Sync Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
