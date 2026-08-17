import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Users,
  Grid,
  List,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Utensils,
  BellRing,
  UserCheck,
  TrendingUp,
  Search,
  Filter,
  Check,
  Link2,
} from 'lucide-react';
import { PhoneKeypadInput } from './PhoneKeypad';
import { Reservation, Table, WaitlistItem, Customer } from '../types';
import { initialWaitlist } from '../data/mockData';
import { gasService, formatReservationDate, formatReservationTime } from '../services/gasService';
import {
  getTodayUTC8,
  formatDateUTC8,
  formatTimeUTC8,
  formatTimeDisplayUTC8,
  TIMEZONE_UTC8,
} from '../utils/dateUtils';
import { findExistingCustomer } from '../utils/customerUtils';
import { useTranslation } from '../i18n/useTranslation';

interface ReservationViewProps {
  reservations: Reservation[];
  tables: Table[];
  waitlist?: WaitlistItem[];
  customers?: Customer[];
  onAddReservation: (res: Reservation) => void;
  onUpdateReservation?: (res: Reservation) => void;
  onUpdateReservationStatus: (resId: string, status: Reservation['status']) => void;
  onOpenTableOrder?: (table: Table) => void;
  onUpdateTable?: (table: Table) => void;
  onAddWaitlist?: (item: WaitlistItem) => void;
  onUpdateWaitlist?: (item: WaitlistItem) => void;
}

const PRESET_NOTE_TAGS = [
  '靠窗優先',
  '需兒童椅',
  '慶生祝賀',
  '週年紀念',
  '靠角靜音',
  '景觀座位',
  '素食需求',
  '輪椅友善',
  '自備酒水',
  '隱密包廂',
];

interface QuickNoteChipsProps {
  currentNotes: string;
  onUpdateNotes: (newNotes: string) => void;
}

