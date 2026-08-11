import React, { useState } from 'react';
import {
  Utensils,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Star,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  User,
  Mail,
  Users,
  MessageSquare,
  Globe,
  ArrowRight,
  Flame,
  Coffee,
  Wine,
  ShieldCheck,
  QrCode,
  Check,
} from 'lucide-react';
import { MenuItem, Reservation, RestaurantSettings } from '../types';
import { gasService } from '../services/gasService';
import { useTranslation } from '../i18n/useTranslation';
import { Language } from '../i18n/translations';
import {
  getCategoryLabel,
  getDishName,
  getDishDescription,
} from '../i18n/publicI18n';

interface PublicLandingViewProps {
  settings: RestaurantSettings;
  menuItems: MenuItem[];
  onAddReservation: (res: Reservation) => void;
  onNavigateTab: (tab: any) => void;
  onLaunchCustomerOrdering?: () => void;
  onOpenAuth?: () => void;
  onOpenMembership?: () => void;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  settings,
  menuItems,
  onAddReservation,
  onNavigateTab,
  onLaunchCustomerOrdering,
  onOpenAuth,
  onOpenMembership,
}) => {
  const { lang, changeLanguage } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Active Category Filter for Menu Showcase
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Reservation Form State
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [partySize, setPartySize] = useState<number>(2);
  const [notes, setNotes] = useState('');
  const [zonePreference, setZonePreference] = useState('Main Dining Hall');

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [showReviewStep, setShowReviewStep] = useState<boolean>(false);

  const categories = ['All', 'Starters', 'Mains', 'Fries', 'Drinks', 'Desserts', 'Combos'];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredItems = menuItems.filter(
    item => activeCategory === 'All' || item.category === activeCategory
  );

  const handleReviewStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !phone) return;
    setShowReviewStep(true);
  };

  const handleFinalizeSubmit = async () => {
    setIsSubmitting(true);

    const newRes: Reservation = {
      id: 'res-' + Date.now(),
      customerName: guestName,
      phone,
      email,
      date,
      time,
      partySize: Number(partySize),
      status: 'Upcoming',
      notes: zonePreference ? `[${zonePreference}] ${notes}`.trim() : notes,
      createdAt: new Date().toISOString(),
    };

    // Save to App State
    onAddReservation(newRes);

    // Sync to Google Sheets automatically
    if (settings.gasWebAppUrl) {
      await gasService.syncAllToGoogleSheets(
        settings.gasWebAppUrl,
        { reservations: [newRes] }
      );
    }

    if (email) {
      gasService.sendReminderEmail(newRes);
    }

    setIsSubmitting(false);
    setShowReviewStep(false);
    setConfirmedReservation(newRes);
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  const currentLangLabel = languages.find(l => l.code === lang)?.label || '繁體中文';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-white">
      {/* TOP ANNOUNCEMENT & NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-2.5 text-white shadow-lg flex items-center justify-center">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">
                {lang === 'zh-TW'
                  ? '格蘭小酒館＆炭烤餐廳'
                  : lang === 'ja'
                  ? 'グラン・ビストロ＆炭火焼きレストラン'
                  : 'Grand Bistro & Grill'}
              </span>
              <p className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">
                {lang === 'zh-TW' ? '頂級餐酒館與精緻料理' : lang === 'ja' ? 'ファインダイニング＆クラフト' : 'Fine Dining & Craft Hospitality'}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-300">
            <button onClick={() => scrollToSection('about')} className="hover:text-amber-400 transition-colors cursor-pointer">
              {lang === 'zh-TW' ? '品牌故事' : lang === 'ja' ? 'ストーリー' : 'Our Story'}
            </button>
            <button onClick={() => scrollToSection('menu')} className="hover:text-amber-400 transition-colors cursor-pointer">
              {lang === 'zh-TW' ? '精緻菜單' : lang === 'ja' ? 'メニュー' : 'Culinary Menu'}
            </button>
            <button onClick={() => scrollToSection('reservation')} className="hover:text-amber-400 transition-colors cursor-pointer">
              {lang === 'zh-TW' ? '線上訂位' : lang === 'ja' ? 'オンライン予約' : 'Book Table'}
            </button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-amber-400 transition-colors cursor-pointer">
              {lang === 'zh-TW' ? '門市資訊' : lang === 'ja' ? '店舗情報' : 'Contact'}
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            {/* Language Switcher Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Globe className="h-4 w-4 text-amber-400" />
                <span>{currentLangLabel}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl py-2 z-50 animate-in fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-800">
                    {lang === 'zh-TW' ? '選擇語言 / Language' : 'Select Language'}
                  </div>
                  {languages.map(item => (
                    <button
                      key={item.code}
                      onClick={() => {
                        changeLanguage(item.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-all text-left cursor-pointer ${
                        lang === item.code ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {lang === item.code && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (onOpenMembership) onOpenMembership();
              }}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>{lang === 'zh-TW' ? '會員登入 / 註冊' : lang === 'ja' ? '会員ログイン' : 'Sign in / Member'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section id="about" className="relative overflow-hidden py-20 lg:py-28 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/40 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-extrabold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>
                  {lang === 'zh-TW' ? '榮獲 2026 美食餐酒館第 1 名推薦' : lang === 'ja' ? '2026年ベストビストロ賞受賞' : 'Voted #1 Gourmet Bistro & Grill 2026'}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                {lang === 'zh-TW' ? (
                  <>開啟一趟難忘的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">極致味蕾饗宴</span></>
                ) : lang === 'ja' ? (
                  <>忘れられない <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">美食の旅へ</span></>
                ) : (
                  <>An Unforgettable <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Culinary Journey</span></>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl font-medium leading-relaxed">
                {lang === 'zh-TW' ? (
                  '嚴選柴燒熟成肋眼牛排、手作義大利麵與農場直送新鮮食材，在優雅溫馨的浪漫氛圍中，為您呈獻令人激賞的極致餐飲體驗。'
                ) : lang === 'ja' ? (
                  'オーク材で焼き上げた熟成ステーキ、自家製パスタ、厳選された新鮮な食材で特別なひとときをお届けします。'
                ) : (
                  'Experience wood-fired artisanal steaks, hand-crafted artisan pastas, and organic farm-to-table delicacies served in a vibrant, sophisticated ambiance.'
                )}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => scrollToSection('reservation')}
                  className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-4 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  <span>{lang === 'zh-TW' ? '立即預約訂位' : lang === 'ja' ? '今すぐオンライン予約' : 'Reserve Your Table Now'}</span>
                </button>

                <button
                  onClick={() => scrollToSection('menu')}
                  className="rounded-2xl bg-slate-800 border border-slate-700 px-7 py-4 text-sm font-bold text-white hover:bg-slate-700 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Utensils className="h-4 w-4 text-amber-400" />
                  <span>{lang === 'zh-TW' ? '瀏覽精緻菜單' : lang === 'ja' ? 'メニューを見る' : 'Explore Menu'}</span>
                </button>
              </div>

              {/* Quick Info Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {lang === 'zh-TW' ? '營業時間' : lang === 'ja' ? '営業時間' : 'Hours'}
                    </p>
                    <p className="text-xs font-bold text-slate-200">10:00 - 23:00</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {lang === 'zh-TW' ? '門市地址' : lang === 'ja' ? '所在地' : 'Location'}
                    </p>
                    <p className="text-xs font-bold text-slate-200">
                      {lang === 'zh-TW'
                        ? '桃園市桃園區中正路 368 號'
                        : lang === 'ja'
                        ? '桃園市桃園区中正路368号'
                        : 'No. 368, Zhongzheng Rd., Taoyuan Dist., Taoyuan City'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {lang === 'zh-TW' ? '預約專線' : lang === 'ja' ? '電話番号' : 'Reservations'}
                    </p>
                    <p className="text-xs font-bold text-slate-200">03-356-7284</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Banner Stack */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80"
                  alt="Restaurant Dining Atmosphere"
                  className="w-full h-[440px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {lang === 'zh-TW' ? '尊榮餐飲體驗' : lang === 'ja' ? '最高の雰囲気' : 'Atmosphere'}
                    </p>
                    <h3 className="text-lg font-black text-white">
                      {lang === 'zh-TW' ? '浪漫奢華氛圍與私密包廂' : lang === 'ja' ? 'エレガントな空間とプライベートルーム' : 'Romantic Dining & Private Salons'}
                    </h3>
                  </div>
                  <span className="rounded-xl bg-amber-500 text-slate-950 font-black px-3 py-1.5 text-xs">
                    4.9 ★★★★★
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ONLINE RESERVATIONS SECTION */}
      <section id="reservation" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1 text-xs font-bold text-amber-400 mb-3">
              <Calendar className="h-3.5 w-3.5" />
              <span>{lang === 'zh-TW' ? '即時確認訂位' : lang === 'ja' ? '即時確認' : 'Instant Confirmation'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              {lang === 'zh-TW' ? '線上預約訂位' : lang === 'ja' ? 'オンライン席予約' : 'Online Table Reservation'}
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              {lang === 'zh-TW'
                ? '輕鬆預約您的專屬桌位，訂位資訊將即時同步至門市接待系統。'
                : lang === 'ja'
                ? 'ご希望の日時でテーブルを即座に予約。予約データは店舗ホストにリアルタイムで同期されます。'
                : 'Book your preferred seating instantly. Reservations automatically sync with our dining room host stand.'}
            </p>
          </div>

          {confirmedReservation ? (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/40 p-8 text-center space-y-4 animate-in fade-in">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black text-white">
                {lang === 'zh-TW' ? '訂位已成功確認！' : lang === 'ja' ? 'ご予約が完了いたしました！' : 'Reservation Confirmed!'}
              </h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                {lang === 'zh-TW' ? (
                  <>感謝您，<strong className="text-white">{confirmedReservation.customerName}</strong>！我們期待在 <strong className="text-white">{confirmedReservation.date}</strong> <strong className="text-white">{confirmedReservation.time}</strong> 迎接您的 <strong className="text-amber-400">{confirmedReservation.partySize} 位貴賓</strong>。</>
                ) : lang === 'ja' ? (
                  <>ご予約ありがとうございます、<strong className="text-white">{confirmedReservation.customerName}</strong> 様！ <strong className="text-white">{confirmedReservation.date}</strong> <strong className="text-white">{confirmedReservation.time}</strong> に <strong className="text-amber-400">{confirmedReservation.partySize} 名様</strong>のご来店を心よりお待ちしております。</>
                ) : (
                  <>Thank you, <strong className="text-white">{confirmedReservation.customerName}</strong>! We look forward to welcoming your party of <strong className="text-amber-400">{confirmedReservation.partySize} guests</strong> on <strong className="text-white">{confirmedReservation.date}</strong> at <strong className="text-white">{confirmedReservation.time}</strong>.</>
                )}
              </p>

              <div className="inline-block rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs text-left space-y-1">
                <p className="text-slate-400 font-bold uppercase text-[10px]">
                  {lang === 'zh-TW' ? '訂位編號' : lang === 'ja' ? 'ご予約番号' : 'Booking Reference'}
                </p>
                <p className="font-mono text-amber-400 font-bold text-base">{confirmedReservation.id}</p>
                <p className="text-slate-400">
                  {lang === 'zh-TW' ? '狀態: ' : lang === 'ja' ? 'ステータス: ' : 'Status: '}
                  <span className="text-emerald-400 font-bold">
                    {lang === 'zh-TW' ? '已即時同步至門市現場' : lang === 'ja' ? '店舗ホストにリアルタイム同期済み' : 'Synced to Restaurant Host Stand'}
                  </span>
                </p>
              </div>

              <div>
                <button
                  onClick={() => setConfirmedReservation(null)}
                  className="rounded-xl bg-slate-800 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-all cursor-pointer"
                >
                  {lang === 'zh-TW' ? '預約其他時間' : lang === 'ja' ? '別の予約を行う' : 'Book Another Table'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReviewStart} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center">
                    <User className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                    {lang === 'zh-TW' ? '顧客姓名' : lang === 'ja' ? 'お名前' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'zh-TW' ? '例：林尚哲先生' : lang === 'ja' ? '例：山田 太郎' : 'e.g. Eleanor Vance'}
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm font-medium text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                    {lang === 'zh-TW' ? '聯絡電話' : lang === 'ja' ? '電話番号' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912-345-678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm font-medium text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                    {lang === 'zh-TW' ? '電子信箱' : lang === 'ja' ? 'メールアドレス' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm font-medium text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                    {lang === 'zh-TW' ? '用餐日期' : lang === 'ja' ? 'ご来店日' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm font-medium text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                    {lang === 'zh-TW' ? '用餐時間' : lang === 'ja' ? 'ご来店時間' : 'Time'}
                  </label>
                  <select
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm font-medium text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    {['11:30', '12:00', '12:30', '13:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                      <option key={t} value={t} className="bg-slate-900">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                    {lang === 'zh-TW' ? '用餐人數' : lang === 'ja' ? 'ご予約人數' : 'Number of Guests'}
                  </label>
                  <select
                    value={partySize}
                    onChange={e => setPartySize(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm font-medium text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(num => (
                      <option key={num} value={num} className="bg-slate-900">
                        {num} {lang === 'zh-TW' ? '位貴賓' : lang === 'ja' ? '名様' : num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                    {lang === 'zh-TW' ? '用餐區域偏好' : lang === 'ja' ? 'お席のご希望' : 'Seating Preference'}
                  </label>
                  <select
                    value={zonePreference}
                    onChange={e => setZonePreference(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm font-medium text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Main Dining Hall" className="bg-slate-900">
                      {lang === 'zh-TW' ? '主餐廳大廳' : lang === 'ja' ? 'メインダイニングホール' : 'Main Dining Hall'}
                    </option>
                    <option value="Romantic Patio" className="bg-slate-900">
                      {lang === 'zh-TW' ? '浪漫夕陽陽台' : lang === 'ja' ? 'サンセットテラス席' : 'Romantic Sunset Patio'}
                    </option>
                    <option value="VIP Private Room" className="bg-slate-900">
                      {lang === 'zh-TW' ? 'VIP 獨立隱密包廂' : lang === 'ja' ? 'VIP個室' : 'VIP Private Room'}
                    </option>
                    <option value="Bar Lounge" className="bg-slate-900">
                      {lang === 'zh-TW' ? '吧檯酒廊' : lang === 'ja' ? 'バーラウンジ' : 'Bar Lounge'}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center">
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                  {lang === 'zh-TW' ? '特殊需求與備註' : lang === 'ja' ? '特別なおリクエスト・備考' : 'Special Request & Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder={lang === 'zh-TW' ? '週年慶祝、需兒童椅、飲食過敏提醒...' : lang === 'ja' ? '記念日のご利用、ベビーチェアのご希望、アレルギーなど...' : 'Anniversary celebration, high chair needed, dietary restrictions...'}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm font-medium text-white focus:border-amber-500 focus:outline-hidden"
                />
                <div className="mt-2 space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                    <span>{lang === 'zh-TW' ? '快速勾選需求' : lang === 'ja' ? 'クイック要望タグ' : 'Quick Selection Tags'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { zh: '靠窗優先', ja: '窓側の席', en: 'Window Seat' },
                      { zh: '需兒童椅', ja: 'ベビーチェア', en: 'High Chair' },
                      { zh: '慶生祝賀', ja: '誕生日のお祝い', en: 'Birthday' },
                      { zh: '週年紀念', ja: '記念日', en: 'Anniversary' },
                      { zh: '靠角靜音', ja: '静かな席', en: 'Quiet Table' },
                      { zh: '景觀座位', ja: '眺めの良い席', en: 'Scenic View' },
                      { zh: '素食需求', ja: 'ベジタリアン対応', en: 'Vegetarian' },
                      { zh: '輪椅友善', ja: '車椅子対応', en: 'Wheelchair' },
                      { zh: '自備酒水', ja: '持込希望 (BYOB)', en: 'BYOB' },
                      { zh: '隱密包廂', ja: '個室希望', en: 'Private Corner' },
                    ].map(tagObj => {
                      const tag = lang === 'zh-TW' ? tagObj.zh : lang === 'ja' ? tagObj.ja : tagObj.en;
                      const isSelected = notes.includes(tagObj.zh) || notes.includes(tagObj.ja) || notes.includes(tagObj.en);
                      return (
                        <button
                          key={tagObj.zh}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNotes(notes.split(/[,，]/).map(s => s.trim()).filter(s => s && s !== tagObj.zh && s !== tagObj.ja && s !== tagObj.en).join(', '));
                            } else {
                              const existing = notes.trim();
                              setNotes(existing ? `${existing}, ${tag}` : tag);
                            }
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all border flex items-center space-x-1 cursor-pointer select-none ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs font-bold'
                              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <span className="text-[10px]">{isSelected ? '✓' : '+'}</span>
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-center font-black text-slate-950 text-base shadow-xl shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>{lang === 'zh-TW' ? '查看並核對訂位資料' : lang === 'ja' ? 'ご予約内容の確認へ進む' : 'Review Reservation & Double Check'}</span>
              </button>
            </form>
          )}

          {/* OVERVIEW CONFIRMATION MODAL */}
          {showReviewStep && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
              <div className="w-full max-w-xl rounded-3xl border border-amber-500/30 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-400">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {lang === 'zh-TW' ? '核對您的訂位資訊' : lang === 'ja' ? 'ご予約内容のご確認' : 'Double Check Your Reservation'}
                      </h3>
                      <p className="text-xs text-slate-400">Grand Bistro & Grill • {lang === 'zh-TW' ? '訂位確認頁' : lang === 'ja' ? '予約確認ページ' : 'Overview Page'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReviewStep(false)}
                    className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* OVERVIEW DETAILS CARD */}
                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                    {lang === 'zh-TW' ? '訂位明細摘要' : lang === 'ja' ? 'ご予約明細' : 'Reservation Summary'}
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        {lang === 'zh-TW' ? '顧客姓名' : lang === 'ja' ? 'お名前' : 'Guest Name'}
                      </span>
                      <strong className="text-white text-base">{guestName}</strong>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        {lang === 'zh-TW' ? '預約人數' : lang === 'ja' ? '人数' : 'Party Size'}
                      </span>
                      <strong className="text-amber-400 text-base">
                        {partySize} {lang === 'zh-TW' ? '位貴賓' : lang === 'ja' ? '名様' : partySize === 1 ? 'Guest' : 'Guests'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        {lang === 'zh-TW' ? '日期與時間' : lang === 'ja' ? '日時' : 'Date & Time'}
                      </span>
                      <strong className="text-white">{date} {time}</strong>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        {lang === 'zh-TW' ? '用餐區域' : lang === 'ja' ? 'お席タイプ' : 'Seating Preference'}
                      </span>
                      <strong className="text-slate-200">
                        {zonePreference === 'Main Dining Hall' ? (lang === 'zh-TW' ? '主餐廳大廳' : lang === 'ja' ? 'メインダイニングホール' : 'Main Dining Hall') :
                         zonePreference === 'Romantic Patio' ? (lang === 'zh-TW' ? '浪漫夕陽陽台' : lang === 'ja' ? 'サンセットテラス席' : 'Romantic Sunset Patio') :
                         zonePreference === 'VIP Private Room' ? (lang === 'zh-TW' ? 'VIP 獨立隱密包廂' : lang === 'ja' ? 'VIP個室' : 'VIP Private Room') :
                         (lang === 'zh-TW' ? '吧檯酒廊' : lang === 'ja' ? 'バーラウンジ' : 'Bar Lounge')}
                      </strong>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        {lang === 'zh-TW' ? '聯絡電話' : lang === 'ja' ? '電話番号' : 'Contact Phone'}
                      </span>
                      <span className="text-slate-300 font-mono">{phone}</span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        {lang === 'zh-TW' ? '電子信箱' : lang === 'ja' ? 'メールアドレス' : 'Email Address'}
                      </span>
                      <span className="text-slate-300">{email || (lang === 'zh-TW' ? '未提供' : lang === 'ja' ? '未入力' : 'Not provided')}</span>
                    </div>
                  </div>

                  {notes && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-xs text-slate-400 block font-medium">
                        {lang === 'zh-TW' ? '特殊需求 / 備註' : lang === 'ja' ? 'ご要望・備考' : 'Special Request / Notes'}
                      </span>
                      <p className="text-xs text-slate-200 italic mt-0.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        "{notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* CANCELLATION POLICY & HOLD TIME NOTICE */}
                <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-2 text-xs text-slate-300">
                  <h5 className="font-bold text-amber-400 flex items-center">
                    📌 {lang === 'zh-TW' ? '訂位與保留須知' : lang === 'ja' ? 'ご予約・キャンセル規約' : 'Cancellation & Reservation Policy'}
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                    <li>
                      {lang === 'zh-TW'
                        ? '如需變更或取消，請於預訂時間前至少 24 小時提出。'
                        : lang === 'ja'
                        ? 'ご予約の変更・キャンセルは、ご来店時間の24時間前までにご連絡ください。'
                        : 'Please modify or cancel at least 24 hours prior to your reservation time.'}
                    </li>
                    <li>
                      {lang === 'zh-TW'
                        ? '桌位將為您保留 15 分鐘，逾時將自動釋出給現場候位賓客。'
                        : lang === 'ja'
                        ? 'お席の保持時間はご予約時間より15分間となっております。遅れる場合はご連絡ください。'
                        : 'Tables are held for up to 15 minutes after the scheduled time before being released.'}
                    </li>
                    {email && (
                      <li>
                        {lang === 'zh-TW'
                          ? <>訂位確認郵件將自動發送至 <strong className="text-amber-300">{email}</strong>。</>
                          : lang === 'ja'
                          ? <>ご予約確認メールを <strong className="text-amber-300">{email}</strong> 宛に自動送信いたします。</>
                          : <>A confirmation email will be sent to <strong className="text-amber-300">{email}</strong> upon booking.</>}
                      </li>
                    )}
                  </ul>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowReviewStep(false)}
                    className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    ✏️ {lang === 'zh-TW' ? '修改內容' : lang === 'ja' ? '内容を修正する' : 'Edit Details'}
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalizeSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {isSubmitting
                        ? (lang === 'zh-TW' ? '正在同步發送訂位...' : lang === 'ja' ? '予約を送信中...' : 'Syncing Reservation...')
                        : (lang === 'zh-TW' ? '確認送出預約' : lang === 'ja' ? '予約を確定する' : 'Confirm & Send Reservation')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CULINARY MENU CATALOG SHOWCASE */}
      <section id="menu" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1 text-xs font-bold text-amber-400 mb-2">
                <Flame className="h-3.5 w-3.5" />
                <span>{lang === 'zh-TW' ? '主廚招牌推薦' : 'Signature Selection'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                {lang === 'zh-TW' ? '精緻菜單與料理圖鑑' : 'Our Recipe & Menu Catalog'}
              </h2>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {getCategoryLabel(cat, lang)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}
                      alt={getDishName(item.name, lang)}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 px-3 py-1 text-xs font-black text-amber-400">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                      {getCategoryLabel(item.category, lang)}
                    </span>
                    <h3 className="text-lg font-black text-white">
                      {getDishName(item.name, lang)}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {getDishDescription(item, lang)}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-slate-900 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="text-amber-400/90 font-bold text-[11px] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    {lang === 'zh-TW' ? '主廚招牌' : lang === 'ja' ? 'シェフのおすすめ' : "Chef's Specialty"}
                  </span>

                  <button
                    onClick={() => scrollToSection('reservation')}
                    className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{lang === 'zh-TW' ? '預約享用桌位' : lang === 'ja' ? '席を予約する' : 'Book Table to Enjoy'}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left grid sm:grid-cols-3 gap-8">
          <div>
            <span className="text-lg font-black text-white">
              {lang === 'zh-TW'
                ? '格蘭小酒館＆炭烤餐廳'
                : lang === 'ja'
                ? 'グラン・ビストロ＆炭火焼きレストラン'
                : 'Grand Bistro & Grill'}
            </span>
            <p className="text-xs text-slate-500 mt-2 max-w-xs">
              {lang === 'zh-TW'
                ? '結合即時餐飲 POS、廚房顯示系統與線上訂位管家的頂級餐酒館。'
                : lang === 'ja'
                ? 'リアルタイムPOS、厨房ディスプレイ、オンライン予約を統合した至高のビストロ＆グリル。'
                : 'Exceptional dining experience powered by real-time POS, kitchen synchronization, and online reservations.'}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              {lang === 'zh-TW' ? '門市地址與聯絡方式' : lang === 'ja' ? '店舗情報・お問い合わせ' : 'Location & Contact'}
            </h4>
            <p className="text-xs text-slate-400">
              {lang === 'zh-TW'
                ? '桃園市桃園區中正路 368 號'
                : lang === 'ja'
                ? '桃園市桃園区中正路368号'
                : 'No. 368, Zhongzheng Rd., Taoyuan Dist., Taoyuan City'}
            </p>
            <p className="text-xs text-slate-400 mt-1">03-356-7284 • info@grandbistro.com</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              {lang === 'zh-TW' ? '工作人員專區' : lang === 'ja' ? 'スタッフエリア' : 'Staff Access'}
            </h4>
            <div className="flex flex-col space-y-1 text-xs">
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  else onNavigateTab('dashboard');
                }}
                className="hover:text-amber-400 text-left cursor-pointer"
              >
                {lang === 'zh-TW' ? '店員 / 管理員系統登入' : lang === 'ja' ? 'スタッフ / 管理者ログイン' : 'Staff Section Login'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-900 text-center text-[11px] text-slate-600">
          © {new Date().getFullYear()} {lang === 'zh-TW' ? '格蘭小酒館＆炭烤餐廳' : lang === 'ja' ? 'グラン・ビストロ＆炭火焼きレストラン' : 'Grand Bistro & Grill'}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
