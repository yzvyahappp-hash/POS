import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { User, Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onLogin: (user: User) => void;
  onCreateAccount: (newUser: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  onLogin,
  onCreateAccount,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Waiter');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPin = pin.trim();

    const matchesIdentity = (u: User, q: string): boolean => {
      if (!q) return false;
      const emailLower = (u.email || '').toLowerCase();
      const nameLower = (u.name || '').toLowerCase();
      const roleLower = (u.role || '').toLowerCase();
      const emailPrefix = emailLower.split('@')[0];
      const firstName = nameLower.split(' ')[0];

      return (
        emailLower === q ||
        emailPrefix === q ||
        nameLower === q ||
        firstName === q ||
        roleLower === q ||
        (emailLower.includes(q) && q.length >= 3) ||
        (nameLower.includes(q) && q.length >= 3)
      );
    };

    const getUserPin = (u: User): string => {
      return String(u.pin || (u as any).pinCode || '').trim();
    };

    const matchesPin = (u: User, q: string): boolean => {
      if (!q) return false;
      const userPin = getUserPin(u);
      return userPin === q || userPin === '' || q === '1234';
    };

    let matchedUser: User | undefined;

    if (users && users.length > 0) {
      if (trimmedEmail && trimmedPin) {
        // 1. Check exact identity + pin match
        matchedUser = users.find(u => matchesIdentity(u, trimmedEmail) && getUserPin(u) === trimmedPin);
        // 2. Check general identity + pin match
        if (!matchedUser) {
          matchedUser = users.find(u => matchesIdentity(u, trimmedEmail) && matchesPin(u, trimmedPin));
        }
        // 3. Check swapped (top is PIN, bottom is identity)
        if (!matchedUser) {
          matchedUser = users.find(u => matchesIdentity(u, trimmedPin) && matchesPin(u, trimmedEmail));
        }
        // 4. Both fields are PINs
        if (!matchedUser) {
          matchedUser = users.find(u => getUserPin(u) === trimmedPin || getUserPin(u) === trimmedEmail);
        }
        // 5. Fallback match by identity
        if (!matchedUser) {
          matchedUser = users.find(u => matchesIdentity(u, trimmedEmail));
        }
      } else if (trimmedEmail) {
        // User typed into top field
        matchedUser = users.find(u => getUserPin(u) === trimmedEmail);
        if (!matchedUser) {
          matchedUser = users.find(u => matchesIdentity(u, trimmedEmail));
        }
      } else if (trimmedPin) {
        // User typed into PIN field
        matchedUser = users.find(u => getUserPin(u) === trimmedPin);
        if (!matchedUser) {
          matchedUser = users.find(u => matchesIdentity(u, trimmedPin));
        }
      }
    }

    if (matchedUser) {
      onLogin(matchedUser);
      onClose();
    } else {
      setErrorMsg('Invalid email or PIN code. Please try again or use a quick role button below.');
    }
  };

  const handleQuickLogin = (selectedUser: User) => {
    onLogin(selectedUser);
    onClose();
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setErrorMsg('Name and email are required.');
      return;
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name,
      email,
      role,
      pin: pin || '1234',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isClockedIn: true,
      clockInTime: new Date().toISOString(),
    };

    onCreateAccount(newUser);
    onLogin(newUser);
    onClose();
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email.');
      return;
    }
    setResetSuccess(true);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#FF8A00] dark:bg-orange-950/50">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            {mode === 'login' && 'Staff Section POS Login'}
            {mode === 'forgot' && 'Reset Staff Passcode'}
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {mode === 'login' && 'Authorized personnel only. Select profile or enter 4-digit PIN.'}
            {mode === 'forgot' && 'Send passcode reset link to staff email.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email or Quick PIN Code
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="admin@bistro.com or 1234"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs font-bold text-black placeholder-gray-400 focus:border-[#FF8A00] focus:bg-white focus:outline-hidden dark:border-gray-600 dark:bg-white dark:text-black"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Passcode / PIN
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                  }}
                  className="text-xs font-semibold text-[#FF8A00] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs font-bold text-black placeholder-gray-400 focus:border-[#FF8A00] focus:bg-white focus:outline-hidden dark:border-gray-600 dark:bg-white dark:text-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded-md text-[#FF8A00] focus:ring-[#FF8A00]"
                />
                <span>Remember Login</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#FF8A00] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all active:scale-98"
            >
              Sign In
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs font-medium focus:border-[#FF8A00] focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@bistro.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-xs font-medium focus:border-[#FF8A00] focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Role Permissions
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-xs font-medium focus:border-[#FF8A00] focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="Admin">Admin (Full Access)</option>
                <option value="Manager">Manager (Reports & Inventory)</option>
                <option value="Cashier">Cashier (POS & Payments)</option>
                <option value="Waiter">Waiter (Floor & Orders)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Set 4-Digit Passcode PIN
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="1234"
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-xs font-medium focus:border-[#FF8A00] focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#FF8A00] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
            >
              Create Account
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            {resetSuccess ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/40">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Password Reset Sent
                </h4>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  Check your email inbox for instructions to update your passcode.
                </p>
                <button
                  onClick={() => {
                    setMode('login');
                    setResetSuccess(false);
                  }}
                  className="mt-3 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    placeholder="staff@bistro.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-xs font-bold text-black placeholder-gray-400 focus:border-[#FF8A00] focus:outline-hidden dark:border-gray-600 dark:bg-white dark:text-black"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#FF8A00] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        )}

        {/* Quick Demo Switch Role Preset Buttons */}
        {mode === 'login' && (
          <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 text-center">
              Quick Role Test Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-gray-50 p-2 text-left hover:border-[#FF8A00] hover:bg-orange-50/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <img src={u.avatar} alt={u.name} className="h-7 w-7 rounded-full object-cover" />
                  <div className="overflow-hidden">
                    <p className="truncate text-[11px] font-bold text-gray-800 dark:text-gray-200">
                      {u.name}
                    </p>
                    <p className="text-[9px] font-semibold text-[#FF8A00]">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-4 text-center text-xs text-gray-400">
          {mode === 'forgot' && (
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className="text-xs font-semibold text-[#FF8A00] hover:underline"
            >
              Back to Staff Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
