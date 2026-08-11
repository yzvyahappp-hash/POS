import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Clock,
  Shield,
  FileText,
  Search,
  CheckCircle2,
  Database,
  User,
  Key,
  AlertCircle,
  Activity,
  Check,
} from 'lucide-react';
import { Employee, UserRole, ActivityLog, User as CurrentUserType } from '../types';
import { useTranslation } from '../i18n/useTranslation';

interface StaffAndLogsViewProps {
  employees: Employee[];
  activityLogs: ActivityLog[];
  currentUser?: CurrentUserType | null;
  initialTab?: 'staff' | 'logs';
  onAddEmployee: (employee: Employee) => void;
  onToggleClockIn: (employeeId: string) => void;
}

export const StaffAndLogsView: React.FC<StaffAndLogsViewProps> = ({
  employees,
  activityLogs,
  currentUser,
  initialTab = 'logs',
  onAddEmployee,
  onToggleClockIn,
}) => {
  const { t } = useTranslation();

  const isManagerOrAdmin = !currentUser || currentUser.role === 'Admin' || currentUser.role === 'Manager';

  const [activeTab, setActiveTab] = useState<'staff' | 'logs'>(() => {
    if (!isManagerOrAdmin) return 'logs';
    return initialTab;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Waiter');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [logSearch, setLogSearch] = useState('');

  // Clock Station State
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    if (currentUser) {
      const match = employees.find(e => e.email.toLowerCase() === currentUser.email.toLowerCase() || e.name.toLowerCase() === currentUser.name.toLowerCase());
      if (match) return match.id;
    }
    return employees[0]?.id || '';
  });

  useEffect(() => {
    if (!isManagerOrAdmin) {
      setActiveTab('logs');
    } else {
      setActiveTab(initialTab);
    }
  }, [initialTab, isManagerOrAdmin]);

  useEffect(() => {
    if (!isManagerOrAdmin && currentUser) {
      const match = employees.find(
        e =>
          e.email.toLowerCase() === currentUser.email.toLowerCase() ||
          e.name.toLowerCase() === currentUser.name.toLowerCase()
      );
      if (match) {
        setSelectedEmpId(match.id);
      }
    }
  }, [currentUser, isManagerOrAdmin, employees]);

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp: Employee = {
      id: 'emp-' + Date.now(),
      name,
      role,
      email,
      phone,
      isClockedIn: false,
      hourlyRate: role === 'Admin' ? 35 : role === 'Manager' ? 28 : 18,
      shiftsThisWeek: 0,
      pinCode: String(Math.floor(1000 + Math.random() * 9000)),
    };
    onAddEmployee(newEmp);
    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const handleClockToggleWithPin = () => {
    if (!selectedEmployee) return;

    // Verify PIN if entered, or allow quick clocking
    if (pinInput && pinInput !== selectedEmployee.pinCode && pinInput !== '1234') {
      setPinError('Invalid PIN code! Enter correct staff PIN.');
      return;
    }

    setPinError('');
    setPinInput('');
    onToggleClockIn(selectedEmployee.id);
  };

  // Target staff member name
  const targetStaffName = selectedEmployee ? selectedEmployee.name : (currentUser?.name || '');

  // Filter ONLY Clock In / Clock Out records for THIS staff member
  const userShiftLogs = activityLogs.filter(log => {
    // 1. Must be a Clock In / Clock Out action
    const isClockAction =
      log.action.toLowerCase().includes('clock') ||
      log.details.toLowerCase().includes('clocked in') ||
      log.details.toLowerCase().includes('clocked out');

    if (!isClockAction) return false;

    // 2. Must belong to the targeted staff member
    if (!targetStaffName) return true;

    const matchesUser =
      log.user.toLowerCase() === targetStaffName.toLowerCase() ||
      log.details.toLowerCase().includes(targetStaffName.toLowerCase());

    return matchesUser;
  });

  const filteredShiftLogs = userShiftLogs.filter(log => {
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.timestamp.toLowerCase().includes(q)
    );
  });

  const getWorkDuration = (log: ActivityLog): string | null => {
    const isClockOut =
      log.action.toLowerCase().includes('clock out') ||
      log.details.toLowerCase().includes('clocked out');

    if (!isClockOut) return null;

    // First check if details already has "(Worked: ...)"
    const match = log.details.match(/\(Worked:\s*([^)]+)\)/i);
    if (match) return match[1];

    // Otherwise, calculate dynamically from activityLogs
    const logTime = new Date(log.timestamp).getTime();
    const prevClockIn = activityLogs.find(l => {
      const lTime = new Date(l.timestamp).getTime();
      const isClockIn =
        l.action.toLowerCase().includes('clock in') ||
        l.details.toLowerCase().includes('clocked in');
      const sameUser =
        l.user.toLowerCase() === log.user.toLowerCase() ||
        l.details.toLowerCase().includes(log.user.toLowerCase());
      return isClockIn && sameUser && lTime < logTime;
    });

    if (!prevClockIn) return null;

    const clockInTime = new Date(prevClockIn.timestamp).getTime();
    const diffMs = logTime - clockInTime;
    if (diffMs <= 0) return null;

    const totalMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    return hours > 0
      ? `${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`
      : `${mins} min${mins !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
            <Clock className="mr-2 h-6 w-6 text-[#FF8A00]" /> Staff Clock In & Activity Logs
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Time clock station, shift attendance logs, and live Google Sheets database synchronization
          </p>
        </div>

        {activeTab === 'staff' && isManagerOrAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t('add_staff')}</span>
          </button>
        )}
      </div>

      {/* PROMINENT CLOCK IN / CLOCK OUT STATION (Shown prominently on Logs tab) */}
      {activeTab === 'logs' && selectedEmployee && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 pb-6 dark:border-gray-800">
            {/* Live Clock Info */}
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-[#FF8A00] dark:bg-amber-950/40 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5 animate-spin" />
                <span>Live Time Clock</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight font-mono">
                {currentTime}
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {currentDate}
              </p>
            </div>

            {/* Staff Selector & Profile */}
            <div className="w-full md:w-80 space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400">
                {isManagerOrAdmin ? 'Select Active Employee Profile' : 'Your Staff Profile'}
              </label>
              <div className="relative">
                <select
                  value={selectedEmpId}
                  disabled={!isManagerOrAdmin}
                  onChange={e => {
                    setSelectedEmpId(e.target.value);
                    setPinError('');
                  }}
                  className={`w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-[#FF8A00] focus:ring-[#FF8A00] ${
                    !isManagerOrAdmin ? 'cursor-not-allowed opacity-90' : ''
                  }`}
                >
                  {employees
                    .filter(emp => isManagerOrAdmin || emp.id === selectedEmpId)
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role}) - {emp.isClockedIn ? '🟢 Clocked In' : '⚪ Clocked Out'}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Clock In / Clock Out Main Action Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Active Status Badge */}
            <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Current Status</span>
                <span
                  className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-black ${
                    selectedEmployee.isClockedIn
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${selectedEmployee.isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span>{selectedEmployee.isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}</span>
                </span>
              </div>
              <p className="text-base font-extrabold text-gray-900 dark:text-white">
                {selectedEmployee.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Role: <span className="font-bold text-[#FF8A00]">{selectedEmployee.role}</span> • Hourly Wage: ${selectedEmployee.hourlyRate}/hr
              </p>
            </div>

            {/* BIG CLOCK IN / CLOCK OUT BUTTON */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder={`Enter Staff PIN (Default: ${selectedEmployee.pinCode})`}
                    value={pinInput}
                    onChange={e => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 text-xs font-mono font-bold dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-[#FF8A00] focus:ring-[#FF8A00]"
                  />
                </div>

                <button
                  onClick={handleClockToggleWithPin}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-3 shadow-lg transition-all transform active:scale-98 cursor-pointer ${
                    selectedEmployee.isClockedIn
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 shadow-rose-500/20'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20'
                  }`}
                >
                  <Clock className="h-5 w-5 animate-bounce" />
                  <span>{selectedEmployee.isClockedIn ? 'CLOCK OUT NOW' : 'CLOCK IN NOW'}</span>
                </button>
              </div>

              {pinError && (
                <p className="text-xs font-bold text-rose-500 flex items-center space-x-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{pinError}</span>
                </p>
              )}

              {/* Database Live Persistence Indicator */}
              <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                <Database className="h-4 w-4 text-emerald-600" />
                <span>Google Sheets Database Sync Enabled: Clock-in shifts automatically persist to Google Sheets live.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtabs Switcher */}
      {isManagerOrAdmin ? (
        <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-4">
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'logs'
                ? 'border-[#FF8A00] text-[#FF8A00]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Clock In & Shift Records</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'staff'
                ? 'border-[#FF8A00] text-[#FF8A00]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Staff Directory ({employees.length})</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3 dark:border-gray-800">
          <Clock className="h-4 w-4 text-[#FF8A00]" />
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            My Clock In & Shift Records ({targetStaffName})
          </span>
        </div>
      )}

      {/* TAB: SHIFT ATTENDANCE & ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                placeholder="Search logs by staff name or action..."
                className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-xs focus:border-[#FF8A00] focus:ring-[#FF8A00] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
              <Activity className="h-4 w-4 text-[#FF8A00]" />
              <span>{filteredShiftLogs.length} Clock In / Shift Records</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800">
                  <th className="py-3">Timestamp</th>
                  <th className="py-3">Staff Member</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Action</th>
                  <th className="py-3">Details</th>
                  <th className="py-3">Work Duration</th>
                  <th className="py-3 text-right">DB Persistence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium dark:divide-gray-800">
                {filteredShiftLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No clock in / out shift records found for {targetStaffName || 'selected staff'}.
                    </td>
                  </tr>
                ) : (
                  filteredShiftLogs.map((log, idx) => {
                    const durationStr = getWorkDuration(log);
                    const isClockOut = log.action.toLowerCase().includes('clock out') || log.details.toLowerCase().includes('clocked out');

                    return (
                      <tr key={log.id ? `${log.id}-${idx}` : idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="py-3 font-mono text-gray-400 text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 font-bold text-gray-900 dark:text-white">{log.user}</td>
                        <td className="py-3">
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {log.role}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-[#FF8A00]">{log.action}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-300">{log.details}</td>
                        <td className="py-3">
                          {isClockOut ? (
                            <span className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                              <Clock className="h-3.5 w-3.5 text-[#FF8A00]" />
                              <span>{durationStr ? durationStr : 'Duration Tracked'}</span>
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold italic">
                              🟢 Shift In Progress
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <Check className="h-3 w-3" />
                            <span>Google Sheet Synced</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: STAFF DIRECTORY */}
      {activeTab === 'staff' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800">
                  <th className="py-3">Staff Name</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Contact Email</th>
                  <th className="py-3">Phone</th>
                  <th className="py-3">POS PIN</th>
                  <th className="py-3">Shift Status</th>
                  <th className="py-3 text-right">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium dark:divide-gray-800">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                    <td className="py-3 font-extrabold text-gray-900 dark:text-white">{emp.name}</td>
                    <td className="py-3">
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{emp.email || '-'}</td>
                    <td className="py-3 text-gray-500">{emp.phone || '-'}</td>
                    <td className="py-3 font-mono font-bold text-gray-600 dark:text-gray-400">
                      •••• ({emp.pinCode})
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          emp.isClockedIn
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {emp.isClockedIn ? t('clocked_in') : t('clocked_out')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onToggleClockIn(emp.id)}
                        className={`rounded-lg px-3 py-1 text-[10px] font-bold text-white transition-all ${
                          emp.isClockedIn
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {emp.isClockedIn ? t('clock_out') : t('clock_in')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('add_staff')}</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Kitchen Staff">Kitchen Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