const QuickNoteChips: React.FC<QuickNoteChipsProps> = ({ currentNotes, onUpdateNotes }) => {
  const toggleTag = (tag: string) => {
    if (currentNotes.includes(tag)) {
      const updated = currentNotes
        .split(/[,，]/)
        .map(s => s.trim())
        .filter(s => s && s !== tag)
        .join(', ');
      onUpdateNotes(updated);
    } else {
      const existing = currentNotes.trim();
      const updated = existing ? `${existing}, ${tag}` : tag;
      onUpdateNotes(updated);
    }
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <span>快速勾選備註需求 (Quick Select)</span>
        <span className="text-[10px] font-normal text-gray-400">點擊新增 / 再點擊取消</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESET_NOTE_TAGS.map(tag => {
          const isSelected = currentNotes.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all border flex items-center space-x-1 cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#FF8A00] border-[#FF8A00] text-white shadow-xs'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-[10px]">{isSelected ? '✓' : '+'}</span>
              <span>{tag}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

type ViewTab = 'timeline' | 'calendar' | 'list' | 'waitlist';

export const ReservationView: React.FC<ReservationViewProps> = ({
  reservations,
  tables,
  waitlist: propsWaitlist,
  customers,
  onAddReservation,
  onUpdateReservation,
  onUpdateReservationStatus,
  onOpenTableOrder,
  onUpdateTable,
  onAddWaitlist,
  onUpdateWaitlist,
}) => {
  const { t } = useTranslation();

  // Active View Tab: timeline (時間軸) | calendar (週日曆) | list (列表) | waitlist (現場候位)
  const [activeTab, setActiveTab] = useState<ViewTab>('timeline');

  // Selected Date in Asia/Taipei (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayUTC8());

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState<boolean>(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [selectedDetailReservation, setSelectedDetailReservation] = useState<Reservation | null>(null);
  const [seatingWaitlistItem, setSeatingWaitlistItem] = useState<WaitlistItem | null>(null);
  const [selectedSeatingTableId, setSelectedSeatingTableId] = useState<string>('');

  // Form State for Add Reservation
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(getTodayUTC8());
  const [time, setTime] = useState('19:00');
  const [partySize, setPartySize] = useState(4);
  const [tableId, setTableId] = useState('');
  const [notes, setNotes] = useState('');
  const [isStaffReviewing, setIsStaffReviewing] = useState<boolean>(false);

  // Form State for Walk-in / Direct Seating Registration
  const [registrationMode, setRegistrationMode] = useState<'direct_seat' | 'waitlist'>('direct_seat');
  const [selectedDirectSeatTableIds, setSelectedDirectSeatTableIds] = useState<string[]>([]);
  const [wlName, setWlName] = useState('');
  const [wlPhone, setWlPhone] = useState('');
  const [wlPartySize, setWlPartySize] = useState(2);
  const [wlWaitMinutes, setWlWaitMinutes] = useState(15);
  const [wlNotes, setWlNotes] = useState('');

  // Auto-match existing customer profile
  const matchedWalkinCustomer = useMemo(() => {
    if (!customers || customers.length === 0) return null;
    if (!wlName.trim() && !wlPhone.trim()) return null;
    return findExistingCustomer(customers, { name: wlName, phone: wlPhone });
  }, [customers, wlName, wlPhone]);

  // Available tables memo
  const availableTables = useMemo(() => {
    return tables.filter(t => t.status === 'Available');
  }, [tables]);

  // Helper to determine if a table is eligible for the selected party size
  const getTableEligibility = (tbl: Table, partySize: number) => {
    if (tbl.status !== 'Available') {
      return { eligible: false, badge: '🔒 請先清桌' };
    }
    const seats = tbl.seats || (tbl as any).capacity || 2;

    if (partySize <= 2) {
      const has2Seater = availableTables.some(t => (t.seats || (t as any).capacity || 2) <= 2);
      if (has2Seater) {
        if (seats <= 2) {
          return { eligible: true, badge: '✨ 2人專用桌' };
        } else {
          return { eligible: false, badge: '🚫 限2人桌 (不給選大桌)' };
        }
      } else {
        if (seats <= 4) {
          return { eligible: true, badge: '⚡ 彈性開4人桌' };
        } else {
          return { eligible: false, badge: '🚫 桌型過大' };
        }
      }
    } else if (partySize === 3 || partySize === 4) {
      const has4Seater = availableTables.some(t => {
        const s = t.seats || (t as any).capacity || 2;
        return s === 4 || s === 3;
      });
      if (has4Seater) {
        if (seats === 4 || seats === 3) {
          return { eligible: true, badge: '✨ 4人專用桌' };
        } else {
          return { eligible: false, badge: '🚫 限選4人桌' };
        }
      } else {
        if (seats >= 4) {
          return { eligible: true, badge: '⚡ 彈性開大桌' };
        } else {
          return { eligible: false, badge: '🚫 座位不足' };
        }
      }
    } else {
      // 5+ people (e.g., 6 people) -> Multi-select 併桌 mode!
      return { eligible: true, badge: '🔗 可參與併桌' };
    }
  };

  // Calculate total seats of currently selected direct seat tables
  const selectedTotalCapacity = useMemo(() => {
    return tables
      .filter(t => selectedDirectSeatTableIds.includes(t.id))
      .reduce((sum, t) => sum + (t.seats || (t as any).capacity || 2), 0);
  }, [tables, selectedDirectSeatTableIds]);

  // Auto-select valid tables when modal opens, mode changes, or party size changes
  useEffect(() => {
    if (showWaitlistModal && registrationMode === 'direct_seat') {
      const pSize = Number(wlPartySize) || 2;
      if (pSize <= 2) {
        const match = availableTables.find(t => (t.seats || (t as any).capacity || 2) <= 2) || availableTables[0];
        setSelectedDirectSeatTableIds(match ? [match.id] : []);
      } else if (pSize === 3 || pSize === 4) {
        const match = availableTables.find(t => (t.seats || (t as any).capacity || 2) === 4) || availableTables[0];
        setSelectedDirectSeatTableIds(match ? [match.id] : []);
      } else {
        // 5+ people (e.g. 6 people): Auto select table combination (e.g. 2-seater + 4-seater)
        let total = 0;
        const combo: string[] = [];
        const sorted = [...availableTables].sort((a, b) => (b.seats || 2) - (a.seats || 2));
        for (const t of sorted) {
          if (total < pSize) {
            combo.push(t.id);
            total += (t.seats || (t as any).capacity || 2);
          }
        }
        setSelectedDirectSeatTableIds(combo.length > 0 ? combo : (availableTables[0] ? [availableTables[0].id] : []));
      }
    }
  }, [showWaitlistModal, registrationMode, wlPartySize, availableTables]);

  // Handle table selection toggle
  const handleSelectDirectSeatTable = (tbl: Table) => {
    const pSize = Number(wlPartySize) || 2;
    const { eligible } = getTableEligibility(tbl, pSize);
    if (!eligible) return;

    if (pSize >= 5) {
      // Multi-select併桌 mode for 6+ people
      setSelectedDirectSeatTableIds(prev => {
        if (prev.includes(tbl.id)) {
          if (prev.length === 1) return prev; // Keep at least 1 table selected
          return prev.filter(id => id !== tbl.id);
        } else {
          return [...prev, tbl.id];
        }
      });
    } else {
      // Single-select mode for 2 or 4 people
      setSelectedDirectSeatTableIds([tbl.id]);
    }
  };

  // Walk-in Waitlist state
  const [localWaitlist, setLocalWaitlist] = useState<WaitlistItem[]>(() => {
    const saved = localStorage.getItem('gbg_waitlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialWaitlist;
      }
    }
    return initialWaitlist;
  });

  const waitlist = propsWaitlist || localWaitlist;

  useEffect(() => {
    if (!propsWaitlist) {
      localStorage.setItem('gbg_waitlist', JSON.stringify(waitlist));
    }
  }, [waitlist, propsWaitlist]);

  // Notifications & Alerts
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [reminderAlert, setReminderAlert] = useState<string | null>(null);
  const [previewEmailRes, setPreviewEmailRes] = useState<Reservation | null>(null);

  // Live Asia/Taipei Current Time for vertical line marker on Timeline
  const [nowTaipei, setNowTaipei] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTaipei(new Date());
    }, 30000); // update every 30s
    return () => clearInterval(timer);
  }, []);

  // Helper to format date with weekday in Asia/Taipei e.g. "11/2 (三)" or "2026-08-09 (日)"
  const formatHeaderDateWithWeekday = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const weekdaysZH = ['日', '一', '二', '三', '四', '五', '六'];
        const dayOfWeek = weekdaysZH[d.getDay()];
        return `${Number(parts[1])}/${Number(parts[2])} (${dayOfWeek})`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  // Date Navigation handlers
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + 1);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleToday = () => {
    setSelectedDate(getTodayUTC8());
  };

  // Filter reservations for selected date & search query
  const dayReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchDate = formatDateUTC8(res.date) === selectedDate;
      if (!matchDate) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        res.customerName.toLowerCase().includes(q) ||
        res.phone.includes(q) ||
        (res.tableName && res.tableName.toLowerCase().includes(q)) ||
        (res.notes && res.notes.toLowerCase().includes(q))
      );
    });
  }, [reservations, selectedDate, searchQuery]);

  // Statistics for selected date
  const totalParties = dayReservations.length;
  const totalGuests = dayReservations.reduce((acc, r) => acc + (r.partySize || 0), 0);

  // Active waiting guests count
  const activeWaitlistCount = waitlist.filter(w => w.status === 'Waiting' || w.status === 'Notified').length;

  // Form Submit for New Reservation
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) return;
    setIsStaffReviewing(true);
  };

  const handleFinalizeAdd = () => {
    const selectedTable = tables.find(t => t.id === tableId);

    const newRes: Reservation = {
      id: 'res-' + Date.now(),
      customerName,
      phone,
      email,
      date,
      time,
      partySize: Number(partySize),
      tableId: tableId || undefined,
      tableName: selectedTable ? selectedTable.name : undefined,
      status: 'Upcoming',
      notes,
      durationMinutes: 90, // default 90 min meal time
      createdAt: new Date().toISOString(),
    };

    onAddReservation(newRes);
    if (email) {
      gasService.sendReminderEmail(newRes);
    }

    setShowAddModal(false);
    setIsStaffReviewing(false);
    // Reset Form
    setCustomerName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  // Early Meal Finish handler - stops timer and releases table on timeline
  const handleFinishMealEarly = (res: Reservation) => {
    const nowHHMM = nowTaipei.toLocaleTimeString('en-GB', {
      timeZone: TIMEZONE_UTC8,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const formattedResTime = formatTimeUTC8(res.time);
    const [startH, startM] = formattedResTime.split(':').map(Number);
    const [endH, endM] = nowHHMM.split(':').map(Number);
    const computedMins = (endH - startH) * 60 + (endM - startM);
    const actualDuration = computedMins > 0 ? computedMins : (res.durationMinutes || 90);

    const updated: Reservation = {
      ...res,
      status: 'Completed',
      actualEndTime: nowHHMM,
      durationMinutes: actualDuration,
    };

    if (onUpdateReservation) {
      onUpdateReservation(updated);
    } else {
      onUpdateReservationStatus(res.id, 'Completed');
    }

    // Release table associated with this reservation
    const targetTable = tables.find(
      t =>
        (res.tableId && (t.id === res.tableId || t.name === res.tableId)) ||
        (res.tableName && (t.name === res.tableName || t.id === res.tableName)) ||
        (t.customerName && t.customerName.toLowerCase() === res.customerName.toLowerCase())
    );

    if (targetTable) {
      const releasedTable: Table = {
        ...targetTable,
        status: 'Available',
        currentOrderId: undefined,
        customerName: undefined,
        reservationTime: undefined,
      };
      if (onUpdateTable) {
        onUpdateTable(releasedTable);
      }
      gasService.syncTable(releasedTable);
    }

    setReminderAlert(`Meal finished early for ${res.customerName}. Table is now free!`);
    setTimeout(() => setReminderAlert(null), 4000);
  };

  // Walk-in / Direct Seating handlers
  const handleAddWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlName.trim() || !wlPhone.trim()) {
      alert('請輸入顧客姓名與電話號碼！');
      return;
    }

    const nowHHMM = nowTaipei.toLocaleTimeString('en-GB', {
      timeZone: TIMEZONE_UTC8,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    if (registrationMode === 'direct_seat') {
      const selectedTables = tables.filter(t => selectedDirectSeatTableIds.includes(t.id));

      if (selectedTables.length === 0) {
        alert('無可用空桌或尚未選取桌號！已切換至【現場候位發牌】。');
        setRegistrationMode('waitlist');
        return;
      }

      const primaryTable = selectedTables[0];
      const combinedTableName = selectedTables.map(t => t.name).join(' + ');

      const newRes: Reservation = {
        id: 'res-' + Date.now(),
        customerName: wlName.trim(),
        phone: wlPhone.trim(),
        date: getTodayUTC8(),
        time: nowHHMM,
        partySize: Number(wlPartySize) || 2,
        tableId: primaryTable.id,
        tableName: combinedTableName,
        status: 'Seated',
        notes: wlNotes
          ? `[免等待直接入座${selectedTables.length > 1 ? ` - 併桌: ${combinedTableName}` : ''}] ${wlNotes}`
          : `[免等待直接入座${selectedTables.length > 1 ? ` - 併桌: ${combinedTableName}` : ''}]`,
        durationMinutes: 90,
        seatedAt: nowHHMM,
        createdAt: new Date().toISOString(),
      };

      onAddReservation(newRes);

      // Update status for all selected tables to Occupied
      if (onUpdateTable) {
        selectedTables.forEach(st => {
          onUpdateTable({
            ...st,
            status: 'Occupied',
            customerName: wlName.trim(),
            mergedWith: selectedTables.length > 1 ? selectedTables.filter(x => x.id !== st.id).map(x => x.id) : undefined,
          });
        });
      }

      setShowWaitlistModal(false);
      setReminderAlert(
        `🎉 已為 ${wlName} (${wlPhone}) 安排 ${combinedTableName} 桌直接入座 (${selectedTotalCapacity}座位)，並成功紀錄/累積會員！`
      );
      setTimeout(() => setReminderAlert(null), 5000);

      setWlName('');
      setWlPhone('');
      setWlPartySize(2);
      setWlWaitMinutes(15);
      setWlNotes('');

      if (onOpenTableOrder) {
        onOpenTableOrder(primaryTable);
      }
    } else {
      const nextSeq = waitlist.length + 1;
      const newItem: WaitlistItem = {
        id: 'wl-' + Date.now(),
        queueNumber: `#W-${String(nextSeq).padStart(2, '0')}`,
        customerName: wlName.trim(),
        phone: wlPhone.trim(),
        partySize: Number(wlPartySize) || 2,
        notes: wlNotes,
        status: 'Waiting',
        createdAt: new Date().toISOString(),
        estimatedWaitMinutes: Number(wlWaitMinutes) || (wlPartySize > 4 ? 30 : 15),
      };

      if (onAddWaitlist) {
        onAddWaitlist(newItem);
      } else {
        setLocalWaitlist(prev => [newItem, ...prev]);
      }
      gasService.syncWaitlist(newItem);

      setShowWaitlistModal(false);
      setReminderAlert(
        `🎫 已為 ${wlName} (${wlPhone}) 完成現場候位登記 (${newItem.queueNumber})，並成功紀錄/累積會員！`
      );
      setTimeout(() => setReminderAlert(null), 5000);

      setWlName('');
      setWlPhone('');
      setWlPartySize(2);
      setWlWaitMinutes(15);
      setWlNotes('');
    }
  };

  const handleUpdateWaitlistStatus = (id: string, status: WaitlistItem['status']) => {
    const item = waitlist.find(w => w.id === id);
    if (!item) return;
    const updated = { ...item, status };
    if (onUpdateWaitlist) {
      onUpdateWaitlist(updated);
    } else {
      setLocalWaitlist(prev => prev.map(w => (w.id === id ? updated : w)));
    }
    gasService.syncWaitlist(updated);
  };

  const handleUpdateWaitlistWaitMinutes = (id: string, mins: number) => {
    const validMins = Math.max(0, mins);
    const item = waitlist.find(w => w.id === id);
    if (!item) return;
    const updated = { ...item, estimatedWaitMinutes: validMins };
    if (onUpdateWaitlist) {
      onUpdateWaitlist(updated);
    } else {
      setLocalWaitlist(prev => prev.map(w => (w.id === id ? updated : w)));
    }
    gasService.syncWaitlist(updated);
  };

  const handleConfirmSeatWaitlist = () => {
    if (!seatingWaitlistItem || !selectedSeatingTableId) return;

    const targetTable = tables.find(t => t.id === selectedSeatingTableId);

    // Create reservation for seated guest
    const nowHHMM = nowTaipei.toLocaleTimeString('en-GB', {
      timeZone: TIMEZONE_UTC8,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const newRes: Reservation = {
      id: 'res-' + Date.now(),
      customerName: seatingWaitlistItem.customerName,
      phone: seatingWaitlistItem.phone,
      date: getTodayUTC8(),
      time: nowHHMM,
      partySize: seatingWaitlistItem.partySize,
      tableId: targetTable?.id,
      tableName: targetTable?.name,
      status: 'Seated',
      notes: seatingWaitlistItem.notes ? `[Walk-in ${seatingWaitlistItem.queueNumber}] ${seatingWaitlistItem.notes}` : `[Walk-in ${seatingWaitlistItem.queueNumber}]`,
      durationMinutes: 90,
      seatedAt: nowHHMM,
      createdAt: new Date().toISOString(),
    };

    onAddReservation(newRes);
    handleUpdateWaitlistStatus(seatingWaitlistItem.id, 'Seated');

    setSeatingWaitlistItem(null);
    setSelectedSeatingTableId('');
    setReminderAlert(`Walk-in guest ${seatingWaitlistItem.customerName} seated at Table ${targetTable?.name || ''}!`);
    setTimeout(() => setReminderAlert(null), 4000);

    if (targetTable && onOpenTableOrder) {
      onOpenTableOrder(targetTable);
    }
  };

  const handleSendReminderNow = async (res: Reservation) => {
    if (!res.email) {
      setReminderAlert(`Guest ${res.customerName} has no email address configured.`);
      setTimeout(() => setReminderAlert(null), 4000);
      return;
    }
    setSendingReminderId(res.id);
    const result = await gasService.sendReminderEmail(res);
    setSendingReminderId(null);
    setPreviewEmailRes(null);
    setReminderAlert(result.message);
    setTimeout(() => setReminderAlert(null), 5000);
  };

  // Timeline Hours Grid configuration (10:00 to 22:00 = 12 hourly slots)
  const timelineSlots = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const startHour = 10;
  const endHour = 22;
  const totalHours = endHour - startHour; // 12 hours

  // Calculate current time position for vertical marker on timeline in Asia/Taipei timezone
  const getTaipeiTime = (d: Date) => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE_UTC8,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(d);
    let h = 0, m = 0;
    for (const part of parts) {
      if (part.type === 'hour') h = Number(part.value);
      if (part.type === 'minute') m = Number(part.value);
    }
    return { h, m };
  };

  const { h: nowHour, m: nowMin } = getTaipeiTime(nowTaipei);
  const currentTotalMinutes = (nowHour - startHour) * 60 + nowMin;
  const currentPosPercent = Math.max(0, Math.min(100, (currentTotalMinutes / (totalHours * 60)) * 100));

  const currentFormattedTime = nowTaipei.toLocaleTimeString('en-GB', {
    timeZone: TIMEZONE_UTC8,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Calculate timeline block left offset and width percentage
  const getTimelineBlockStyle = (res: Reservation) => {
    const formattedTime = formatTimeUTC8(res.time);
    const [h, m] = formattedTime.split(':').map(Number);
    const startMinutes = (h - startHour) * 60 + (m || 0);

    // Meal duration: default 90 mins
    let durationMins = res.durationMinutes || 90;

    // If completed and actualEndTime exists, calculate actual duration
    if (res.status === 'Completed' && res.actualEndTime) {
      const [endH, endM] = res.actualEndTime.split(':').map(Number);
      const actualDuration = (endH - h) * 60 + (endM - m);
      if (actualDuration > 0) {
        durationMins = actualDuration;
      }
    } else if (res.status === 'Seated' && selectedDate === getTodayUTC8()) {
      const currentDuration = currentTotalMinutes - startMinutes;
      if (currentDuration > durationMins) {
        durationMins = currentDuration;
      }
    }

    const leftPercent = (startMinutes / (totalHours * 60)) * 100;
    const widthPercent = (durationMins / (totalHours * 60)) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.min(100 - Math.max(0, leftPercent), widthPercent)}%`,
    };
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-[1600px] mx-auto animate-in fade-in">
      {/* TOP HEADER & CONTROL BAR (iCHEF Style) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white flex items-center">
                <CalendarIcon className="mr-2 h-6 w-6 text-[#FF8A00]" /> {t('nav_reservations')}
              </h1>
              <span className="rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#FF8A00] font-mono text-[10px] font-bold px-2 py-0.5 border border-orange-200 dark:border-orange-900">
                Asia/Taipei UTC+8
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Visual reservation timeline, 90-min meal timer control, calendar density & walk-in waitlist queue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setRegistrationMode('direct_seat');
                setShowWaitlistModal(true);
              }}
              className="flex items-center space-x-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 transition-all shadow-xs"
            >
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>+ 免等待直接入座</span>
            </button>

            <button
              onClick={() => {
                setRegistrationMode('waitlist');
                setShowWaitlistModal(true);
              }}
              className="flex items-center space-x-1.5 rounded-xl border border-orange-300 bg-orange-50 px-3.5 py-2 text-xs font-bold text-[#FF8A00] hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300 transition-all shadow-xs"
            >
              <BellRing className="h-4 w-4" />
              <span>+ 現場候位發牌</span>
              {activeWaitlistCount > 0 && (
                <span className="ml-1 rounded-full bg-[#FF8A00] px-1.5 py-0.2 text-[10px] text-white font-extrabold">
                  {activeWaitlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>+ 新增預約訂位</span>
            </button>
          </div>
        </div>

        {/* MIDDLE NAVIGATOR & VIEWS TOOLBAR */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          {/* Left: Date Switcher */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToday}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              今日
            </button>

            <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-0.5">
              <button
                onClick={handlePrevDay}
                className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                title="Previous Day"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="relative px-3 py-1 text-xs font-black text-gray-900 dark:text-white font-mono flex items-center">
                <span>{formatHeaderDateWithWeekday(selectedDate)}</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                />
              </div>

              <button
                onClick={handleNextDay}
                className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Total summary counter */}
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
              共 <span className="text-[#FF8A00] font-extrabold">{totalParties}</span> 組，
              <span className="text-[#FF8A00] font-extrabold">{totalGuests}</span> 位
            </div>
          </div>

          {/* Right: View Toggles & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋姓名/電話/桌號..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-40 sm:w-52 rounded-xl border border-gray-200 pl-8 pr-3 py-1.5 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
              />
            </div>

            <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center space-x-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-white text-[#FF8A00] shadow-xs dark:bg-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>時間軸</span>
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center space-x-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-white text-[#FF8A00] shadow-xs dark:bg-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>週日曆</span>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center space-x-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeTab === 'list'
                    ? 'bg-white text-[#FF8A00] shadow-xs dark:bg-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>列表</span>
              </button>

              <button
                onClick={() => setActiveTab('waitlist')}
                className={`flex items-center space-x-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeTab === 'waitlist'
                    ? 'bg-white text-[#FF8A00] shadow-xs dark:bg-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <BellRing className="h-3.5 w-3.5" />
                <span>現場候位</span>
                {activeWaitlistCount > 0 && (
                  <span className="rounded-full bg-rose-500 text-white text-[9px] px-1 font-bold">
                    {activeWaitlistCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {reminderAlert && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-xs font-bold text-[#FF8A00] dark:bg-orange-950/40 dark:border-orange-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <BellRing className="h-4 w-4 text-[#FF8A00]" />
            <span>{reminderAlert}</span>
          </div>
          <button onClick={() => setReminderAlert(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* VIEW CONTENT 1: TIMELINE GRID (時間軸) */}
      {activeTab === 'timeline' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-3 overflow-x-auto">
          {/* Header Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-gray-500 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                <span>已保留訂位</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span>已帶位/用餐中 (90分鐘)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-400"></span>
                <span>已結束/離席</span>
              </span>
            </div>

            <div className="text-[11px] text-gray-400 flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 text-[#FF8A00]" />
              <span>用餐時間預設 90 分鐘，點擊「結束用餐」可即時釋放桌位</span>
            </div>
          </div>

          {/* Timeline Table Grid */}
          <div className="min-w-[2200px] xl:min-w-[2600px] relative">
            {/* Hours Header Row */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 py-3 font-mono text-xs font-extrabold text-gray-500">
              <div className="w-36 shrink-0 px-3 text-gray-900 dark:text-white font-black text-sm">桌號 / 容量</div>
              <div className="flex-1 flex relative h-6">
                {timelineSlots.map(hour => (
                  <div key={hour} className="flex-1 border-l border-gray-200 dark:border-gray-800 relative px-1.5">
                    <span className="font-extrabold text-xs text-gray-700 dark:text-gray-300">
                      {hour}:00
                    </span>
                  </div>
                ))}
                <span className="absolute right-0 top-0 font-extrabold text-xs text-gray-700 dark:text-gray-300 pr-1">
                  22:00
                </span>
              </div>
            </div>

            {/* Vertical Live Current Time Marker */}
            {selectedDate === getTodayUTC8() && currentPosPercent >= 0 && currentPosPercent <= 100 && (
              <div
                className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center -ml-px"
                style={{ left: `calc(9rem + (100% - 9rem) * ${currentPosPercent / 100})` }}
              >
                <div className="bg-[#0091FF] text-white font-mono text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg z-30 transform -translate-x-1/2">
                  {currentFormattedTime}
                </div>
                <div className="w-0.5 h-full bg-[#0091FF] shadow-md"></div>
              </div>
            )}

            {/* Table Rows */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {tables.map(table => {
                // Find reservations for this table on selected date (including merged tables)
                const tableResList = dayReservations.filter(r => {
                  if (r.tableId && r.tableId === table.id) return true;
                  if (r.tableName && r.tableName.trim().toLowerCase() === table.name.trim().toLowerCase()) return true;

                  // Check if tableName is composite (e.g. "T1 + T2" or "T1, T2")
                  if (r.tableName) {
                    const parts = r.tableName.split(/[\+,&/]/).map(s => s.trim().toLowerCase());
                    if (
                      parts.includes(table.name.trim().toLowerCase()) ||
                      parts.includes(`table ${table.name}`.toLowerCase()) ||
                      parts.includes(`桌 ${table.name}`.toLowerCase())
                    ) {
                      return true;
                    }
                  }

                  // Check if table has merged partners
                  if (table.mergedWith && table.mergedWith.length > 0) {
                    if (r.tableId && table.mergedWith.includes(r.tableId)) return true;
                    const mergedPartnerNames = tables
                      .filter(t => table.mergedWith?.includes(t.id))
                      .map(t => t.name.trim().toLowerCase());
                    if (r.tableName && mergedPartnerNames.includes(r.tableName.trim().toLowerCase())) return true;
                    if (r.tableName) {
                      const parts = r.tableName.split(/[\+,&/]/).map(s => s.trim().toLowerCase());
                      if (parts.some(p => mergedPartnerNames.includes(p))) return true;
                    }
                  }

                  // Check if tableId contains comma/plus separated table IDs
                  if (r.tableId && (r.tableId.includes(',') || r.tableId.includes('+'))) {
                    const ids = r.tableId.split(/[\+,]/).map(s => s.trim());
                    if (ids.includes(table.id) || ids.includes(table.name)) return true;
                  }

                  return false;
                });

                return (
                  <div key={table.id} className="flex items-center py-3 min-h-[90px] hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    {/* Table Label */}
                    <div className="w-36 shrink-0 px-3 font-bold text-xs text-gray-900 dark:text-white flex flex-col justify-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-lg text-gray-900 dark:text-white">{table.name}</span>
                        <span className="text-xs font-extrabold text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
                          {table.seats}人
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-bold mt-1">{table.zone}</span>
                    </div>

                    {/* Timeline Row Slots & Reservation Blocks */}
                    <div className="flex-1 relative h-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden flex">
                      {/* Hourly Background Grid Lines */}
                      {timelineSlots.map(hour => (
                        <div
                          key={hour}
                          className="flex-1 border-l border-gray-200/60 dark:border-gray-800/60 h-full hover:bg-orange-50/50 dark:hover:bg-orange-950/20 cursor-pointer transition-colors"
                          onClick={() => {
                            // Quick fill modal
                            setDate(selectedDate);
                            setTime(`${String(hour).padStart(2, '0')}:00`);
                            setTableId(table.id);
                            setShowAddModal(true);
                          }}
                        />
                      ))}

                      {/* Render Reservation Blocks */}
                      {tableResList.map(res => {
                        const style = getTimelineBlockStyle(res);
                        const isSeated = res.status === 'Seated';
                        const isCompleted = res.status === 'Completed';

                        return (
                          <div
                            key={res.id}
                            onClick={() => setSelectedDetailReservation(res)}
                            className={`absolute top-1 bottom-1 z-10 rounded-2xl px-3.5 py-2 text-xs shadow-md border-2 transition-all flex flex-col justify-between overflow-hidden group cursor-pointer hover:z-30 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] ${
                              isSeated
                                ? 'bg-gradient-to-r from-emerald-50 via-emerald-100/60 to-emerald-50 border-emerald-400 text-emerald-950 dark:from-emerald-950 dark:to-emerald-900 dark:border-emerald-600 dark:text-emerald-100 border-l-8 border-l-emerald-600 shadow-emerald-500/10'
                                : isCompleted
                                ? 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-700 opacity-70 border-l-6 border-l-gray-400'
                                : 'bg-gradient-to-r from-amber-50 via-orange-100/60 to-amber-50 border-amber-400 text-amber-950 dark:from-amber-950 dark:to-amber-900 dark:border-amber-600 dark:text-amber-100 border-l-8 border-l-amber-500 shadow-amber-500/10'
                            }`}
                            style={style}
                            title={`點擊查看詳細訂位資訊 (${res.customerName} - ${res.partySize}人)`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-2 font-black min-w-0">
                                <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white group-hover:text-[#FF8A00] transition-colors whitespace-nowrap">{res.customerName}</span>
                                <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-white/95 dark:bg-black/70 shadow-2xs border border-black/10 dark:border-white/10 shrink-0">
                                  {res.partySize}人
                                </span>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-900 text-amber-300 dark:bg-black dark:text-amber-300 shrink-0 font-mono shadow-2xs">
                                  {res.time}{res.actualEndTime ? ` - ${res.actualEndTime}` : ''}
                                </span>
                                {res.durationMinutes && (
                                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded shadow-2xs ${
                                    res.durationMinutes > 90
                                      ? 'bg-rose-600 text-white dark:bg-rose-700'
                                      : 'bg-white/90 text-gray-800 dark:bg-black/60 dark:text-gray-200'
                                  }`}>
                                    {res.durationMinutes}分{res.durationMinutes > 90 ? ' (超時)' : ''}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-1">
                              <div className="flex items-center space-x-2 overflow-hidden">
                                <span className={`text-xs font-black px-2.5 py-0.5 rounded-md shrink-0 ${
                                  isSeated ? 'bg-emerald-600 text-white' : isCompleted ? 'bg-gray-500 text-white' : 'bg-amber-500 text-slate-950 font-black'
                                }`}>
                                  {isSeated ? '🟢 用餐中' : isCompleted ? '⚪ 結束用餐' : '🟡 已預約'}
                                </span>
                                {res.notes && (
                                  <span className="text-xs font-bold text-orange-950 dark:text-orange-200 bg-white/80 dark:bg-black/50 px-2 py-0.5 rounded-md border border-orange-200/80 dark:border-orange-800/80 truncate max-w-[280px]">
                                    {res.notes}
                                  </span>
                                )}
                              </div>

                              {/* Seated Actions */}
                              {isSeated && (
                                <div className="flex items-center space-x-1 shrink-0">
                                  {onOpenTableOrder && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const targetTable = tables.find(t => t.id === res.tableId || t.name === res.tableId || t.name === res.tableName || t.id === table.id);
                                        if (targetTable) {
                                          onOpenTableOrder(targetTable);
                                        }
                                      }}
                                      className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[10px] px-2 py-0.5 shadow-xs transition-transform active:scale-95 shrink-0"
                                      title="直接跳轉至該桌點餐頁面"
                                    >
                                      點餐
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFinishMealEarly(res);
                                    }}
                                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2 py-0.5 shadow-xs transition-transform active:scale-95 shrink-0"
                                    title="Finish meal early & release table"
                                  >
                                    結束用餐
                                  </button>
                                </div>
                              )}

                              {res.status === 'Upcoming' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateReservationStatus(res.id, 'Seated');
                                  }}
                                  className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] px-2 py-0.5 shadow-xs transition-transform active:scale-95 shrink-0"
                                >
                                  帶位
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW CONTENT 2: WEEK DENSITY CALENDAR (週日曆 / 預約密度) */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-[#FF8A00]" /> 7 天預約密度概覽 (7-Day Density Calendar)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Visual breakdown of reservation volume and dining peak hours across the upcoming week.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
              {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                const [y, m, d] = selectedDate.split('-').map(Number);
                const currDateObj = new Date(y, m - 1, d);
                currDateObj.setDate(currDateObj.getDate() + offset);

                const cY = currDateObj.getFullYear();
                const cM = String(currDateObj.getMonth() + 1).padStart(2, '0');
                const cD = String(currDateObj.getDate()).padStart(2, '0');
                const dateKey = `${cY}-${cM}-${cD}`;

                const dayRes = reservations.filter(r => formatDateUTC8(r.date) === dateKey);
                const dayParties = dayRes.length;
                const dayGuests = dayRes.reduce((a, b) => a + (b.partySize || 0), 0);

                // Peak periods math
                const lunchCount = dayRes.filter(r => {
                  const h = parseInt(r.time.split(':')[0], 10);
                  return h >= 11 && h < 14;
                }).length;

                const dinnerCount = dayRes.filter(r => {
                  const h = parseInt(r.time.split(':')[0], 10);
                  return h >= 17 && h < 21;
                }).length;

                const isSelected = selectedDate === dateKey;

                return (
                  <div
                    key={dateKey}
                    onClick={() => {
                      setSelectedDate(dateKey);
                      setActiveTab('timeline');
                    }}
                    className={`rounded-2xl border p-3.5 cursor-pointer transition-all hover:border-[#FF8A00] space-y-3 ${
                      isSelected
                        ? 'border-[#FF8A00] bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-[#FF8A00]/20'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                      <div className="font-bold text-xs text-gray-900 dark:text-white">
                        {formatHeaderDateWithWeekday(dateKey)}
                      </div>
                      {offset === 0 && (
                        <span className="rounded bg-[#FF8A00] text-white text-[9px] font-extrabold px-1.5 py-0.2">
                          Start
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 text-[11px]">總訂位:</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">{dayParties} 組</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 text-[11px]">總人數:</span>
                        <span className="font-extrabold text-[#FF8A00]">{dayGuests} 人</span>
                      </div>
                    </div>

                    {/* Peak hour breakdown */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px]">
                      <div>
                        <div className="flex justify-between text-gray-500 mb-0.5">
                          <span>午餐 Peak (11-14)</span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">{lunchCount} 組</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, lunchCount * 20)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-gray-500 mb-0.5">
                          <span>晚餐 Peak (17-21)</span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">{dinnerCount} 組</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, dinnerCount * 20)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button className="w-full mt-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[10px] font-bold py-1 hover:bg-[#FF8A00] hover:text-white transition-colors">
                      檢視時間軸 →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW CONTENT 3: LIST VIEW (列表) */}
      {activeTab === 'list' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800">
                  <th className="py-3">Guest Name</th>
                  <th className="py-3">Contact Email & Phone</th>
                  <th className="py-3">Date & Time</th>
                  <th className="py-3">Party Size</th>
                  <th className="py-3">Assigned Table</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Email & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium dark:divide-gray-800">
                {dayReservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                      No reservations found for {selectedDate}.
                    </td>
                  </tr>
                ) : (
                  dayReservations.map(res => (
                    <tr key={res.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="py-3 font-extrabold text-gray-900 dark:text-white">
                        {res.customerName}
                        {res.notes && <p className="text-[10px] text-gray-400 font-normal">"{res.notes}"</p>}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">
                        <div>{res.phone}</div>
                        {res.email ? (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center mt-0.5">
                            <Mail className="mr-1 h-3 w-3 inline" /> {res.email}
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400 italic">No email</div>
                        )}
                      </td>
                      <td className="py-3 font-semibold">
                        {formatDateUTC8(res.date)} @ {formatTimeDisplayUTC8(res.time)}
                      </td>
                      <td className="py-3 font-bold">{res.partySize} Guests</td>
                      <td className="py-3">{res.tableName ? `Table ${res.tableName}` : 'Unassigned'}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            res.status === 'Upcoming'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : res.status === 'Seated'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5">
                        {res.status === 'Upcoming' && (
                          <button
                            onClick={() => {
                              if (!res.email) {
                                setReminderAlert(`Guest ${res.customerName} has no email address configured.`);
                                setTimeout(() => setReminderAlert(null), 4000);
                              } else {
                                setPreviewEmailRes(res);
                              }
                            }}
                            disabled={sendingReminderId === res.id}
                            className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-indigo-700 transition-all inline-flex items-center space-x-1"
                            title="Preview and Send Email Confirmation"
                          >
                            <Send className="h-3 w-3" />
                            <span>Send Email</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingReservation({
                              ...res,
                              date: formatReservationDate(res.date),
                              time: formatReservationTime(res.time),
                            });
                          }}
                          className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        >
                          <Edit3 className="h-3 w-3 inline mr-1" />
                          Edit
                        </button>
                        {res.status === 'Upcoming' && (
                          <button
                            onClick={() => onUpdateReservationStatus(res.id, 'Seated')}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                          >
                            Seat Guest
                          </button>
                        )}
                        {res.status === 'Seated' && (
                          <button
                            onClick={() => handleFinishMealEarly(res)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                          >
                            結束用餐
                          </button>
                        )}
                        <button
                          onClick={() => onUpdateReservationStatus(res.id, 'Cancelled')}
                          className="rounded-lg border border-rose-200 px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-950 dark:hover:bg-rose-950/40"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW CONTENT 4: WALK-IN WAITLIST (現場候位) */}
      {activeTab === 'waitlist' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center">
                <BellRing className="mr-2 h-5 w-5 text-[#FF8A00]" /> 現場候位佇列 (Walk-in Waitlist Queue)
              </h2>
              <p className="text-xs text-gray-500">
                Manage walk-in guests, notify when tables are ready, and assign available tables.
              </p>
            </div>

            <button
              onClick={() => setShowWaitlistModal(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>+ 登記現場候位</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitlist.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400 italic">
                無現場候位客人 (No walk-in queue active).
              </div>
            ) : (
              waitlist.map(item => {
                const isWaiting = item.status === 'Waiting';
                const isNotified = item.status === 'Notified';
                const isSeated = item.status === 'Seated';

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 shadow-xs space-y-3 transition-all ${
                      isWaiting
                        ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20'
                        : isNotified
                        ? 'border-indigo-300 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30'
                        : isSeated
                        ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20 opacity-70'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-[#FF8A00] bg-white dark:bg-gray-900 px-2 py-0.5 rounded-lg border border-orange-200 dark:border-orange-900">
                        {item.queueNumber}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isWaiting
                            ? 'bg-amber-200 text-amber-900'
                            : isNotified
                            ? 'bg-indigo-200 text-indigo-900'
                            : isSeated
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {item.status === 'Waiting'
                          ? '候位中'
                          : item.status === 'Notified'
                          ? '已發送通知'
                          : item.status === 'Seated'
                          ? '已帶位'
                          : '已取消'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {item.customerName}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{item.phone}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-100 dark:border-gray-800 gap-2">
                      <span className="font-extrabold text-gray-800 dark:text-gray-200 flex items-center shrink-0">
                        <Users className="h-3.5 w-3.5 mr-1 text-[#FF8A00]" /> {item.partySize} 人
                      </span>

                      {/* Interactive Editable Wait Time */}
                      <div className="flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200/80 dark:border-amber-900/60">
                        <span className="text-amber-900 dark:text-amber-300 text-[11px] font-bold shrink-0">
                          預估等候
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateWaitlistWaitMinutes(item.id, (item.estimatedWaitMinutes || 15) - 5)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-black text-xs hover:bg-amber-100 active:scale-90 transition-all cursor-pointer shadow-xs"
                            title="減少 5 分鐘"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="300"
                            value={item.estimatedWaitMinutes ?? 15}
                            onChange={(e) => handleUpdateWaitlistWaitMinutes(item.id, Number(e.target.value))}
                            className="w-10 text-center font-black text-xs text-amber-950 dark:text-amber-300 bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-700 rounded py-0.5 px-0 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono shadow-inner"
                          />
                          <span className="text-amber-900 dark:text-amber-300 text-[11px] font-bold shrink-0">分</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateWaitlistWaitMinutes(item.id, (item.estimatedWaitMinutes || 15) + 5)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-black text-xs hover:bg-amber-100 active:scale-90 transition-all cursor-pointer shadow-xs"
                            title="增加 5 分鐘"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-gray-500 italic bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Waitlist Actions */}
                    {(isWaiting || isNotified) && (
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => {
                            setSeatingWaitlistItem(item);
                            setSelectedSeatingTableId(tables.find(t => t.status === 'Available')?.id || tables[0]?.id || '');
                          }}
                          className="flex-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all flex items-center justify-center space-x-1"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>安排帶位</span>
                        </button>

                        <button
                          onClick={() => {
                            handleUpdateWaitlistStatus(item.id, 'Notified');
                            const msg = encodeURIComponent(`【Grand Bistro】${item.customerName} 您好！您的 ${item.partySize} 人座位已準備好，請於 5 分鐘內至櫃檯報到，謝謝！`);
                            if (item.phone) {
                              window.open(`sms:${item.phone}?body=${msg}`, '_self');
                            }
                            setReminderAlert(`📱 已開啟簡訊發送至 ${item.phone || item.customerName} (${item.customerName} 已標記為已通知)`);
                            setTimeout(() => setReminderAlert(null), 5000);
                          }}
                          className="rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 flex items-center space-x-1"
                          title="點擊直接開啟簡訊發送通知"
                        >
                          <BellRing className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">簡訊通知</span>
                        </button>

                        <button
                          onClick={() => handleUpdateWaitlistStatus(item.id, 'Cancelled')}
                          className="rounded-xl border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW RESERVATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            {!isStaffReviewing ? (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Book Table Reservation</h3>
                <form onSubmit={handleAddSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Guest Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Robert Vance / 陳 先生"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <PhoneKeypadInput
                    label="Phone Number (聯絡電話)"
                    value={phone}
                    onChange={setPhone}
                    placeholder="0912-345-678"
                    required
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Email Address</label>
                    <input
                      type="email"
                      placeholder="guest@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Time</label>
                      <input
                        type="time"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Party Size</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={partySize}
                        onChange={e => setPartySize(Number(e.target.value))}
                        className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Assign Table</label>
                      <select
                        value={tableId}
                        onChange={e => setTableId(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      >
                        <option value="">Auto Assign</option>
                        {tables.map(t => (
                          <option key={t.id} value={t.id}>
                            Table {t.name} ({t.seats} seats)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Special Requests / Notes</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Quiet corner, anniversary celebration..."
                      className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    <QuickNoteChips currentNotes={notes} onUpdateNotes={setNotes} />
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
                    >
                      Review Booking Details
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="rounded-lg bg-orange-100 p-2 text-[#FF8A00] dark:bg-orange-950">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Review Reservation Overview</h3>
                    <p className="text-[11px] text-gray-500">Please double check booking details before confirming.</p>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-4 text-xs space-y-2.5 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Guest Name:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contact Phone:</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date & Time:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{date} at {time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Meal Duration:</span>
                    <span className="font-bold text-emerald-600">90 分鐘 (Default)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Party Size:</span>
                    <span className="font-bold text-[#FF8A00]">{partySize} Guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned Table:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {tableId ? tables.find(t => t.id === tableId)?.name || tableId : 'Auto Assign'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsStaffReviewing(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                  >
                    ✏️ Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalizeAdd}
                    className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
                  >
                    Confirm & Save Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ADD WALK-IN & DIRECT SEATING REGISTRATION */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center">
                  <UserCheck className="mr-2 h-5 w-5 text-[#FF8A00]" />
                  現場賓客登記 (Walk-in & Direct Seating)
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  登記電話與姓名可自動累積會員紅利點數與來店記錄
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWaitlistModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setRegistrationMode('direct_seat')}
                className={`flex items-center justify-center space-x-1.5 rounded-lg py-2 text-xs font-black transition-all ${
                  registrationMode === 'direct_seat'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>免等待直接入座</span>
              </button>
              <button
                type="button"
                onClick={() => setRegistrationMode('waitlist')}
                className={`flex items-center justify-center space-x-1.5 rounded-lg py-2 text-xs font-black transition-all ${
                  registrationMode === 'waitlist'
                    ? 'bg-[#FF8A00] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <BellRing className="h-4 w-4" />
                <span>現場候位發牌</span>
              </button>
            </div>

            <form onSubmit={handleAddWaitlist} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 dark:text-gray-300">
                    顧客姓名 (Guest Name) *
                  </label>
                  <input
                    type="text"
                    placeholder="例如：王小明"
                    value={wlName}
                    onChange={e => setWlName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:border-[#FF8A00] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 dark:text-gray-300">
                    用餐人數 (Party Size) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={wlPartySize}
                    onChange={e => setWlPartySize(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs font-black dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:border-[#FF8A00] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <PhoneKeypadInput
                label="聯絡電話 (Phone Number) *"
                value={wlPhone}
                onChange={setWlPhone}
                placeholder="例如：0912345678"
                required
              />

              {/* LIVE MEMBER IDENTIFICATION BOX */}
              {matchedWalkinCustomer ? (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 p-3 text-xs space-y-1 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
                  <div className="flex items-center justify-between font-extrabold">
                    <span className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-400" />
                      ✨ 識別為既有會員：{matchedWalkinCustomer.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[10px] font-black">
                      {matchedWalkinCustomer.tier} 會員
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-800 dark:text-emerald-300 pt-0.5">
                    <span>電話: {matchedWalkinCustomer.phone || wlPhone}</span>
                    <span>現有累積點數: <strong>{matchedWalkinCustomer.loyaltyPoints || 0} pts</strong></span>
                  </div>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium pt-0.5">
                    ✓ 登記完成將自動連結消費歷程並累積紅利點數！
                  </p>
                </div>
              ) : wlPhone.trim().length >= 7 ? (
                <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-900 p-3 text-xs space-y-1 text-blue-900 dark:text-blue-200 animate-in fade-in">
                  <div className="flex items-center justify-between font-extrabold">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                      🆕 註冊全新會員帳號
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 text-[10px] font-black">
                      迎賓點數 +100pts
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300">
                    電話 ({wlPhone}) 登記完成後，系統將自動建檔並開啟品牌會員紅利累積！
                  </p>
                </div>
              ) : null}

              {/* MODE SPECIFIC CONTROLS */}
              {registrationMode === 'direct_seat' ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      選擇開桌桌號 (Select Table)
                    </label>
                    {wlPartySize <= 2 ? (
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300">
                        🎯 2人用餐：鎖定2人專用桌號
                      </span>
                    ) : wlPartySize === 3 || wlPartySize === 4 ? (
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300">
                        🎯 4人用餐：鎖定4人專用桌號
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300">
                        🔗 {wlPartySize}人大桌：點選多張桌號組合進行併桌
                      </span>
                    )}
                  </div>

                  {tables.filter(t => t.status === 'Available').length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                        {tables.map(tbl => {
                          const seats = tbl.seats || (tbl as any).capacity || 2;
                          const { eligible, badge } = getTableEligibility(tbl, wlPartySize);
                          const isSelected = selectedDirectSeatTableIds.includes(tbl.id);

                          return (
                            <button
                              key={tbl.id}
                              type="button"
                              disabled={!eligible}
                              onClick={() => handleSelectDirectSeatTable(tbl)}
                              className={`p-2 rounded-xl text-left border transition-all relative ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400 font-bold'
                                  : eligible
                                  ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 hover:bg-emerald-50/60'
                                  : 'opacity-40 bg-gray-100 dark:bg-gray-800/80 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black">{tbl.name} 桌</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded-md font-extrabold ${
                                    isSelected
                                      ? 'bg-white text-emerald-800'
                                      : eligible
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                  }`}
                                >
                                  {isSelected ? '✓ 已選取' : `${seats}人桌`}
                                </span>
                              </div>
                              <div
                                className={`text-[10px] mt-1 font-medium ${
                                  isSelected
                                    ? 'text-emerald-100'
                                    : eligible
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-gray-400'
                                }`}
                              >
                                {badge}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* COMBINED CAPACITY SUMMARY FOR MULTI-SELECT (5+ PEOPLE) */}
                      {wlPartySize >= 5 && (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold">
                          <span className="flex items-center">
                            <Link2 className="h-4 w-4 mr-1 text-amber-600" />
                            已選 {selectedDirectSeatTableIds.length} 桌：
                            <span className="underline ml-1">
                              {tables
                                .filter(t => selectedDirectSeatTableIds.includes(t.id))
                                .map(t => `${t.name}桌(${t.seats || 2}位)`)
                                .join(' + ') || '尚未選擇'}
                            </span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              selectedTotalCapacity >= wlPartySize
                                ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                                : 'bg-rose-200 text-rose-900 dark:bg-rose-800 dark:text-rose-100'
                            }`}
                          >
                            合計 {selectedTotalCapacity} / 目標 {wlPartySize} 人
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
                      <span>⚠️ 目前全場客滿，尚無空桌可直接入座。</span>
                      <button
                        type="button"
                        onClick={() => setRegistrationMode('waitlist')}
                        className="px-2 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold"
                      >
                        切換至候位發牌
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">
                    預估等待時間 (分鐘) (Est. Wait Time)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={wlWaitMinutes}
                      onChange={e => setWlWaitMinutes(Number(e.target.value))}
                      className="w-24 rounded-xl border border-gray-200 p-2 text-xs font-black dark:bg-gray-800 dark:border-gray-700 text-amber-600 dark:text-amber-400 font-mono"
                      required
                    />
                    <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
                      {[10, 15, 20, 30, 45, 60].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setWlWaitMinutes(m)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                            wlWaitMinutes === m
                              ? 'bg-[#FF8A00] text-white border-[#FF8A00] shadow-xs'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {m}分
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">
                  備註需求 (Notes / Requests)
                </label>
                <textarea
                  rows={2}
                  placeholder="例如：靠窗優先, 需兒童椅..."
                  value={wlNotes}
                  onChange={e => setWlNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <QuickNoteChips currentNotes={wlNotes} onUpdateNotes={setWlNotes} />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowWaitlistModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition-all ${
                    registrationMode === 'direct_seat'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#FF8A00] hover:bg-[#e07900]'
                  }`}
                >
                  {registrationMode === 'direct_seat' ? '確認登記並直接開桌' : '確認登記並發放候位號碼'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SEAT WAITLIST GUEST */}
      {seatingWaitlistItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <UserCheck className="mr-2 h-5 w-5 text-emerald-600" /> 安排現場候位帶位
            </h3>

            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-xs space-y-1">
              <p><strong>號碼:</strong> {seatingWaitlistItem.queueNumber}</p>
              <p><strong>姓名:</strong> {seatingWaitlistItem.customerName}</p>
              <p><strong>人數:</strong> {seatingWaitlistItem.partySize} 人</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">選擇空桌帶位 (Select Table)</label>
              <select
                value={selectedSeatingTableId}
                onChange={e => setSelectedSeatingTableId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.id}>
                    Table {t.name} ({t.seats} seats) - {t.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setSeatingWaitlistItem(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmSeatWaitlist}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
              >
                確認帶位開桌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RESERVATION MODAL */}
      {editingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Edit3 className="mr-2 h-5 w-5 text-[#FF8A00]" /> Update Reservation Details
            </h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!editingReservation) return;
                const selectedTable = tables.find(t => t.id === editingReservation.tableId);
                const updatedRes: Reservation = {
                  ...editingReservation,
                  tableName: selectedTable ? selectedTable.name : editingReservation.tableName,
                };
                if (onUpdateReservation) {
                  onUpdateReservation(updatedRes);
                } else {
                  onUpdateReservationStatus(updatedRes.id, updatedRes.status);
                }
                setEditingReservation(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Guest Name</label>
                <input
                  type="text"
                  value={editingReservation.customerName}
                  onChange={e => setEditingReservation({ ...editingReservation, customerName: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <PhoneKeypadInput
                    label="Phone"
                    value={editingReservation.phone}
                    onChange={newPhone => setEditingReservation({ ...editingReservation, phone: newPhone })}
                    placeholder="0912-345-678"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={editingReservation.email || ''}
                    onChange={e => setEditingReservation({ ...editingReservation, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Date</label>
                  <input
                    type="date"
                    value={editingReservation.date}
                    onChange={e => setEditingReservation({ ...editingReservation, date: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Time</label>
                  <input
                    type="time"
                    value={editingReservation.time}
                    onChange={e => setEditingReservation({ ...editingReservation, time: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Party Size</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingReservation.partySize}
                    onChange={e => setEditingReservation({ ...editingReservation, partySize: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Table</label>
                  <select
                    value={editingReservation.tableId || ''}
                    onChange={e => setEditingReservation({ ...editingReservation, tableId: e.target.value || undefined })}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="">Unassigned</option>
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>
                        Table {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Status</label>
                  <select
                    value={editingReservation.status}
                    onChange={e => setEditingReservation({ ...editingReservation, status: e.target.value as Reservation['status'] })}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Seated">Seated</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-300">Notes</label>
                <textarea
                  rows={2}
                  value={editingReservation.notes || ''}
                  onChange={e => setEditingReservation({ ...editingReservation, notes: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <QuickNoteChips
                  currentNotes={editingReservation.notes || ''}
                  onUpdateNotes={newNotes => setEditingReservation({ ...editingReservation, notes: newNotes })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingReservation(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL PREVIEW MODAL */}
      {previewEmailRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Email Confirmation Preview</h3>
                  <p className="text-[11px] text-gray-500">To: <span className="font-semibold text-gray-800 dark:text-gray-200">{previewEmailRes.email}</span></p>
                </div>
              </div>
              <button
                onClick={() => setPreviewEmailRes(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-4 text-xs space-y-3 max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-800 leading-relaxed text-slate-800 dark:text-slate-200">
              <p>Dear <strong>{previewEmailRes.customerName}</strong>,</p>
              <p>We are pleased to remind you of your upcoming reservation at <strong>Grand Bistro & Grill</strong>.</p>

              <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 space-y-1 my-2">
                <h4 className="font-extrabold text-[#FF8A00] text-[11px] uppercase tracking-wider border-b border-orange-100 pb-1 mb-2 dark:border-orange-950">
                  Reservation Details
                </h4>
                <p><strong>Date:</strong> {previewEmailRes.date}</p>
                <p><strong>Time:</strong> {previewEmailRes.time}</p>
                <p><strong>Guests:</strong> {previewEmailRes.partySize}</p>
                <p><strong>Reservation Name:</strong> {previewEmailRes.customerName}</p>
              </div>

              <p>Thank you for choosing <strong>Grand Bistro & Grill</strong>.</p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewEmailRes(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSendReminderNow(previewEmailRes)}
                disabled={sendingReminderId === previewEmailRes.id}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 flex items-center space-x-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{sendingReminderId === previewEmailRes.id ? 'Sending...' : 'Send Confirmation Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESERVATION DETAIL POPUP MODAL */}
      {selectedDetailReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-lg font-black shadow-md shadow-orange-500/20">
                  {selectedDetailReservation.customerName.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                      {selectedDetailReservation.customerName}
                    </h3>
                    <span className={`px-2.5 py-0.5 text-xs font-black rounded-full shadow-2xs ${
                      selectedDetailReservation.status === 'Seated'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                        : selectedDetailReservation.status === 'Completed'
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                    }`}>
                      {selectedDetailReservation.status === 'Seated' ? '🟢 用餐中 (Seated)' : selectedDetailReservation.status === 'Completed' ? '⚪ 已結束 (Completed)' : '🟡 已預約 (Upcoming)'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    訂位編號: #{selectedDetailReservation.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailReservation(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Core Info Cards Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800/60 p-3.5 border border-slate-100 dark:border-gray-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">預約日期與時間</span>
                <div className="font-extrabold text-sm text-gray-900 dark:text-white font-mono">
                  {selectedDetailReservation.date}
                </div>
                <div className="font-bold text-amber-600 dark:text-amber-400 font-mono text-xs">
                  {selectedDetailReservation.time} ({selectedDetailReservation.durationMinutes || 90} 分鐘)
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800/60 p-3.5 border border-slate-100 dark:border-gray-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">人數與桌號</span>
                <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {selectedDetailReservation.partySize} 人用餐
                </div>
                <div className="font-bold text-gray-600 dark:text-gray-300 text-xs">
                  {selectedDetailReservation.tableId
                    ? `桌號: Table ${tables.find(t => t.id === selectedDetailReservation.tableId)?.name || selectedDetailReservation.tableName || selectedDetailReservation.tableId}`
                    : '未指定桌號 (Unassigned)'}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800/60 p-3.5 border border-slate-100 dark:border-gray-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">聯絡電話</span>
                <div className="font-extrabold text-sm text-gray-900 dark:text-white font-mono flex items-center justify-between">
                  <span>{selectedDetailReservation.phone}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedDetailReservation.phone);
                      setReminderAlert(`已複製電話號碼: ${selectedDetailReservation.phone}`);
                      setTimeout(() => setReminderAlert(null), 3000);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-[#FF8A00] hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    複製
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800/60 p-3.5 border border-slate-100 dark:border-gray-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">電子郵件</span>
                <div className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                  {selectedDetailReservation.email || '未提供 Email'}
                </div>
              </div>
            </div>

            {/* Special Notes & Tags */}
            <div className="rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 p-4 border border-orange-200/60 dark:border-orange-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#FF8A00] flex items-center">
                  備註需求與偏好
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                {selectedDetailReservation.notes || '無特殊備註'}
              </p>
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {selectedDetailReservation.status === 'Upcoming' && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateReservationStatus(selectedDetailReservation.id, 'Seated');
                      setSelectedDetailReservation(prev => prev ? { ...prev, status: 'Seated' } : null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    🟢 帶位 (Seat Guest)
                  </button>
                )}

                {selectedDetailReservation.status === 'Seated' && (
                  <>
                    {onOpenTableOrder && (
                      <button
                        type="button"
                        onClick={() => {
                          const targetTable = tables.find(t => t.id === selectedDetailReservation.tableId || t.name === selectedDetailReservation.tableId || t.name === selectedDetailReservation.tableName);
                          if (targetTable) {
                            onOpenTableOrder(targetTable);
                            setSelectedDetailReservation(null);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
                      >
                        <span>📋 前往桌位點餐</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        handleFinishMealEarly(selectedDetailReservation);
                        setSelectedDetailReservation(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      🏁 結束用餐 (Finish Meal)
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const res = selectedDetailReservation;
                    setSelectedDetailReservation(null);
                    setEditingReservation({
                      ...res,
                      date: formatReservationDate(res.date),
                      time: formatReservationTime(res.time),
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  ✏️ 編輯資料
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {selectedDetailReservation.email && (
                  <button
                    type="button"
                    onClick={() => {
                      const res = selectedDetailReservation;
                      setSelectedDetailReservation(null);
                      setPreviewEmailRes(res);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    ✉️ 發送確認信
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedDetailReservation(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
