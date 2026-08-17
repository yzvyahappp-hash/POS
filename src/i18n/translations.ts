export type Language = 'en' | 'zh-TW' | 'ja';

export interface Translations {
  // Navigation
  nav_dashboard: string;
  nav_floorplan: string;
  nav_menu: string;
  nav_orders: string;
  nav_receipts: string;
  nav_kds: string;
  nav_checkout: string;
  nav_reservations: string;
  nav_customers: string;
  nav_inventory: string;
  nav_staff: string;
  nav_analytics: string;
  nav_settings: string;
  nav_gas: string;

  // Header & Controls
  search_placeholder: string;
  new_order: string;
  connect_sheets: string;
  sheets_active: string;
  dark_mode: string;
  light_mode: string;
  shortcuts: string;
  language: string;

  // Common UI
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  status: string;
  action: string;
  total: string;
  subtotal: string;
  tax: string;
  service_charge: string;
  discount: string;
  table: string;
  guests: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  notes: string;
  copy: string;
  copied: string;
  test_connection: string;

  // Dashboard
  daily_revenue: string;
  occupied_tables: string;
  pending_orders: string;
  upcoming_bookings: string;
  table_matrix: string;
  recent_orders: string;
  popular_dishes: string;

  // Floor Plan
  available: string;
  occupied: string;
  reserved: string;
  cleaning: string;
  add_table: string;
  transfer_table: string;
  merge_tables: string;

  // Reservations & Reminders
  add_reservation: string;
  reminder_hours: string;
  send_reminder_now: string;
  reminder_sent: string;
  auto_reminders: string;

  // Staff & Logs
  staff_management: string;
  activity_logs: string;
  add_staff: string;
  clock_in: string;
  clock_out: string;
  clocked_in: string;
  clocked_out: string;

  // Google Sheets setup
  sheets_integration_title: string;
  sheets_subtitle: string;
  step_1_title: string;
  step_1_desc: string;
  step_2_title: string;
  step_2_desc: string;
  step_3_title: string;
  step_3_desc: string;
  step_4_title: string;
  step_4_desc: string;
  step_5_title: string;
  step_5_desc: string;
  sync_all_now: string;
}

