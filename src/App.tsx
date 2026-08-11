import React, { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';
import {
  INITIAL_TABLES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_RESERVATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_SUPPLIERS,
  INITIAL_EMPLOYEES,
  INITIAL_SETTINGS,
  INITIAL_ACTIVITY_LOGS,
  initialWaitlist,
  DEMO_USERS,
  DEFAULT_ROLE_PERMISSIONS,
} from './data/mockData';
import {
  Table,
  MenuItem,
  Order,
  Reservation,
  WaitlistItem,
  Customer,
  CustomerCoupon,
  InventoryItem,
  Supplier,
  Employee,
  RestaurantSettings,
  User,
  Role,
  OrderStatus,
  ActivityLog,
} from './types';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { FloorPlanView } from './components/FloorPlanView';
import { MenuView } from './components/MenuView';
import { OrderView } from './components/OrderView';
import { KitchenDisplayView } from './components/KitchenDisplayView';
import { CheckoutView } from './components/CheckoutView';
import { ReservationView } from './components/ReservationView';
import { CustomerView } from './components/CustomerView';
import { CustomerOrderingView } from './components/CustomerOrderingView';
import { InventoryView } from './components/InventoryView';
import { StaffAndLogsView } from './components/StaffAndLogsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { GoogleSheetsView } from './components/GoogleSheetsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { PublicLandingView } from './components/PublicLandingView';
import { MembershipModal } from './components/MembershipModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { ReceiptsView } from './components/ReceiptsView';
import { receiptService } from './services/receiptService';
import { gasService, parseSheetsDataToState } from './services/gasService';

const TAB_PATH_MAP: Record<ActiveTab, string> = {
  landing: '/',
  dashboard: '/dashboard',
  floorplan: '/floor-plan',
  menu: '/menu',
  orders: '/orders',
  receipts: '/receipts',
  kds: '/kds',
  checkout: '/checkout',
  reservations: '/reservations',
  inventory: '/inventory',
  customers: '/customers',
  staff: '/staff',
  logs: '/logs',
  analytics: '/analytics',
  settings: '/settings',
  gas: '/google-sheets',
};

const getTabFromURL = (): ActiveTab => {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  const combined = hash + ' ' + path;
  if (combined.includes('dashboard')) return 'dashboard';
  if (combined.includes('floor')) return 'floorplan';
  if (combined.includes('menu')) return 'menu';
  if (combined.includes('receipt') || combined.includes('consumption')) return 'receipts';
  if (combined.includes('order')) return 'orders';
  if (combined.includes('checkout')) return 'checkout';
  if (combined.includes('reservation')) return 'reservations';
  if (combined.includes('inventory')) return 'inventory';
  if (combined.includes('customer')) return 'customers';
  if (combined.includes('staff') || combined.includes('employee')) return 'staff';
  if (combined.includes('analytics')) return 'analytics';
  if (combined.includes('setting')) return 'settings';
  if (combined.includes('sheets') || combined.includes('gas')) return 'gas';
  return 'landing';
};

function mergeById<T extends { id: string; updatedAt?: string; timestamp?: string; paymentStatus?: string; status?: string }>(
  remoteArr: T[] | undefined,
  localArr: T[]
): T[] {
  if (!remoteArr || remoteArr.length === 0) return localArr;
  if (!localArr || localArr.length === 0) return remoteArr;

  const map = new Map<string, T>();

  const statusRank: Record<string, number> = {
    'Pending': 1,
    'Cooking': 2,
    'Ready': 3,
    'Served': 4,
    'Completed': 5,
    'Cancelled': 6,
  };

  const chooseNewer = (remoteItem: T, localItem: T): T => {
    const localObj = localItem as any;
    const remoteObj = remoteItem as any;

    // 1. Order-specific multi-device conflict resolution
    if (localObj.orderNumber || remoteObj.orderNumber) {
      const localTime = new Date(localObj.updatedAt || localObj.createdAt || 0).getTime();
      const remoteTime = new Date(remoteObj.updatedAt || remoteObj.createdAt || 0).getTime();

      // Merge order items union by ID so items added on either device are preserved
      const itemsMap = new Map<string, any>();
      (remoteObj.items || []).forEach((it: any) => {
        if (it && it.id) itemsMap.set(String(it.id), it);
      });
      (localObj.items || []).forEach((it: any) => {
        if (it && it.id) {
          if (!itemsMap.has(String(it.id))) {
            itemsMap.set(String(it.id), it);
          } else {
            const existing = itemsMap.get(String(it.id));
            itemsMap.set(String(it.id), { ...existing, ...it });
          }
        }
      });
      const mergedItems = Array.from(itemsMap.values());
      const calcTotal = mergedItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);

      let paymentStatus = remoteObj.paymentStatus || 'Unpaid';
      let paymentMethod = remoteObj.paymentMethod || '';

      const localRank = statusRank[localObj.status] || 0;
      const remoteRank = statusRank[remoteObj.status] || 0;
      let status = remoteObj.status || 'Pending';

      if (localObj.status === 'Cancelled' || remoteObj.status === 'Cancelled') {
        status = 'Cancelled';
      } else if (localRank > remoteRank) {
        status = localObj.status;
      } else if (remoteRank > localRank) {
        status = remoteObj.status;
      } else {
        status = localTime > remoteTime ? localObj.status : remoteObj.status;
      }

      // Preserve local Paid status if remote is not Paid yet
      if (localObj.paymentStatus === 'Paid' && remoteObj.paymentStatus !== 'Paid') {
        paymentStatus = 'Paid';
        paymentMethod = localObj.paymentMethod || remoteObj.paymentMethod || 'Cash';
        status = 'Completed';
      } else if (localTime > remoteTime) {
        paymentStatus = localObj.paymentStatus || remoteObj.paymentStatus;
        paymentMethod = localObj.paymentMethod || remoteObj.paymentMethod;
      }

      const base = remoteTime >= localTime ? remoteObj : localObj;

      return {
        ...base,
        status,
        paymentStatus,
        paymentMethod,
        items: mergedItems,
        totalAmount: calcTotal > 0 ? calcTotal : (base.totalAmount || 0),
        updatedAt: new Date(Math.max(localTime, remoteTime, Date.now())).toISOString(),
      } as T;
    }

    // Waitlist-specific conflict resolution
    if (localObj.queueNumber !== undefined || remoteObj.queueNumber !== undefined) {
      const waitlistStatusRank: Record<string, number> = {
        'Waiting': 1,
        'Notified': 2,
        'Seated': 3,
        'Cancelled': 3,
      };
      const localRank = waitlistStatusRank[localObj.status] || 1;
      const remoteRank = waitlistStatusRank[remoteObj.status] || 1;
      if (localRank > remoteRank) {
        return { ...remoteObj, ...localObj };
      } else if (remoteRank > localRank) {
        return { ...localObj, ...remoteObj };
      }
      return remoteItem;
    }

    // 2. Table-specific conflict resolution
    if (localObj.zone || remoteObj.zone) {
      const localTime = new Date(localObj.updatedAt || 0).getTime();
      const remoteTime = new Date(remoteObj.updatedAt || 0).getTime();

      let merged = remoteItem;
      if (localTime > remoteTime) {
        merged = { ...remoteObj, ...localObj };
      } else if (localObj.status === 'Occupied' && remoteObj.status === 'Available') {
        merged = { ...remoteObj, ...localObj };
      }

      if (merged.status === 'Available' || merged.status === 'Cleaning') {
        merged = {
          ...merged,
          currentOrderId: undefined,
          customerName: undefined,
          reservationTime: undefined,
        };
      }
      return merged;
    }

    // 3. General entity conflict resolution via timestamp
    const localTime = new Date(localObj.updatedAt || localObj.timestamp || 0).getTime();
    const remoteTime = new Date(remoteObj.updatedAt || remoteObj.timestamp || 0).getTime();

    if (localTime > remoteTime) {
      return { ...remoteObj, ...localObj };
    } else if (remoteTime > localTime) {
      return { ...localObj, ...remoteObj };
    }

    if (
      localObj.status &&
      localObj.status !== remoteObj.status &&
      (localObj.status === 'Completed' || localObj.status === 'Served' || localObj.status === 'Paid')
    ) {
      return { ...remoteObj, ...localObj };
    }

    return remoteItem;
  };

  remoteArr.forEach(item => {
    if (item && item.id) {
      map.set(String(item.id), item);
    }
  });

  localArr.forEach(localItem => {
    if (localItem && localItem.id) {
      const id = String(localItem.id);
      if (map.has(id)) {
        const remoteItem = map.get(id)!;
        map.set(id, chooseNewer(remoteItem, localItem));
      } else {
        map.set(id, localItem);
      }
    }
  });

  return Array.from(map.values());
}

