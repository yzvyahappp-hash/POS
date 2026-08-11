import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Clock,
  Shield,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Key,
} from 'lucide-react';
import { Employee, UserRole } from '../types';

interface EmployeeViewProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onToggleClockIn: (employeeId: string) => void;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({
  employees,
  onAddEmployee,
  onToggleClockIn,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Waiter');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
            <UserCheck className="mr-2 h-6 w-6 text-[#FF8A00]" /> Staff & Shift Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Clock-in attendance, staff role credentials, security PINs, and shift scheduling
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800">
                <th className="py-3">Staff Name</th>
                <th className="py-3">Role</th>
                <th className="py-3">Contact</th>
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
                  <td className="py-3 text-gray-500">{emp.phone}</td>
                  <td className="py-3 font-mono font-bold text-gray-600 dark:text-gray-400">
                    •••• ({emp.pinCode})
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        emp.isClockedIn
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {emp.isClockedIn ? 'Clocked In' : 'Clocked Out'}
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
                      {emp.isClockedIn ? 'Clock Out' : 'Clock In'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Staff Member</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