export const translations: Record<Language, Translations> = {
  'en': {
    nav_dashboard: 'Dashboard',
    nav_floorplan: 'Floor Plan',
    nav_menu: 'Menu Catalog',
    nav_orders: 'Orders',
    nav_receipts: 'Receipts History',
    nav_kds: 'Kitchen Display',
    nav_checkout: 'Checkout & POS',
    nav_reservations: 'Reservations & Walk-ins',
    nav_customers: 'Customers',
    nav_inventory: 'Inventory',
    nav_staff: 'Staff & Logs',
    nav_analytics: 'Analytics',
    nav_settings: 'Settings',
    nav_gas: 'Google Sheets',

    search_placeholder: 'Search orders, menu, tables... (Ctrl+K)',
    new_order: '+ New Order',
    connect_sheets: 'Connect Sheets',
    sheets_active: 'Google Sheets Active',
    dark_mode: 'Dark Mode',
    light_mode: 'Light Mode',
    shortcuts: 'Shortcuts',
    language: 'Language',

    save: 'Save Changes',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    status: 'Status',
    action: 'Action',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    service_charge: 'Service Charge',
    discount: 'Discount',
    table: 'Table',
    guests: 'Guests',
    date: 'Date',
    time: 'Time',
    phone: 'Phone',
    email: 'Email',
    notes: 'Notes',
    copy: 'Copy Code',
    copied: 'Copied!',
    test_connection: 'Test Connection',

    daily_revenue: 'Daily Revenue',
    occupied_tables: 'Occupied Tables',
    pending_orders: 'Pending Orders',
    upcoming_bookings: 'Reservations Today',
    table_matrix: 'Table Matrix',
    recent_orders: 'Active Orders Flow',
    popular_dishes: 'Popular Dishes',

    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    cleaning: 'Cleaning',
    add_table: 'Add Table',
    transfer_table: 'Transfer Table',
    merge_tables: 'Merge Tables',

    add_reservation: 'Add Reservation',
    reminder_hours: 'Reminder Timing (Hours)',
    send_reminder_now: 'Send Email Reminder',
    reminder_sent: 'Reminder Email Sent!',
    auto_reminders: 'Automated Email Reminders',

    staff_management: 'Staff & Shift Management',
    activity_logs: 'System Activity Logs',
    add_staff: 'Add Staff Member',
    clock_in: 'Clock In',
    clock_out: 'Clock Out',
    clocked_in: 'Clocked In',
    clocked_out: 'Clocked Out',

    sheets_integration_title: 'Google Sheets & Apps Script Connection',
    sheets_subtitle: 'Follow the 5 simple steps below to connect your restaurant POS live data to Google Sheets.',
    step_1_title: 'Step 1: Create Spreadsheet',
    step_1_desc: 'Go to sheets.new to create a clean Google Sheet for your restaurant.',
    step_2_title: 'Step 2: Open Apps Script',
    step_2_desc: 'In your Google Sheet, click Extensions > Apps Script in the top menu bar.',
    step_3_title: 'Step 3: Paste Code',
    step_3_desc: 'Copy the Apps Script code below, replace Code.gs content, and click Save (Ctrl+S).',
    step_4_title: 'Step 4: Deploy as Web App',
    step_4_desc: 'Click Deploy > New deployment > Web App. Set Execute as: Me, Who has access: Anyone.',
    step_5_title: 'Step 5: Paste Web App URL',
    step_5_desc: 'Copy the deployed Web App URL and paste it into the field below, then click Test Connection.',
    sync_all_now: 'Sync All Data to Sheets',
  },
  'zh-TW': {
    nav_dashboard: '儀表板',
    nav_floorplan: '桌位平面圖',
    nav_menu: '菜單目錄',
    nav_orders: '訂單管理',
    nav_receipts: '消費明細 (收據歷史)',
    nav_kds: '廚房顯示系統',
    nav_checkout: '結帳與收銀',
    nav_reservations: '預約與入場管理',
    nav_customers: '顧客資料',
    nav_inventory: '庫存管理',
    nav_staff: '員工與日誌',
    nav_analytics: '營業分析',
    nav_settings: '系統設定',
    nav_gas: 'Google 試算表',

    search_placeholder: '搜尋訂單、菜單、桌號... (Ctrl+K)',
    new_order: '+ 新增訂單',
    connect_sheets: '連結 Google 試算表',
    sheets_active: 'Google 試算表已連線',
    dark_mode: '深色模式',
    light_mode: '淺色模式',
    shortcuts: '快捷鍵',
    language: '語言',

    save: '儲存變更',
    cancel: '取消',
    edit: '編輯',
    delete: '刪除',
    status: '狀態',
    action: '操作',
    total: '總計',
    subtotal: '小計',
    tax: '稅金',
    service_charge: '服務費',
    discount: '折扣',
    table: '桌號',
    guests: '人數',
    date: '日期',
    time: '時間',
    phone: '電話',
    email: '電子郵件',
    notes: '備註',
    copy: '複製程式碼',
    copied: '已複製！',
    test_connection: '測試連線',

    daily_revenue: '今日營業額',
    occupied_tables: '入座桌數',
    pending_orders: '處理中訂單',
    upcoming_bookings: '今日預約',
    table_matrix: '桌位狀態',
    recent_orders: '最新訂單流程',
    popular_dishes: '熱銷菜色',

    available: '空桌',
    occupied: '使用中',
    reserved: '已預約',
    cleaning: '清潔中',
    add_table: '新增桌位',
    transfer_table: '換桌',
    merge_tables: '併桌',

    add_reservation: '新增訂位',
    reminder_hours: '提醒時間 (小時)',
    send_reminder_now: '發送郵件提醒',
    reminder_sent: '提醒郵件已發送！',
    auto_reminders: '自動郵件提醒',

    staff_management: '員工與班表管理',
    activity_logs: '系統活動日誌',
    add_staff: '新增員工',
    clock_in: '打卡上班',
    clock_out: '打卡下班',
    clocked_in: '上班中',
    clocked_out: '已下班',

    sheets_integration_title: 'Google 試算表與 Apps Script 連線指南',
    sheets_subtitle: '請按照以下 5 個步驟將您的餐廳 POS 即時資料連結至 Google 試算表。',
    step_1_title: '步驟 1：建立試算表',
    step_1_desc: '前往 sheets.new 建立一個新的 Google 試算表。',
    step_2_title: '步驟 2：開啟 Apps Script',
    step_2_desc: '在試算表中，點擊頂端選單的「擴充功能」>「Apps Script」。',
    step_3_title: '步驟 3：貼上程式碼',
    step_3_desc: '複製下方的 Apps Script 程式碼，覆蓋 Code.gs 並點擊儲存 (Ctrl+S)。',
    step_4_title: '步驟 4：發佈為 Web 應用程式',
    step_4_desc: '點擊「部署」>「新增部署」> 選「Web 應用程式」，執行身分設為「我」，誰有存取權設為「所有人」。',
    step_5_title: '步驟 5：貼上網址並測試',
    step_5_desc: '複製發佈後的 Web 應用程式網址，貼入下方輸入框，點擊「測試連線」。',
    sync_all_now: '同步所有資料至 Google 試算表',
  },
  'ja': {
    nav_dashboard: 'ダッシュボード',
    nav_floorplan: 'フロアマップ',
    nav_menu: 'メニューカタログ',
    nav_orders: '注文管理',
    nav_receipts: '消費明細',
    nav_kds: '厨房ディスプレイ (KDS)',
    nav_checkout: '会計・POS',
    nav_reservations: '予約・ご案内管理',
    nav_customers: '顧客管理',
    nav_inventory: '在庫管理',
    nav_staff: 'スタッフとログ',
    nav_analytics: '売上分析',
    nav_settings: '設定',
    nav_gas: 'Google スプレッドシート',

    search_placeholder: '注文・メニュー・テーブルを検索... (Ctrl+K)',
    new_order: '+ 新規注文',
    connect_sheets: 'スプレッドシート連携',
    sheets_active: 'スプレッドシート接続中',
    dark_mode: 'ダークモード',
    light_mode: 'ライトモード',
    shortcuts: 'ショートカット',
    language: '言語',

    save: '変更を保存',
    cancel: 'キャンセル',
    edit: '編集',
    delete: '削除',
    status: 'ステータス',
    action: '操作',
    total: '合計',
    subtotal: '小計',
    tax: '消費税',
    service_charge: 'サービス料',
    discount: '割引',
    table: 'テーブル',
    guests: '人数',
    date: '日付',
    time: '時間',
    phone: '電話番号',
    email: 'メールアドレス',
    notes: '備考',
    copy: 'コードをコピー',
    copied: 'コピー完了!',
    test_connection: '接続テスト',

    daily_revenue: '本日の売上',
    occupied_tables: '使用中テーブル',
    pending_orders: '調理中・保留注文',
    upcoming_bookings: '本日の予約',
    table_matrix: 'テーブル状況',
    recent_orders: 'アクティブ注文',
    popular_dishes: '人気メニュー',

    available: '空席',
    occupied: '満席',
    reserved: '予約済み',
    cleaning: 'バッシング中',
    add_table: 'テーブル追加',
    transfer_table: '席移動',
    merge_tables: 'テーブル結合',

    add_reservation: '新規予約登録',
    reminder_hours: 'リマインダー通知時間(時間前)',
    send_reminder_now: 'メールリマインダー送信',
    reminder_sent: 'リマインダーメールを送信しました！',
    auto_reminders: '自動メールリマインダー',

    staff_management: 'スタッフ・シフト管理',
    activity_logs: 'システムアクティビティログ',
    add_staff: 'スタッフ追加',
    clock_in: '出勤',
    clock_out: '退勤',
    clocked_in: '勤務中',
    clocked_out: '退勤済み',

    sheets_integration_title: 'Google スプレッドシート ＆ Apps Script 連携ガイド',
    sheets_subtitle: '以下の5つのステップに従って、店舗POSデータを Google スプレッドシートにリアルタイム連携します。',
    step_1_title: 'ステップ 1: 新規スプレッドシート作成',
    step_1_desc: 'sheets.new にアクセスして新規スプレッドシートを作成します。',
    step_2_title: 'ステップ 2: Apps Script を開く',
    step_2_desc: 'メニューの「拡張機能」>「Apps Script」をクリックします。',
    step_3_title: 'ステップ 3: コード貼り付け',
    step_3_desc: '以下の Apps Script コードをコピーし、Code.gs に上書き保存 (Ctrl+S) します。',
    step_4_title: 'ステップ 4: ウェブアプリとしてデプロイ',
    step_4_desc: '「デプロイ」>「新しいデプロイ」>「ウェブアプリ」を選択。実行ユーザー「自分」、アクセス権「全員」に設定。',
    step_5_title: 'ステップ 5: URLを貼り付けてテスト',
    step_5_desc: 'デプロイされたウェブアプリURLをコピーして以下の入力欄に貼り付け、「接続テスト」を押します。',
    sync_all_now: 'すべてのデータを同期',
  },
};