export default function App() {
  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => getTabFromURL());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('pos_dark_mode') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // Customer Self-Ordering Mode State (Auto-enabled if ?table= or ?mode=customer is in URL)
  const [isCustomerMode, setIsCustomerMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('table') || params.has('tablename') || params.get('mode') === 'customer';
  });

  const [customerTableParam] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('table') || params.get('tablename');
  });

  // Auth & Membership State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pos_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved user from localStorage:', e);
      }
    }
    return DEMO_USERS[0];
  });

  // Sync currentUser changes to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pos_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pos_current_user');
    }
  }, [currentUser]);

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showMembershipModal, setShowMembershipModal] = useState<boolean>(false);

  const [coupons, setCoupons] = useState<CustomerCoupon[]>(() => {
    const saved = localStorage.getItem('pos_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  // Core POS Entity States with LocalStorage Persistence
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('pos_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('pos_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pos_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('pos_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [waitlist, setWaitlist] = useState<WaitlistItem[]>(() => {
    const saved = localStorage.getItem('gbg_waitlist');
    return saved ? JSON.parse(saved) : initialWaitlist;
  });

  useEffect(() => {
    localStorage.setItem('gbg_waitlist', JSON.stringify(waitlist));
  }, [waitlist]);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('pos_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('pos_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('pos_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('pos_activity_logs');
    const logs: ActivityLog[] = saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
    const map = new Map<string, ActivityLog>();
    logs.forEach(l => {
      if (l && l.id && !map.has(String(l.id))) {
        map.set(String(l.id), l);
      }
    });
    return Array.from(map.values());
  });

  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    try {
      const saved = localStorage.getItem('pos_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...INITIAL_SETTINGS, ...parsed };
        }
      }
    } catch {
      // fallback if json parse fails
    }
    return INITIAL_SETTINGS;
  });

  // Cross-view state handles
  const [activeOrderToEdit, setActiveOrderToEdit] = useState<Order | null>(null);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | null>(null);
  const [activeOrderToCheckout, setActiveOrderToCheckout] = useState<Order | null>(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isDatabaseLoaded, setIsDatabaseLoaded] = useState<boolean>(false);

  // Subscribe to receipt print events
  useEffect(() => {
    return receiptService.subscribe((order, _settings) => {
      setActiveReceiptOrder(order);
    });
  }, []);

  // Helper to ensure customer account exists or update stats
  const ensureCustomerAccount = (name?: string, phone?: string, email?: string, amount = 0, dishNames: string[] = []) => {
    if (!name || name.trim() === '' || name.toLowerCase() === 'guest' || name === 'Walk-in Guest') return;
    const custName = name.trim();
    const custPhone = phone ? phone.trim() : '';
    const custEmail = email ? email.trim() : '';

    const existingMember = customers.find(
      c =>
        c.name.toLowerCase() === custName.toLowerCase() ||
        (custPhone !== '' && c.phone && c.phone.trim() === custPhone) ||
        (custEmail !== '' && c.email && c.email.toLowerCase() === custEmail.toLowerCase())
    );

    if (!existingMember) {
      const newMember: Customer = {
        id: 'cust-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: custName,
        phone: custPhone,
        email: custEmail,
        loyaltyPoints: 100,
        visitCount: 1,
        totalSpent: amount,
        tier: 'Bronze',
        favoriteDishes: dishNames,
        lastVisit: new Date().toISOString().split('T')[0],
      };
      setCustomers(prev => [newMember, ...prev]);
      gasService.syncCustomer(newMember);
      logActivity('Auto Membership', `Registered membership account for ${custName}`);
    } else {
      const updatedMember: Customer = {
        ...existingMember,
        visitCount: (existingMember.visitCount || 0) + 1,
        totalSpent: (existingMember.totalSpent || 0) + amount,
        lastVisit: new Date().toISOString().split('T')[0],
        phone: custPhone || existingMember.phone,
        email: custEmail || existingMember.email,
      };
      setCustomers(prev => prev.map(c => c.id === updatedMember.id ? updatedMember : c));
      gasService.syncCustomer(updatedMember);
    }
  };

  // Helper to seat guest, mark table occupied, auto create customer membership, and jump to table order
  const handleSeatGuest = (res: Reservation) => {
    // 1. Mark table occupied
    let targetTable = tables.find(
      t =>
        (res.tableId && (t.id === res.tableId || t.name === res.tableId)) ||
        (res.tableName && (t.name === res.tableName || t.id === res.tableName))
    );

    if (!targetTable) {
      targetTable = tables.find(t => t.status === 'Available') || tables[0];
    }

    if (targetTable) {
      const updatedTable: Table = {
        ...targetTable,
        status: 'Occupied',
        customerName: res.customerName,
      };
      setTables(prev => prev.map(t => (t.id === targetTable!.id ? updatedTable : t)));
      gasService.syncTable(updatedTable);
      logActivity('Seat Guest', `Table ${updatedTable.name} marked Occupied for ${res.customerName}`);

      // Automatically jump to that table's order page
      handleOpenTableOrder(updatedTable);
    }

    // 2. Auto register membership if customer is not in system
    ensureCustomerAccount(res.customerName, res.phone, res.email, 0, []);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger admin/POS shortcuts on the public landing page or customer mode
      if (activeTab === 'landing' || isCustomerMode) {
        return;
      }

      // Prevent shortcut interference inside input/textarea fields
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (e.target as HTMLElement)?.tagName
      );

      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o')) {
        if (isInput) return;
        e.preventDefault();
        setActiveTab('orders');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        if (isInput) return;
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !e.shiftKey) {
        if (isInput) return;
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (isInput) return;
        e.preventDefault();
        setActiveTab('dashboard');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        if (isInput) return;
        e.preventDefault();
        setActiveTab('menu');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        if (isInput) return;
        e.preventDefault();
        setActiveTab('floorplan');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        if (isInput) return;
        e.preventDefault();
        setActiveTab('reservations');
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        if (isInput) return;
        e.preventDefault();
        setActiveTab('gas');
      } else if (!isInput && e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isCustomerMode]);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('pos_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Persist local state
  useEffect(() => {
    localStorage.setItem('pos_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('pos_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('pos_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pos_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('pos_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('pos_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('pos_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('pos_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('pos_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('pos_settings', JSON.stringify(settings));
    if (settings.theme === 'dark' && !isDarkMode) {
      setIsDarkMode(true);
    } else if (settings.theme === 'light' && isDarkMode) {
      setIsDarkMode(false);
    }
    if (settings.gasWebAppUrl) {
      gasService.setScriptUrl(settings.gasWebAppUrl);
    }
  }, [settings]);

  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      user: currentUser ? currentUser.name : 'System',
      role: currentUser ? currentUser.role : 'Admin',
      action,
      details,
    };
    setActivityLogs(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)]);
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (!currentUser && tab !== 'landing') {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tab);
    const targetPath = TAB_PATH_MAP[tab] || '/';
    if (window.location.pathname !== targetPath) {
      try {
        window.history.pushState({}, '', targetPath);
      } catch {
        window.location.hash = targetPath;
      }
    }
  };

  // Sync URL history on popstate or hashchange
  useEffect(() => {
    const handleURLChange = () => {
      const tab = getTabFromURL();
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handleURLChange);
    window.addEventListener('hashchange', handleURLChange);
    return () => {
      window.removeEventListener('popstate', handleURLChange);
      window.removeEventListener('hashchange', handleURLChange);
    };
  }, []);

  // Concurrent Request Locks
  const isFetchingRef = useRef(false);
  const isHydratingRef = useRef(false);

  // Hydrate Database from Google Sheets / Cloud DB
  const fetchAndHydrateDatabase = async () => {
    const targetUrl = settings.gasWebAppUrl || gasService.getScriptUrl();
    if (!targetUrl || isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      const res = await gasService.fetchAllFromGoogleSheets(targetUrl);
      if (res.success && res.data) {
        const parsed = parseSheetsDataToState(res.data);

        // Flag remote hydration so autoSync doesn't trigger an immediate POST syncAll loop
        isHydratingRef.current = true;

        if (parsed.reservations && parsed.reservations.length > 0) {
          setReservations(prev => mergeById(parsed.reservations, prev));
        }
        if (parsed.waitlist && parsed.waitlist.length > 0) {
          setWaitlist(prev => mergeById(parsed.waitlist, prev));
        }
        if (parsed.orders && parsed.orders.length > 0) {
          setOrders(prev => mergeById(parsed.orders, prev));
        }
        if (parsed.tables && parsed.tables.length > 0) {
          setTables(prev => mergeById(parsed.tables, prev));
        }
        if (parsed.menuItems && parsed.menuItems.length > 0) {
          setMenuItems(prev => mergeById(parsed.menuItems, prev));
        }
        if (parsed.customers && parsed.customers.length > 0) {
          setCustomers(prev => mergeById(parsed.customers, prev));
        }
        if (parsed.coupons && parsed.coupons.length > 0) {
          setCoupons(prev => mergeById(parsed.coupons, prev));
        }
        if (parsed.employees && parsed.employees.length > 0) {
          setEmployees(prev => mergeById(parsed.employees, prev));
        }
        if (parsed.inventory && parsed.inventory.length > 0) {
          setInventory(prev => mergeById(parsed.inventory, prev));
        }
        if (parsed.activityLogs && parsed.activityLogs.length > 0) {
          setActivityLogs(prev => mergeById(parsed.activityLogs, prev));
        }
        if (parsed.settings && Object.keys(parsed.settings).length > 0) {
          setSettings(prev => ({ ...prev, ...parsed.settings }));
        }

        setIsDatabaseLoaded(true);

        setTimeout(() => {
          isHydratingRef.current = false;
        }, 2000);
      }
    } catch (err) {
      console.warn('Database fetch error:', err);
    } finally {
      isFetchingRef.current = false;
    }
  };

  // Fetch Database on Open & Poll every 30s for live multi-device database sync (only when tab is active)
  useEffect(() => {
    fetchAndHydrateDatabase();

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchAndHydrateDatabase();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [settings.gasWebAppUrl]);

  // Auto Sync to Google Sheets when local state changes (ONLY after database has loaded and NOT during remote hydration)
  useEffect(() => {
    if (!isDatabaseLoaded && settings.gasWebAppUrl) return;
    if (isHydratingRef.current) return;

    if (settings.gasWebAppUrl && settings.autoSyncToSheets) {
      const timer = setTimeout(() => {
        if (!isHydratingRef.current) {
          gasService.syncAllToGoogleSheets(settings.gasWebAppUrl, {
            orders,
            reservations,
            waitlist,
            menuItems,
            tables,
            inventory,
            customers,
            coupons,
            employees,
            activityLogs,
            settings,
          });
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isDatabaseLoaded, orders, reservations, waitlist, menuItems, tables, inventory, customers, coupons, employees, settings]);

  // Handler Functions
  const handleUpdateTable = (updatedTable: Table) => {
    const cleanedTable = (updatedTable.status === 'Available' || updatedTable.status === 'Cleaning')
      ? { ...updatedTable, currentOrderId: undefined, customerName: undefined, reservationTime: undefined }
      : updatedTable;
    setTables(prev => prev.map(t => (t.id === cleanedTable.id ? cleanedTable : t)));
    logActivity('Update Table', `Table ${cleanedTable.name} status updated to ${cleanedTable.status}`);
    gasService.syncTable(cleanedTable);
  };

  const handleAddTable = (newTable: Table) => {
    setTables(prev => [...prev, newTable]);
    logActivity('Add Table', `Created new table ${newTable.name} (${newTable.zone})`);
    gasService.syncTable(newTable);
  };

  const handleDeleteTable = (tableId: string) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
    logActivity('Delete Table', `Removed table ${tableId}`);
    gasService.deleteRow('Tables', tableId);
  };

  const handleOpenTableOrder = (table: Table) => {
    setSelectedTableForOrder(table);
    const existingOrder = orders.find(
      o => o.tableId === table.id && o.status !== 'Completed' && o.status !== 'Cancelled'
    );
    if (existingOrder) {
      setActiveOrderToEdit(existingOrder);
    } else {
      setActiveOrderToEdit(null);
    }
    if (table.status === 'Available') {
      handleUpdateTable({ ...table, status: 'Occupied' });
    }
    setActiveTab('orders');
  };

  const handleTransferTableOrder = (fromTableId: string, toTableId: string) => {
    const fromTable = tables.find(t => t.id === fromTableId);
    const toTable = tables.find(t => t.id === toTableId);

    if (fromTable && toTable) {
      setOrders(prev =>
        prev.map(o => {
          if (o.tableId === fromTableId && o.status !== 'Completed') {
            return { ...o, tableId: toTableId, tableName: toTable.name };
          }
          return o;
        })
      );

      setTables(prev =>
        prev.map(t => {
          if (t.id === fromTableId) return { ...t, status: 'Available', currentOrderId: undefined, customerName: undefined, reservationTime: undefined };
          if (t.id === toTableId) return { ...t, status: 'Occupied' };
          return t;
        })
      );
      logActivity('Transfer Table', `Transferred order from Table ${fromTable.name} to Table ${toTable.name}`);
    }
  };

  const handleMergeTables = (tableId1: string, tableId2: string) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id === tableId1) {
          return {
            ...t,
            mergedWith: [...(t.mergedWith || []), tableId2],
          };
        }
        return t;
      })
    );
    logActivity('Merge Tables', `Merged table ${tableId1} with table ${tableId2}`);
  };

  const handleSaveOrder = (newOrder: Order): Order => {
    let finalOrder = newOrder;

    setOrders(prev => {
      // 1. Check if this exact order ID already exists (i.e. directly editing existing order)
      const existingExactIndex = prev.findIndex(o => o.id === newOrder.id);
      if (existingExactIndex >= 0) {
        const updated = [...prev];
        updated[existingExactIndex] = newOrder;
        finalOrder = newOrder;
        return updated;
      }

      // 2. Check if there is an active UNPAID open order for the same table or customer
      const existingUnpaidOrder = prev.find(o => {
        if (o.paymentStatus !== 'Unpaid' || o.status === 'Cancelled') return false;

        // Match by tableId or tableName
        if (newOrder.tableId && o.tableId === newOrder.tableId) return true;
        if (
          newOrder.tableName &&
          o.tableName &&
          newOrder.tableName.trim().toLowerCase() === o.tableName.trim().toLowerCase()
        ) {
          return true;
        }

        // Match by customerId or customerPhone if not default walk-in
        if (newOrder.customerId && o.customerId === newOrder.customerId) return true;
        if (
          newOrder.customerPhone &&
          newOrder.customerPhone.trim() !== '' &&
          o.customerPhone &&
          o.customerPhone.trim() === newOrder.customerPhone.trim()
        ) {
          return true;
        }

        return false;
      });

      if (existingUnpaidOrder) {
        // Automatically merge/append new items into existing unpaid order
        const mergedItems = [...existingUnpaidOrder.items];

        for (const newItem of newOrder.items) {
          const modifierKey = (arr: string[]) => (arr || []).slice().sort().join('|');
          // Match existing item if it has same menuItemId, status Pending, same modifiers & notes
          const existingItemIndex = mergedItems.findIndex(
            i =>
              i.menuItemId === newItem.menuItemId &&
              i.status === 'Pending' &&
              newItem.status === 'Pending' &&
              modifierKey(i.modifiers) === modifierKey(newItem.modifiers) &&
              (i.kitchenNotes || '') === (newItem.kitchenNotes || '')
          );

          if (existingItemIndex >= 0) {
            mergedItems[existingItemIndex] = {
              ...mergedItems[existingItemIndex],
              quantity: mergedItems[existingItemIndex].quantity + newItem.quantity,
            };
          } else {
            mergedItems.push({
              ...newItem,
              id: newItem.id || 'oi-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            });
          }
        }

        // Recalculate financial totals
        const subtotal = mergedItems.reduce((sum, item) => {
          const addOnSum = item.addOns ? item.addOns.reduce((a, b) => a + b.price, 0) : 0;
          return sum + (item.price + addOnSum) * item.quantity;
        }, 0);

        const discountPercentage = existingUnpaidOrder.discountPercentage || newOrder.discountPercentage || 0;
        const discountAmount = (subtotal * discountPercentage) / 100;
        const taxRate = existingUnpaidOrder.taxRate ?? settings.taxRate ?? 10;
        const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
        const serviceChargeRate = existingUnpaidOrder.serviceChargeRate ?? settings.serviceChargeRate ?? 0;
        const serviceChargeAmount = ((subtotal - discountAmount) * serviceChargeRate) / 100;
        const totalAmount = subtotal - discountAmount + taxAmount + serviceChargeAmount;

        // Combine Kitchen Notes
        let combinedNotes = existingUnpaidOrder.kitchenNotes || '';
        if (newOrder.kitchenNotes && !combinedNotes.includes(newOrder.kitchenNotes)) {
          if (combinedNotes) {
            combinedNotes += ` | [Added ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]: ${newOrder.kitchenNotes}`;
          } else {
            combinedNotes = newOrder.kitchenNotes;
          }
        }

        const mergedOrder: Order = {
          ...existingUnpaidOrder,
          items: mergedItems,
          subtotal,
          discountPercentage,
          discountAmount,
          taxRate,
          taxAmount,
          serviceChargeRate,
          serviceChargeAmount,
          totalAmount,
          kitchenNotes: combinedNotes,
          // Revert status to Pending if it was Served/Ready so KDS alerts kitchen of new items
          status:
            existingUnpaidOrder.status === 'Served' || existingUnpaidOrder.status === 'Ready'
              ? 'Pending'
              : existingUnpaidOrder.status,
          updatedAt: new Date().toISOString(),
        };

        finalOrder = mergedOrder;

        return prev.map(o => (o.id === existingUnpaidOrder.id ? mergedOrder : o));
      }

      // 3. Otherwise, append as a brand new order
      return [newOrder, ...prev];
    });

    if (finalOrder.tableId) {
      setTables(prev =>
        prev.map(t => (t.id === finalOrder.tableId ? { ...t, status: 'Occupied', currentOrderId: finalOrder.id } : t))
      );
    }

    logActivity('Save Order', `Order #${finalOrder.orderNumber} ($${finalOrder.totalAmount.toFixed(2)}) updated/saved`);
    gasService.syncOrder(finalOrder);

    // Auto-create or update customer account
    ensureCustomerAccount(
      finalOrder.customerName,
      finalOrder.customerPhone,
      '',
      finalOrder.totalAmount,
      finalOrder.items.map(i => i.name)
    );

    return finalOrder;
  };

  const handleMergeOrders = (orderIdsToMerge: string[]) => {
    if (orderIdsToMerge.length < 2) return;

    setOrders(prev => {
      const ordersToMerge = prev.filter(o => orderIdsToMerge.includes(o.id));
      if (ordersToMerge.length < 2) return prev;

      // Primary order is the oldest created order among the set
      const sorted = [...ordersToMerge].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const primaryOrder = sorted[0];
      const secondaryOrders = sorted.slice(1);

      let mergedItems = [...primaryOrder.items];
      let combinedNotes = primaryOrder.kitchenNotes || '';

      secondaryOrders.forEach(sec => {
        mergedItems = [...mergedItems, ...sec.items];
        if (sec.kitchenNotes && !combinedNotes.includes(sec.kitchenNotes)) {
          combinedNotes += combinedNotes ? ` | ${sec.kitchenNotes}` : sec.kitchenNotes;
        }
      });

      const subtotal = mergedItems.reduce((sum, item) => {
        const addOnSum = item.addOns ? item.addOns.reduce((a, b) => a + b.price, 0) : 0;
        return sum + (item.price + addOnSum) * item.quantity;
      }, 0);

      const discountPercentage = primaryOrder.discountPercentage || 0;
      const discountAmount = (subtotal * discountPercentage) / 100;
      const taxRate = primaryOrder.taxRate ?? settings.taxRate ?? 10;
      const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
      const serviceChargeRate = primaryOrder.serviceChargeRate ?? settings.serviceChargeRate ?? 0;
      const serviceChargeAmount = ((subtotal - discountAmount) * serviceChargeRate) / 100;
      const totalAmount = subtotal - discountAmount + taxAmount + serviceChargeAmount;

      const mergedOrder: Order = {
        ...primaryOrder,
        items: mergedItems,
        subtotal,
        discountAmount,
        taxAmount,
        serviceChargeAmount,
        totalAmount,
        kitchenNotes: combinedNotes,
        updatedAt: new Date().toISOString(),
      };

      const secondaryIds = new Set(secondaryOrders.map(o => o.id));
      const result = prev
        .filter(o => !secondaryIds.has(o.id))
        .map(o => (o.id === primaryOrder.id ? mergedOrder : o));

      logActivity('Merge Orders', `Combined ${ordersToMerge.length} unpaid orders into #${primaryOrder.orderNumber}`);
      gasService.syncOrder(mergedOrder);

      return result;
    });
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          if (o.tableId) {
            setTables(tbls =>
              tbls.map(t => (t.id === o.tableId ? { ...t, status: 'Available', currentOrderId: undefined, customerName: undefined, reservationTime: undefined } : t))
            );
          }
          const updated = { ...o, status: 'Cancelled' as OrderStatus };
          gasService.syncOrder(updated);
          return updated;
        }
        return o;
      })
    );
    logActivity('Cancel Order', `Order ${orderId} cancelled`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updated = { ...o, status: newStatus, updatedAt: new Date().toISOString() };
          gasService.syncOrder(updated);
          return updated;
        }
        return o;
      })
    );
    logActivity('Update Order Status', `Order ${orderId} moved to ${newStatus}`);
  };

  const handleProceedToCheckout = (order: Order) => {
    setActiveOrderToCheckout(order);
    setActiveTab('checkout');
  };

  const handleCompletePayment = (
    orderId: string,
    paymentDetails: { method: Order['paymentMethod']; cashReceived?: number; changeGiven?: number }
  ) => {
    let targetOrder = orders.find(o => o.id === orderId);

    setOrders(prev => {
      const found = prev.find(o => o.id === orderId);
      if (found) targetOrder = found;
      return prev.map(o => {
        if (o.id === orderId) {
          const updated: Order = {
            ...o,
            status: 'Completed',
            paymentStatus: 'Paid',
            paymentMethod: paymentDetails.method,
            updatedAt: new Date().toISOString(),
          };
          logActivity('Complete Payment', `Order #${o.orderNumber} ($${o.totalAmount.toFixed(2)}) paid via ${paymentDetails.method}`);
          gasService.syncOrder(updated);
          return updated;
        }
        return o;
      });
    });

    if (!targetOrder) return;

    // 1. Update Table Status to 'Cleaning' to remind staff and clear currentOrderId & customerName
    if (targetOrder.tableId || targetOrder.tableName) {
      setTables(tbls =>
        tbls.map(t => {
          const matchId = targetOrder!.tableId && t.id === targetOrder!.tableId;
          const matchName =
            targetOrder!.tableName && t.name.trim().toLowerCase() === targetOrder!.tableName!.trim().toLowerCase();
          if (matchId || matchName) {
            const updatedTable = {
              ...t,
              status: 'Cleaning' as const,
              currentOrderId: undefined,
              customerName: undefined,
              reservationTime: undefined,
            };
            gasService.syncTable(updatedTable);
            return updatedTable;
          }
          return t;
        })
      );
    }

    // 2. Award Customer Loyalty Points and update Customer stats
    const custName = targetOrder.customerName?.trim();
    const custPhone = targetOrder.customerPhone?.trim();
    const custId = targetOrder.customerId;

    if (custName && custName.toLowerCase() !== 'guest') {
      const earnedPoints = Math.max(1, Math.floor(targetOrder.totalAmount));
      const todayStr = new Date().toISOString().split('T')[0];

      setCustomers(prevCusts => {
        const existingIndex = prevCusts.findIndex(
          c =>
            (custId && c.id === custId) ||
            (custPhone && custPhone !== '' && c.phone === custPhone) ||
            (custName && c.name.toLowerCase() === custName.toLowerCase())
        );

        if (existingIndex >= 0) {
          const existing = prevCusts[existingIndex];
          const newPoints = (existing.loyaltyPoints || 0) + earnedPoints;
          const newTotalSpent = (existing.totalSpent || 0) + targetOrder.totalAmount;
          const newVisitCount = (existing.visitCount || 0) + 1;

          let newTier = existing.tier;
          if (newPoints >= 1000 || newTotalSpent >= 1200) newTier = 'VIP';
          else if (newPoints >= 500 || newTotalSpent >= 600) newTier = 'Gold';
          else if (newPoints >= 200 || newTotalSpent >= 250) newTier = 'Silver';
          else newTier = 'Bronze';

          const updatedCust: Customer = {
            ...existing,
            loyaltyPoints: newPoints,
            totalSpent: newTotalSpent,
            visitCount: newVisitCount,
            tier: newTier,
            lastVisit: todayStr,
            phone: existing.phone || custPhone || '',
          };

          gasService.syncCustomer(updatedCust);

          const copy = [...prevCusts];
          copy[existingIndex] = updatedCust;
          return copy;
        } else {
          // Register new customer
          const welcomeBonus = 100;
          const totalPts = welcomeBonus + earnedPoints;
          const newTotalSpent = targetOrder.totalAmount;

          let tier: Customer['tier'] = 'Bronze';
          if (totalPts >= 500 || newTotalSpent >= 600) tier = 'Gold';
          else if (totalPts >= 200 || newTotalSpent >= 250) tier = 'Silver';

          const newCust: Customer = {
            id: custId || 'cust-' + Date.now(),
            name: custName,
            phone: custPhone || '',
            email: '',
            loyaltyPoints: totalPts,
            visitCount: 1,
            totalSpent: newTotalSpent,
            tier: tier,
            favoriteDishes: [],
            lastVisit: todayStr,
          };

          gasService.syncCustomer(newCust);
          return [newCust, ...prevCusts];
        }
      });
    }
  };

  // Combined user list for auth modal
  const allUsers: User[] = (() => {
    const map = new Map<string, User>();
    DEMO_USERS.forEach(u => map.set(u.id, u));
    employees.forEach(e => {
      if (e && e.id) {
        map.set(e.id, {
          id: e.id,
          name: e.name,
          email: e.email,
          role: e.role as any,
          pin: (e as any).pin || e.pinCode || '1234',
          avatar: (e as any).avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        });
      }
    });
    return Array.from(map.values());
  })();

  if (isCustomerMode) {
    return (
      <CustomerOrderingView
        tables={tables}
        menuItems={menuItems}
        orders={orders}
        settings={settings}
        initialTableNumber={customerTableParam}
        onPlaceOrder={handleSaveOrder}
        onExitCustomerMode={() => setIsCustomerMode(false)}
      />
    );
  }

  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen w-screen overflow-x-hidden bg-slate-900 text-slate-100 font-sans">
        <PublicLandingView
          settings={settings}
          menuItems={menuItems}
          onAddReservation={res => {
            setReservations(prev => [res, ...prev]);
            ensureCustomerAccount(res.customerName, res.phone, res.email, 0, []);
            logActivity('Add Online Reservation', `Online booking for ${res.customerName}`);
            gasService.syncReservation(res);
          }}
          onNavigateTab={handleTabChange}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenMembership={() => setShowMembershipModal(true)}
          onLaunchCustomerOrdering={() => setIsCustomerMode(true)}
        />

        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            users={allUsers}
            onLogin={u => {
              setCurrentUser(u);
              setShowAuthModal(false);
              logActivity('User Login', `Logged in as ${u.name} (${u.role})`);
              setActiveTab('dashboard');
              try {
                window.history.pushState({}, '', '/dashboard');
              } catch {
                window.location.hash = '/dashboard';
              }
            }}
            onCreateAccount={newUser => {
              setEmployees(prev => [...prev, newUser]);
              setCurrentUser(newUser);
              setShowAuthModal(false);
              logActivity('Create Staff Account', `Registered staff ${newUser.name}`);
              setActiveTab('dashboard');
              try {
                window.history.pushState({}, '', '/dashboard');
              } catch {
                window.location.hash = '/dashboard';
              }
            }}
            onClose={() => setShowAuthModal(false)}
          />
        )}

        {showMembershipModal && (
          <MembershipModal
            isOpen={showMembershipModal}
            onClose={() => setShowMembershipModal(false)}
            customers={customers}
            coupons={coupons}
            onUpdateCustomer={updatedCustomer => {
              setCustomers(prev => prev.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c)));
            }}
            onAddCustomer={newCustomer => {
              setCustomers(prev => [newCustomer, ...prev]);
              logActivity('New Member Registration', `Registered member ${newCustomer.name}`);
            }}
            onAddCoupon={newCoupon => {
              setCoupons(prev => [newCoupon, ...prev]);
              logActivity('Redeem Loyalty Coupon', `Redeemed ${newCoupon.title} code ${newCoupon.code}`);
            }}
            settings={settings}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-900 font-sans antialiased dark:bg-gray-950 dark:text-gray-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        setActiveTab={handleTabChange}
        settings={settings}
        pendingOrdersCount={orders.filter(o => o.status === 'Pending').length}
        kdsItemsCount={orders.filter(o => o.status === 'Cooking').length}
        lowStockCount={inventory.filter(i => i.currentStock <= i.minStock).length}
        userRole={currentUser?.role}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          handleTabChange('landing');
        }}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          setActiveTab={tab => handleTabChange(tab as ActiveTab)}
          currentUser={currentUser}
          settings={settings}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={() => {
            if (currentUser) logActivity('User Logout', `Logged out user ${currentUser.name}`);
            setCurrentUser(null);
            handleTabChange('landing');
          }}
          onOpenNewOrder={() => handleTabChange('orders')}
          onOpenGasModal={() => handleTabChange('gas')}
          onLaunchCustomerMode={() => setIsCustomerMode(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/50 no-print">
          {(() => {
            const activeRole: Role = currentUser?.role || 'Admin';
            const rolePermissionsMap =
              settings.rolePermissions || DEFAULT_ROLE_PERMISSIONS;
            let allowedTabs: ActiveTab[] =
              rolePermissionsMap[activeRole] ||
                DEFAULT_ROLE_PERMISSIONS[activeRole] ||
                DEFAULT_ROLE_PERMISSIONS.Admin;

          // Receipt History is always available to these roles
            const receiptRoles: Role[] = [
              'Admin',
              'Manager',
              'Cashier',
              'Waiter',
            ];

if (
  receiptRoles.includes(activeRole) &&
  !allowedTabs.includes('receipts')
) {
  allowedTabs = [...allowedTabs, 'receipts'];
}

const isCurrentTabAllowed = allowedTabs.includes(activeTab);

            if (!isCurrentTabAllowed) {
              return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mb-4 shadow-md">
                    <Lock className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                    Access Restricted: Role Not Authorized
                  </h2>
                  <p className="max-w-md text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    Your current role (<strong className="text-[#FF8A00] font-bold">{activeRole}</strong>) does not have permission to access the <strong className="text-gray-800 dark:text-gray-200 uppercase font-bold">{activeTab}</strong> function.
                    Please contact a restaurant Admin to enable this function in POS Settings.
                  </p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setActiveTab(allowedTabs[0] || 'landing')}
                      className="rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all cursor-pointer"
                    >
                      Go to Allowed Function ({allowedTabs[0] || 'landing'})
                    </button>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
                    >
                      Switch User Account / Role
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <>
                {activeTab === 'landing' && (
            <PublicLandingView
              settings={settings}
              menuItems={menuItems}
              onAddReservation={res => {
                setReservations(prev => [res, ...prev]);
                logActivity('Add Online Reservation', `Online booking for ${res.customerName}`);
              }}
              onNavigateTab={setActiveTab}
              onLaunchCustomerOrdering={() => setIsCustomerMode(true)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              tables={tables}
              reservations={reservations}
              menuItems={menuItems}
              settings={settings}
              onNavigate={setActiveTab}
              onNavigateTab={setActiveTab}
              onOpenTableOrder={handleOpenTableOrder}
              onNewOrder={() => setActiveTab('orders')}
            />
          )}

          {activeTab === 'floorplan' && (
            <FloorPlanView
              tables={tables}
              orders={orders}
              onUpdateTable={handleUpdateTable}
              onAddTable={handleAddTable}
              onDeleteTable={handleDeleteTable}
              onOpenTableOrder={handleOpenTableOrder}
              onTransferTableOrder={handleTransferTableOrder}
              onMergeTables={handleMergeTables}
            />
          )}

          {activeTab === 'menu' && (
            <MenuView
              menuItems={menuItems}
              onAddMenuItem={item => {
                setMenuItems(prev => [...prev, item]);
                logActivity('Add Menu Item', `Created menu item ${item.name}`);
                gasService.syncMenuItem(item);
              }}
              onUpdateMenuItem={item => {
                setMenuItems(prev => prev.map(m => (m.id === item.id ? item : m)));
                logActivity('Update Menu Item', `Updated menu item ${item.name}`);
                gasService.syncMenuItem(item);
              }}
              onDeleteMenuItem={id => {
                setMenuItems(prev => prev.filter(m => m.id !== id));
                logActivity('Delete Menu Item', `Deleted menu item ${id}`);
                gasService.deleteRow('Menu', id);
              }}
            />
          )}

          {activeTab === 'orders' && (
            <OrderView
              menuItems={menuItems}
              tables={tables}
              orders={orders}
              customers={customers}
              settings={settings}
              activeOrderToEdit={activeOrderToEdit}
              selectedTableForOrder={selectedTableForOrder}
              onSaveOrder={handleSaveOrder}
              onCancelOrder={handleCancelOrder}
              onProceedToCheckout={handleProceedToCheckout}
              onMergeOrders={handleMergeOrders}
              onAddCustomer={cust => {
                setCustomers(prev => [cust, ...prev]);
                gasService.syncCustomer(cust);
                logActivity('Auto Membership', `Registered membership account for ${cust.name}`);
              }}
            />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsView
              orders={orders}
              tables={tables}
              settings={settings}
              onOpenReceiptModal={order => {
                setActiveReceiptOrder(order);
              }}
              onProceedToCheckout={order => {
                setActiveOrderToCheckout(order);
                setActiveTab('checkout');
              }}
            />
          )}

          {activeTab === 'kds' && (
            <KitchenDisplayView orders={orders} settings={settings} onUpdateOrderStatus={handleUpdateOrderStatus} />
          )}

          {activeTab === 'checkout' && (
            <CheckoutView
              orders={orders}
              customers={customers}
              settings={settings}
              activeOrderToCheckout={activeOrderToCheckout}
              onCompletePayment={handleCompletePayment}
              onUpdateOrderDetails={handleSaveOrder}
              onMergeOrders={handleMergeOrders}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationView
              reservations={reservations}
              tables={tables}
              waitlist={waitlist}
              onOpenTableOrder={handleOpenTableOrder}
              onAddReservation={res => {
                setReservations(prev => [res, ...prev]);
                ensureCustomerAccount(res.customerName, res.phone, res.email, 0, []);
                if (res.status === 'Seated') {
                  handleSeatGuest(res);
                }
                logActivity('Add Reservation', `Booked reservation for ${res.customerName}`);
                gasService.syncReservation(res);
              }}
              onUpdateReservation={updatedRes => {
                setReservations(prev =>
                  prev.map(r => (r.id === updatedRes.id ? updatedRes : r))
                );
                if (updatedRes.status === 'Seated') {
                  handleSeatGuest(updatedRes);
                }
                logActivity('Update Reservation', `Updated details for reservation ${updatedRes.customerName}`);
                gasService.syncReservation(updatedRes);
              }}
              onUpdateReservationStatus={(resId, status) => {
                setReservations(prev =>
                  prev.map(r => {
                    if (r.id === resId) {
                      const updated = { ...r, status };
                      gasService.syncReservation(updated);
                      if (status === 'Seated') {
                        handleSeatGuest(updated);
                      }
                      return updated;
                    }
                    return r;
                  })
                );
                logActivity('Update Reservation Status', `Reservation ${resId} status set to ${status}`);
              }}
              onAddWaitlist={item => {
                setWaitlist(prev => [item, ...prev]);
                logActivity('Add Waitlist', `Added queue #${item.queueNumber} for ${item.customerName}`);
                gasService.syncWaitlist(item);
              }}
              onUpdateWaitlist={item => {
                setWaitlist(prev => prev.map(w => (w.id === item.id ? item : w)));
                logActivity('Update Waitlist', `Updated queue #${item.queueNumber} status to ${item.status}`);
                gasService.syncWaitlist(item);
              }}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerView
              customers={customers}
              onAddCustomer={cust => {
                setCustomers(prev => [cust, ...prev]);
                logActivity('Add Customer', `Registered customer ${cust.name}`);
                gasService.syncCustomer(cust);
              }}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              suppliers={suppliers}
              onAddInventoryItem={item => {
                setInventory(prev => [...prev, item]);
                logActivity('Add Inventory Item', `Added inventory stock ${item.name}`);
                gasService.syncInventory(item);
              }}
              onUpdateStock={(itemId, newStock) => {
                setInventory(prev =>
                  prev.map(i => {
                    if (i.id === itemId) {
                      const updated = { ...i, currentStock: newStock };
                      gasService.syncInventory(updated);
                      return updated;
                    }
                    return i;
                  })
                );
                logActivity('Update Stock', `Item ${itemId} stock updated to ${newStock}`);
              }}
            />
          )}

          {(activeTab === 'staff' || (activeTab as string) === 'employees' || (activeTab as string) === 'logs') && (
            <StaffAndLogsView
              employees={employees}
              activityLogs={activityLogs}
              currentUser={currentUser}
              initialTab={activeTab === 'logs' ? 'logs' : 'staff'}
              onAddEmployee={emp => {
                setEmployees(prev => [...prev, emp]);
                logActivity('Add Staff', `Added employee ${emp.name} (${emp.role})`);
                gasService.syncEmployee(emp);
              }}
              onToggleClockIn={empId => {
                setEmployees(prev =>
                  prev.map(e => {
                    if (e.id === empId) {
                      const nextState = !e.isClockedIn;
                      let workDurationText = '';

                      if (!nextState) {
                        // Clocking out: calculate worked duration from last clock in
                        const lastClockIn = activityLogs.find(
                          l =>
                            (l.action.toLowerCase().includes('clock in') || l.details.toLowerCase().includes('clocked in')) &&
                            (l.user.toLowerCase() === e.name.toLowerCase() || l.details.toLowerCase().includes(e.name.toLowerCase()))
                        );
                        if (lastClockIn) {
                          const diffMs = Date.now() - new Date(lastClockIn.timestamp).getTime();
                          if (diffMs > 0) {
                            const totalMins = Math.floor(diffMs / 60000);
                            const hours = Math.floor(totalMins / 60);
                            const mins = totalMins % 60;
                            workDurationText = hours > 0
                              ? `${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`
                              : `${mins} min${mins !== 1 ? 's' : ''}`;
                          }
                        }
                      }

                      const detailsText = nextState
                        ? `Employee ${e.name} clocked in`
                        : `Employee ${e.name} clocked out${workDurationText ? ` (Worked: ${workDurationText})` : ''}`;

                      logActivity(nextState ? 'Staff Clock In' : 'Staff Clock Out', detailsText);
                      gasService.syncClockIn(e.name, e.role, nextState);
                      return { ...e, isClockedIn: nextState };
                    }
                    return e;
                  })
                );
              }}
            />
          )}

          {(activeTab === 'analytics' || activeTab === 'reports') && <AnalyticsView orders={orders} menuItems={menuItems} />}

          {activeTab === 'gas' && (
            <GoogleSheetsView
              settings={settings}
              onUpdateSettings={setSettings}
              fullDataState={{
                orders,
                menuItems,
                tables,
                reservations,
                customers,
                inventory,
                employees,
                activityLogs,
                suppliers: INITIAL_SUPPLIERS,
                settings,
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              currentUser={currentUser}
              onUpdateSettings={setSettings}
              onNavigateToGas={() => setActiveTab('gas')}
            />
          )}
              </>
            );
          })()}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        orders={orders}
        menuItems={menuItems}
        tables={tables}
        reservations={reservations}
        customers={customers}
        onNavigateTab={tab => setActiveTab(tab)}
        onOpenTableOrder={handleOpenTableOrder}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Auth & Role Switcher Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          users={allUsers}
          onLogin={user => {
            setCurrentUser(user);
            setShowAuthModal(false);
            logActivity('User Login', `Logged in as ${user.name} (${user.role})`);
            if (activeTab === 'landing') {
              setActiveTab('dashboard');
              try {
                window.history.pushState({}, '', '/dashboard');
              } catch {
                window.location.hash = '/dashboard';
              }
            }
          }}
          onCreateAccount={newUser => {
            setEmployees(prev => [...prev, newUser]);
            setCurrentUser(newUser);
            setShowAuthModal(false);
            logActivity('Create Staff Account', `Registered staff ${newUser.name}`);
            if (activeTab === 'landing') {
              setActiveTab('dashboard');
              try {
                window.history.pushState({}, '', '/dashboard');
              } catch {
                window.location.hash = '/dashboard';
              }
            }
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Guest Loyalty & Membership Modal */}
      {showMembershipModal && (
        <MembershipModal
          isOpen={showMembershipModal}
          onClose={() => setShowMembershipModal(false)}
          customers={customers}
          coupons={coupons}
          onUpdateCustomer={updatedCustomer => {
            setCustomers(prev => prev.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c)));
          }}
          onAddCustomer={newCustomer => {
            setCustomers(prev => [newCustomer, ...prev]);
            logActivity('New Member Registration', `Registered member ${newCustomer.name}`);
          }}
          onAddCoupon={newCoupon => {
            setCoupons(prev => [newCoupon, ...prev]);
            logActivity('Redeem Loyalty Coupon', `Redeemed ${newCoupon.title} code ${newCoupon.code}`);
          }}
          settings={settings}
        />
      )}

      {/* Interactive Thermal Receipt Modal */}
      <ThermalReceiptModal
        order={activeReceiptOrder}
        settings={settings}
        isOpen={!!activeReceiptOrder}
        onClose={() => setActiveReceiptOrder(null)}
      />
    </div>
  );
}

