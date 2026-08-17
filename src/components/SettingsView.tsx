import React, { useState } from 'react';
import {
  Settings,
  Database,
  Globe,
  Receipt,
  Save,
  CheckCircle,
  RefreshCw,
  Copy,
  Check,
  Lock,
  Unlock,
  Key,
  X,
  AlertCircle,
  Shield,
  RotateCcw,
  CheckCircle2,
  UserCheck,
  Clock,
  LayoutDashboard,
  Grid,
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  CreditCard,
  Calendar,
  Users,
  Package,
  BarChart3,
  Tag,
} from 'lucide-react';
import { RestaurantSettings, User, Role, ActiveTab, RolePermissions } from '../types';
import { INITIAL_SETTINGS, DEFAULT_ROLE_PERMISSIONS } from '../data/mockData';
import { gasService, GOOGLE_APPS_SCRIPT_CODE, DEFAULT_GAS_URL } from '../services/gasService';

interface SettingsViewProps {
  settings: RestaurantSettings;
  currentUser: User | null;
  onUpdateSettings: (settings: RestaurantSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings = INITIAL_SETTINGS,
  currentUser,
  onUpdateSettings,
}) => {
  const safeSettings = settings || INITIAL_SETTINGS;
  const [restaurantName, setRestaurantName] = useState(safeSettings.restaurantName || 'ZestPOS');
  const [address, setAddress] = useState(safeSettings.address || '');
  const [phone, setPhone] = useState(safeSettings.phone || '');
  const [currencySymbol, setCurrencySymbol] = useState(safeSettings.currencySymbol || '$');
  const [taxRate, setTaxRate] = useState(safeSettings.taxRate ?? 8.5);
  const [serviceChargeRate, setServiceChargeRate] = useState(safeSettings.serviceChargeRate ?? 10);
  const [gasUrl, setGasUrl] = useState(safeSettings.gasWebAppUrl || DEFAULT_GAS_URL);
  const [theme, setTheme] = useState<'light' | 'dark'>(safeSettings.theme || 'light');

  const [copiedCode, setCopiedCode] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Role Permissions State
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(
    safeSettings.rolePermissions || DEFAULT_ROLE_PERMISSIONS
  );
  const [selectedRole, setSelectedRole] = useState<Role>('Manager');
  const [permSuccessMsg, setPermSuccessMsg] = useState<string | null>(null);

  const rolesList: Role[] = ['Admin', 'Manager', 'Cashier', 'Waiter', 'Kitchen Staff'];

  const allFunctionTabs: { id: ActiveTab; label: string; desc: string; icon: React.ElementType }[] = [
    { id: 'landing', label: 'Public Web Page', desc: 'Public digital menu and restaurant web landing page', icon: Globe },
    { id: 'dashboard', label: 'Executive Dashboard', desc: 'High-level restaurant metrics, daily revenue and overview stats', icon: LayoutDashboard },
    { id: 'floorplan', label: 'Floor Plan & Tables', desc: 'Interactive table map, zone management and live table status', icon: Grid },
    { id: 'menu', label: 'Menu Management', desc: 'Add/edit menu dishes, prices, categories, and stock availability', icon: UtensilsCrossed },
    { id: 'orders', label: 'Order Management', desc: 'Create dine-in, takeaway and delivery orders, edit active orders', icon: ShoppingBag },
    { id: 'receipts', label: 'Receipt History', desc: 'View completed consumption receipts and transaction history', icon: Receipt },
    { id: 'kds', label: 'Kitchen Display (KDS)', desc: 'Kitchen order prep queue, ticket bump bar and timer alerts', icon: ChefHat },
    { id: 'checkout', label: 'POS Cashier Checkout', desc: 'Process payments, cash register, discount coupons and receipt printing', icon: CreditCard },
    { id: 'reservations', label: 'Table Reservations', desc: 'Guest table booking management and customer seating', icon: Calendar },
    { id: 'customers', label: 'Customer Directory', desc: 'Customer CRM, loyalty points, coupons and visit logs', icon: Users },
    { id: 'promos', label: 'Promos & Coupons', desc: 'Automatic combo rules, special deals and customer discount vouchers', icon: Tag },
    { id: 'inventory', label: 'Inventory & Stock', desc: 'Raw material stock management, ingredient alerts and supplier list', icon: Package },
    { id: 'staff', label: 'Staff Roster & Management', desc: 'Employee profiles, hourly wages, clock-in status and security PINs', icon: UserCheck },
    { id: 'logs', label: 'Staff Clock-In & Logs', desc: 'Clock in/out shift attendance and user activity audit logs', icon: Clock },
    { id: 'analytics', label: 'Business Analytics', desc: 'Revenue breakdown charts, hourly peak sales and top selling dishes', icon: BarChart3 },
    { id: 'settings', label: 'POS & Role Settings', desc: 'Configure store profile, tax rates, theme and role permissions', icon: Settings },
    { id: 'gas', label: 'Google Sheets Integration', desc: 'Live spreadsheet database syncing and Apps Script configuration', icon: Database },
  ];

  const handleToggleFunction = (tabId: ActiveTab) => {
    setRolePermissions(prev => {
      const currentList = prev[selectedRole] || [];
      const updatedList = currentList.includes(tabId)
        ? currentList.filter(id => id !== tabId)
        : [...currentList, tabId];

      return {
        ...prev,
        [selectedRole]: updatedList,
      };
    });
  };

  const handleSelectAllFunctions = () => {
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: allFunctionTabs.map(f => f.id),
    }));
  };

  const handleDeselectAllFunctions = () => {
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: [],
    }));
  };

  const handleResetRoleDefaults = () => {
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: DEFAULT_ROLE_PERMISSIONS[selectedRole] || [],
    }));
  };

  const handleSavePermissions = () => {
    const updatedSettings: RestaurantSettings = {
      ...safeSettings,
      rolePermissions,
    };
    onUpdateSettings(updatedSettings);
    setPermSuccessMsg(`Permissions for role "${selectedRole}" saved successfully!`);
    setTimeout(() => setPermSuccessMsg(null), 3500);
  };

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUrl = gasUrl || DEFAULT_GAS_URL;
    const updated: RestaurantSettings = {
      ...safeSettings,
      restaurantName,
      address,
      phone,
      currencySymbol,
      taxRate: Number(taxRate),
      serviceChargeRate: Number(serviceChargeRate),
      gasWebAppUrl: targetUrl,
      theme,
    };
    gasService.setScriptUrl(targetUrl);
    onUpdateSettings(updated);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestGasConnection = async () => {
    setTestResult('Connecting...');
    const targetUrl = gasUrl || DEFAULT_GAS_URL;
    gasService.setScriptUrl(targetUrl);
    const res = await gasService.testConnection(targetUrl);
    if (res.success) {
      setTestResult(res.message || 'Successfully connected to Google Sheet!');
    } else {
      setTestResult(res.message || 'Failed to reach Google Apps Script endpoint.');
    }
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
          <Settings className="mr-2 h-6 w-6 text-[#FF8A00]" /> POS System & Database Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Configure tax rates, receipt branding, and Google Apps Script / Sheets database sync
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Restaurant Configuration Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-extrabold text-gray-900 text-sm dark:text-white mb-4">
            Restaurant & Tax Profile
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Restaurant Name</label>
              <input
                type="text"
                value={restaurantName}
                onChange={e => setRestaurantName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={e => setTaxRate(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Theme Mode</label>
                <select
                  value={theme}
                  onChange={e => setTheme(e.target.value as 'light' | 'dark')}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="light">Light Mode ☀️</option>
                  <option value="dark">Dark Mode 🌙</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">
                Cash Payment Entry Mode (POS Checkout)
              </label>
              <select
                value={safeSettings.cashInputMode || 'keypad'}
                onChange={e => onUpdateSettings({ ...safeSettings, cashInputMode: e.target.value as 'typed' | 'keypad' })}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="keypad">iPad Touch Keypad (Press 1-0-0 Buttons for $100)</option>
                <option value="typed">Computer Typed (Keyboard Type Input)</option>
              </select>
              <p className="mt-1 text-[10px] text-gray-400">
                Choose touchscreen keypad buttons for tablets/iPads or standard keyboard typing for desktop PCs.
              </p>
            </div>

            <button
              type="submit"
              className="flex items-center space-x-2 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
            >
              <Save className="h-4 w-4" />
              <span>Save Restaurant Settings</span>
            </button>
          </form>
        </div>

        {/* Google Sheets Backend Sync */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-gray-900 text-sm dark:text-white flex items-center">
              <Database className="mr-2 h-4 w-4 text-[#FF8A00]" /> Google Sheets Backend Integration
            </h3>
            {isUnlocked ? (
              <span className="inline-flex items-center space-x-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <Unlock className="h-3 w-3" />
                <span>Unlocked</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Lock className="h-3 w-3" />
                <span>Fixed (Locked)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Connect your Google Apps Script Web App URL to turn your Google Sheet into a live POS database.
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">Google Apps Script Web App URL</label>
                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => setIsUnlocked(false)}
                    className="text-[11px] font-bold text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <Lock className="h-3 w-3 mr-1" /> Lock
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordInput('');
                      setPasswordError('');
                      setShowPasswordModal(true);
                    }}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center"
                  >
                    <Key className="h-3 w-3 mr-1" /> Unlock URL
                  </button>
                )}
              </div>
              <input
                type="url"
                readOnly={!isUnlocked}
                placeholder="https://script.google.com/macros/s/.../exec"
                value={gasUrl}
                onChange={e => setGasUrl(e.target.value)}
                className={`w-full rounded-xl border p-2.5 text-xs font-mono transition-all ${
                  !isUnlocked
                    ? 'bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-300 cursor-not-allowed'
                    : 'border-[#FF8A00] ring-2 ring-[#FF8A00]/20 dark:bg-gray-800 dark:text-white'
                }`}
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleTestGasConnection}
                className="flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#FF8A00]" />
                <span>Test Connection</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-gray-500" />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Apps Script Code'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`rounded-xl p-3 text-xs font-semibold ${
                  testResult.includes('Successfully')
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {testResult}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) & Function Permissions Manager */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base dark:text-white flex items-center">
              <Shield className="mr-2 h-5 w-5 text-[#FF8A00]" /> Role-Based Access Control (RBAC) & Function Permissions
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select any role below to customize which tabs and functions employees with that role can access.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetRoleDefaults}
              className="flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors cursor-pointer"
              title="Reset selected role to recommended defaults"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSavePermissions}
              className="flex items-center space-x-1.5 rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Role Permissions</span>
            </button>
          </div>
        </div>

        {permSuccessMsg && (
          <div className="mb-5 flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{permSuccessMsg}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {rolesList.map(r => {
            const isSelected = selectedRole === r;
            const allowedCount = (rolePermissions[r] || []).length;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF8A00] text-white shadow-md scale-102'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span>{r}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {allowedCount}/{allFunctionTabs.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Header Bar for Selected Role */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl mb-4 border border-gray-200 dark:border-gray-700/80">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Configuring Access For</span>
            <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center space-x-2">
              <span className="text-[#FF8A00]">{selectedRole}</span>
              <span className="text-gray-400 font-normal">
                ({(rolePermissions[selectedRole] || []).length} of {allFunctionTabs.length} functions enabled)
              </span>
            </h4>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSelectAllFunctions}
              className="text-xs font-bold text-[#FF8A00] hover:underline cursor-pointer"
            >
              Select All
            </button>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <button
              type="button"
              onClick={handleDeselectAllFunctions}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Function Permissions Toggles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allFunctionTabs.map(func => {
            const Icon = func.icon;
            const isAllowed = (rolePermissions[selectedRole] || []).includes(func.id);

            return (
              <div
                key={func.id}
                onClick={() => handleToggleFunction(func.id)}
                className={`group flex items-start justify-between rounded-xl border p-3.5 transition-all cursor-pointer ${
                  isAllowed
                    ? 'border-amber-300 bg-amber-500/5 hover:bg-amber-500/10 dark:border-amber-800 dark:bg-amber-950/20'
                    : 'border-gray-200 bg-gray-50/50 opacity-60 hover:opacity-100 dark:border-gray-800 dark:bg-gray-800/40'
                }`}
              >
                <div className="flex items-start space-x-3 pr-2">
                  <div
                    className={`mt-0.5 rounded-lg p-2 ${
                      isAllowed
                        ? 'bg-[#FF8A00] text-white'
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center space-x-1.5">
                      <span>{func.label}</span>
                      {isAllowed ? (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Allowed
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-black text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Blocked
                        </span>
                      )}
                    </h5>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                      {func.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={isAllowed}
                    onChange={() => {}}
                    className="h-4 w-4 rounded-md border-gray-300 text-[#FF8A00] focus:ring-[#FF8A00] cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Password Modal */}
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
    </div>
  );
};
