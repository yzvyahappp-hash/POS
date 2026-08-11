import React from 'react';
import {
  LayoutDashboard,
  Grid,
  UtensilsCrossed,
  ShoppingBag,
  Receipt,
  ChefHat,
  CreditCard,
  Calendar,
  Users,
  Package,
  UserCheck,
  Clock,
  BarChart3,
  Settings,
  Database,
  LogOut,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { RestaurantSettings, Role, User, ActiveTab } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { DEFAULT_ROLE_PERMISSIONS } from '../data/mockData';

export type { ActiveTab };

interface SidebarProps {
  activeTab?: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  setActiveTab?: (tab: ActiveTab) => void;
  settings?: RestaurantSettings;
  pendingOrdersCount?: number;
  kdsItemsCount?: number;
  lowStockCount?: number;
  userRole?: Role;
  currentUser?: User | null;
  onLogout?: () => void;
  onOpenAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'dashboard',
  onSelectTab,
  setActiveTab,
  settings,
  pendingOrdersCount = 0,
  kdsItemsCount = 0,
  lowStockCount = 0,
  userRole,
  currentUser,
  onLogout,
}) => {
  const { t } = useTranslation();

  const activeRole: Role = userRole || currentUser?.role || 'Admin';
  const rolePermissionsMap = settings?.rolePermissions || DEFAULT_ROLE_PERMISSIONS;
  let allowedTabs: ActiveTab[] = rolePermissionsMap[activeRole] || DEFAULT_ROLE_PERMISSIONS[activeRole] || DEFAULT_ROLE_PERMISSIONS.Admin;

  // Always ensure 'receipts' tab (Consumption Receipts History) is available for Admin, Manager, Cashier, Waiter
  if (!allowedTabs.includes('receipts') && (DEFAULT_ROLE_PERMISSIONS[activeRole]?.includes('receipts') || activeRole === 'Admin' || activeRole === 'Manager' || activeRole === 'Cashier' || activeRole === 'Waiter')) {
    allowedTabs = [...allowedTabs, 'receipts'];
  }

  const handleSelectTab = (tab: ActiveTab) => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  const allNavItems = [
    { id: 'landing', label: 'Public Restaurant Web', icon: Globe },
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'floorplan', label: t('nav_floorplan'), icon: Grid },
    { id: 'menu', label: t('nav_menu'), icon: UtensilsCrossed },
    { id: 'orders', label: t('nav_orders'), icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'receipts', label: t('nav_receipts'), icon: Receipt },
    { id: 'kds', label: t('nav_kds'), icon: ChefHat, badge: kdsItemsCount > 0 ? kdsItemsCount : undefined, badgeColor: 'bg-[#FF8A00]' },
    { id: 'checkout', label: t('nav_checkout'), icon: CreditCard },
    { id: 'reservations', label: t('nav_reservations'), icon: Calendar },
    { id: 'customers', label: t('nav_customers'), icon: Users },
    { id: 'inventory', label: t('nav_inventory'), icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'staff', label: t('nav_staff'), icon: UserCheck },
    { id: 'logs', label: 'Clock In & Logs', icon: Clock },
    { id: 'analytics', label: t('nav_analytics'), icon: BarChart3 },
    { id: 'settings', label: t('nav_settings'), icon: Settings },
    { id: 'gas', label: t('nav_gas'), icon: Database },
  ];

  const navItems = allNavItems.filter(item => allowedTabs.includes(item.id as ActiveTab));

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[#E5E7EB] bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Brand Header */}
      <div className="flex h-18 items-center space-x-3 border-b border-[#E5E7EB] px-5 dark:border-gray-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF8A00] font-extrabold text-white shadow-xs">
          R
        </div>
        <div className="overflow-hidden">
          <h1 className="truncate font-bold text-gray-900 text-base tracking-tight dark:text-gray-100">
            {settings?.restaurantName || 'ZestPOS'}
          </h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            Sleek Restaurant POS
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id as ActiveTab)}
              className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#FF8A00]/10 text-[#FF8A00] font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#FF8A00]' : 'text-gray-400 dark:text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                      item.badgeColor || 'bg-gray-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-[#FF8A00]" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Role & Logout */}
      <div className="border-t border-gray-100 p-3 dark:border-gray-800">
        <div className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 dark:bg-gray-800">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Active Role</span>
            <span className="text-xs font-bold text-[#FF8A00]">{userRole || 'Guest'}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 border border-gray-200 shadow-2xs hover:bg-rose-50 dark:bg-gray-700 dark:border-gray-600 dark:text-rose-400"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
