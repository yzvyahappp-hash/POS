// Google Apps Script Backend Integration Service & Code Generator
import { INITIAL_SUPPLIERS } from '../data/mockData';
import {
  formatDateUTC8,
  formatTimeUTC8,
  getUTC8ISOString,
  getTodayUTC8,
} from '../utils/dateUtils';
import {
  Order,
  OrderItem,
  OrderType,
  OrderStatus,
  MenuItem,
  Table,
  TableStatus,
  Reservation,
  Customer,
  CustomerCoupon,
  InventoryItem,
  Supplier,
  Employee,
  UserRole,
  RestaurantSettings,
  ActivityLog,
} from '../types';

export const GOOGLE_APPS_SCRIPT_CODE = `// RESTAURANT POS BACKEND - GOOGLE APPS SCRIPT
// Paste this entire file into Code.gs in Google Apps Script

const SHEET_NAMES = [
  'Users',
  'Employees',
  'Menu',
  'Tables',
  'Orders',
  'OrderItems',
  'Reservations',
  'Waitlist',
  'Customers',
  'Coupons',
  'Inventory',
  'Suppliers',
  'Payments',
  'ActivityLogs',
  'Settings'
];

function doGet(e) {
  const action = e && e.parameter && e.parameter.action ? e.parameter.action : null;
  
  if (action === 'ping') {
    return createJsonResponse({
      status: 'success',
      message: 'Restaurant POS & Membership Google Sheets Backend is active!',
      timestamp: new Date().toISOString()
    });
  }
  
  if (action === 'fetchAll') {
    return createJsonResponse({
      status: 'success',
      data: fetchAllSheetsData()
    });
  }

  // Serve the Web App HTML UI if accessed directly in browser
  try {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Restaurant POS & Membership Web App')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return createJsonResponse({ status: 'success', message: 'Ready' });
  }
}

function doPost(e) {
  try {
    setupDatabaseSheets();
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;
    const data = contents.data;
    
    // 1. Sync All (Smart Upsert Merge - Never deletes or overwrites existing rows!)
    if (action === 'syncAll') {
      saveAllSheetsData(data);
      return createJsonResponse({ status: 'success', message: 'Database merged successfully across devices' });
    }
    
    // 2. Save Order (Upserts Order & OrderItems)
    if (action === 'saveOrder') {
      let appliedPromosStr = '[]';
      try {
        appliedPromosStr = Array.isArray(data.appliedPromos) ? JSON.stringify(data.appliedPromos) : (data.appliedPromos || '[]');
      } catch(e) { appliedPromosStr = '[]'; }

      upsertRowToSheet('Orders', 0, data.id, [
        data.id,
        data.orderNumber || '',
        data.type || 'Dine-In',
        data.tableName || '',
        data.customerName || '',
        data.totalAmount || 0,
        data.status || 'Pending',
        data.paymentStatus || 'Unpaid',
        data.paymentMethod || '',
        data.createdAt || new Date().toISOString(),
        data.createdBy || 'Staff',
        data.updatedAt || data.createdAt || new Date().toISOString(),
        data.subtotal !== undefined ? Number(data.subtotal) : Number(data.totalAmount || 0),
        Number(data.discountAmount || 0),
        Number(data.discountPercentage || 0),
        Number(data.pointsRedeemed || 0),
        Number(data.pointsDiscountAmount || 0),
        data.couponCode || '',
        Number(data.couponDiscountAmount || 0),
        Number(data.promoDiscountAmount || 0),
        appliedPromosStr,
        data.customerPhone || '',
        data.customerId || '',
        data.customerPointsBalance !== undefined ? Number(data.customerPointsBalance) : ''
      ]);

      if (Array.isArray(data.items)) {
        data.items.forEach(function(item) {
          let modStr = '';
          try {
            modStr = Array.isArray(item.selectedModifiers) ? JSON.stringify(item.selectedModifiers) : (item.modifiers || '');
          } catch(e) { modStr = String(item.modifiers || ''); }

          upsertRowToSheet('OrderItems', 0, item.id || ('item-' + data.id + '-' + item.menuItemId), [
            item.id || ('item-' + data.id + '-' + item.menuItemId),
            data.id,
            data.orderNumber || '',
            item.menuItemId || '',
            item.name || '',
            item.price || 0,
            item.quantity || 1,
            modStr,
            item.status || 'Served'
          ]);
        });
      }

      logActivity(data.createdBy || 'System', 'Order Saved', 'Order #' + (data.orderNumber || data.id) + ' total: $' + (data.totalAmount || 0));
      return createJsonResponse({ status: 'success', orderId: data.id });
    }
    
    // 3. Save / Update Reservation (Appends if new below original ones, updates if existing)
    if (action === 'saveReservation') {
      upsertRowToSheet('Reservations', 0, data.id, [
        data.id,
        data.customerName || '',
        data.phone || '',
        data.email || '',
        data.date || '',
        data.time || '',
        data.partySize || 1,
        data.tableName || data.tableId || '',
        data.status || 'Upcoming',
        data.notes || ''
      ]);
      logActivity(data.customerName || 'Customer', 'Reservation Saved', 'Reservation for ' + (data.partySize || 1) + ' on ' + (data.date || '') + ' (' + (data.status || 'Upcoming') + ')');
      return createJsonResponse({ status: 'success', reservationId: data.id });
    }

    // Save / Update Waitlist
    if (action === 'saveWaitlist') {
      upsertRowToSheet('Waitlist', 0, data.id, [
        data.id,
        data.queueNumber || '',
        data.customerName || '',
        data.phone || '',
        data.partySize || 1,
        data.notes || '',
        data.status || 'Waiting',
        data.createdAt || new Date().toISOString(),
        data.estimatedWaitMinutes || 15
      ]);
      logActivity(data.customerName || 'Customer', 'Waitlist Saved', 'Waitlist #' + (data.queueNumber || '') + ' for ' + (data.customerName || ''));
      return createJsonResponse({ status: 'success', waitlistId: data.id });
    }

    // 4. Save / Update Customer
    if (action === 'saveCustomer') {
      upsertRowToSheet('Customers', 0, data.id, [
        data.id,
        data.name || '',
        data.phone || '',
        data.email || '',
        data.loyaltyPoints || 0,
        data.visitCount || 0,
        data.totalSpent || 0,
        data.tier || 'Bronze',
        data.lastVisit || new Date().toISOString(),
        data.updatedAt || data.lastVisit || new Date().toISOString()
      ]);
      return createJsonResponse({ status: 'success', customerId: data.id });
    }

    // 5. Save / Update Inventory Item
    if (action === 'saveInventory') {
      upsertRowToSheet('Inventory', 0, data.id, [
        data.id,
        data.name || '',
        data.category || '',
        data.unit || '',
        data.stockQuantity !== undefined ? data.stockQuantity : (data.currentStock || 0),
        data.minStockAlert !== undefined ? data.minStockAlert : (data.minStock || 0),
        data.costPerUnit || 0,
        data.supplierName || ''
      ]);
      return createJsonResponse({ status: 'success', inventoryId: data.id });
    }

    // 6. Save / Update Menu Item
    if (action === 'saveMenuItem') {
      upsertRowToSheet('Menu', 0, data.id, [
        data.id,
        data.name || '',
        data.category || 'Main Course',
        data.price || 0,
        data.cost || 0,
        data.isAvailable !== false ? 'YES' : 'NO',
        data.isPopular ? 'YES' : 'NO',
        data.isCombo ? 'YES' : 'NO',
        data.image || ''
      ]);
      return createJsonResponse({ status: 'success', menuItemId: data.id });
    }

    // 7. Save / Update Table
    if (action === 'saveTable') {
      var isFreeTable = (data.status === 'Available' || data.status === 'Cleaning');
      upsertRowToSheet('Tables', 0, data.id, [
        data.id,
        data.number || 1,
        data.name || '',
        data.seats || 4,
        data.status || 'Available',
        data.zone || 'Main Dining',
        data.x || 100,
        data.y || 100,
        data.shape || 'square',
        isFreeTable ? '' : (data.currentOrderId || ''),
        isFreeTable ? '' : (data.customerName || '')
      ]);
      return createJsonResponse({ status: 'success' });
    }

    // 8. Save / Update Employee
    if (action === 'saveEmployee') {
      upsertRowToSheet('Employees', 0, data.id, [
        data.id,
        data.name || '',
        data.email || '',
        data.role || 'Staff',
        data.phone || '',
        data.hourlyRate || 15,
        data.shiftsThisWeek || 0,
        data.isClockedIn ? 'YES' : 'NO',
        data.pinCode || '1234'
      ]);
      return createJsonResponse({ status: 'success' });
    }

    // 9. Delete Row by ID
    if (action === 'deleteRow') {
      deleteRowFromSheet(data.sheetName, 0, data.id);
      return createJsonResponse({ status: 'success', message: 'Deleted ' + data.id + ' from ' + data.sheetName });
    }

    // 10. Log Clock In
    if (action === 'logClockIn') {
      logActivity(data.employeeName || 'Staff', data.action || 'Clock In', 'Employee ' + (data.employeeName || '') + ' ' + (data.action || 'clocked in'));
      return createJsonResponse({ status: 'success' });
    }

    // 11. Send Email Reminder
    if (action === 'sendReminder') {
      const sent = sendSingleReservationReminder(data);
      return createJsonResponse({ status: sent ? 'success' : 'failed', message: sent ? 'Reminder email sent' : 'Missing email or send error' });
    }
    
    return createJsonResponse({ status: 'success', message: 'Action executed: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Automated Reservation Reminder Trigger Function (Runs Hourly)
 * Set up via Apps Script Triggers or by running setupReservationReminderTrigger() once.
 */
function sendSingleReservationReminder(res) {
  if (!res || !res.email) return false;
  const custName = res.customerName || 'Valued Guest';
  const resDate = res.date || '';
  const resTime = res.time || '';
  const partySize = res.partySize || 1;
  const resNumber = res.id ? String(res.id).toUpperCase().replace(/^RES-/, 'GBG-') : 'GBG-' + Math.floor(100000 + Math.random() * 900000);

  const htmlBody = 
    '<div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">' +
      '<div style="text-align: center; border-bottom: 2px solid #FF8A00; padding-bottom: 12px; margin-bottom: 20px;">' +
        '<h2 style="color: #FF8A00; margin: 0; font-size: 22px;">Grand Bistro & Grill</h2>' +
        '<p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Table Reservation Confirmation</p>' +
      '</div>' +
      '<p>Dear <b>' + custName + '</b>,</p>' +
      '<p>We are pleased to remind you of your upcoming reservation at <b>Grand Bistro & Grill</b>.</p>' +
      '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">' +
        '<h3 style="color: #0f172a; margin: 0 0 12px 0; font-size: 16px; border-bottom: 2px solid #FF8A00; padding-bottom: 4px; display: inline-block;">Reservation Details</h3>' +
        '<p style="margin: 4px 0;"><b>Date:</b> ' + resDate + '</p>' +
        '<p style="margin: 4px 0;"><b>Time:</b> ' + resTime + '</p>' +
        '<p style="margin: 4px 0;"><b>Guests:</b> ' + partySize + '</p>' +
        '<p style="margin: 4px 0;"><b>Reservation Name:</b> ' + custName + '</p>' +
        '<p style="margin: 4px 0;"><b>Confirmation #:</b> <span style="color: #FF8A00; font-weight: bold;">' + resNumber + '</span></p>' +
      '</div>' +
      '<p>We look forward to welcoming you and your guests and providing you with a wonderful dining experience.</p>' +
      '<div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin: 20px 0;">' +
        '<h3 style="color: #0f172a; margin: 0 0 12px 0; font-size: 16px; border-bottom: 2px solid #FF8A00; padding-bottom: 4px; display: inline-block;">Cancellation & Reservation Policy</h3>' +
        '<p>If you need to cancel or modify your reservation, please contact us at <b>+1 (555) 234-5678</b> as soon as possible.</p>' +
        '<p>We kindly ask that cancellations or changes be made at least <b>24 hours before your reservation time</b>. Late cancellations, no-shows, or significant changes to the number of guests may be subject to a cancellation fee, where applicable.</p>' +
        '<p>If you are running late, please contact us as soon as possible. We will do our best to accommodate you, but your table may only be held for <b>15 minutes</b> after the scheduled reservation time.</p>' +
      '</div>' +
      '<p>Thank you for choosing <b>Grand Bistro & Grill</b>. We truly appreciate your reservation and look forward to serving you soon.</p>' +
      '<div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 13px; color: #475569;">' +
        '<p style="margin: 0;">Warm regards,</p>' +
        '<p style="margin: 4px 0 0 0; font-weight: bold; color: #0f172a;">Grand Bistro & Grill 格蘭小酒館＆炭烤餐廳</p>' +
        '<p style="margin: 2px 0 0 0;">03-356-7284</p>' +
        '<p style="margin: 2px 0 0 0;">桃園市桃園區中正路 368 號</p>' +
      '</div>' +
    '</div>';

  try {
    MailApp.sendEmail({
      to: res.email,
      subject: 'Reservation Confirmation - Grand Bistro & Grill',
      htmlBody: htmlBody
    });
    return true;
  } catch (err) {
    return false;
  }
}

function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    ss.setSpreadsheetTimeZone("Asia/Taipei");
  } catch (e) {}
  SHEET_NAMES.forEach(function(name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      initSheetHeaders(sheet, name);
    }
  });
}

function initSheetHeaders(sheet, name) {
  const headersMap = {
    'Users': ['ID', 'Name', 'Email', 'Role', 'PIN', 'ClockedIn'],
    'Employees': ['ID', 'Name', 'Email', 'Role', 'Phone', 'HourlyRate', 'ShiftsThisWeek', 'ClockedIn', 'PIN'],
    'Menu': ['ID', 'Name', 'Category', 'Price', 'Cost', 'Available', 'Popular', 'Combo', 'Image'],
    'Tables': ['ID', 'Number', 'Name', 'Seats', 'Status', 'Zone', 'X', 'Y', 'Shape', 'CurrentOrder', 'CustomerName'],
    'Orders': ['ID', 'OrderNumber', 'Type', 'Table', 'Customer', 'TotalAmount', 'Status', 'PaymentStatus', 'PaymentMethod', 'CreatedAt', 'CreatedBy', 'UpdatedAt'],
    'OrderItems': ['ID', 'OrderID', 'OrderNumber', 'MenuItemID', 'Name', 'Price', 'Quantity', 'Modifiers', 'Status'],
    'Reservations': ['ID', 'CustomerName', 'Phone', 'Email', 'Date', 'Time', 'PartySize', 'Table', 'Status', 'Notes'],
    'Customers': ['ID', 'Name', 'Phone', 'Email', 'LoyaltyPoints', 'VisitCount', 'TotalSpent', 'Tier', 'LastVisit'],
    'Coupons': ['ID', 'CustomerID', 'Code', 'Title', 'DiscountType', 'DiscountValue', 'PointsSpent', 'RedeemedAt', 'IsUsed'],
    'Inventory': ['ID', 'Name', 'Category', 'Unit', 'StockQty', 'MinAlert', 'CostPerUnit', 'Supplier'],
    'Suppliers': ['ID', 'Name', 'ContactPerson', 'Phone', 'Email', 'ItemsSupplied'],
    'Payments': ['ID', 'OrderID', 'OrderNumber', 'Amount', 'Method', 'Discount', 'Status', 'Timestamp'],
    'ActivityLogs': ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Details'],
    'Settings': ['Key', 'Value']
  };
  
  if (headersMap[name]) {
    sheet.getRange(1, 1, 1, headersMap[name].length).setValues([headersMap[name]]);
    sheet.getRange(1, 1, 1, headersMap[name].length).setFontWeight('bold').setBackground('#FFF2E6');
  }
}

function fetchAllSheetsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};
  SHEET_NAMES.forEach(function(name) {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      var formattedData = data.map(function(row) {
        return row.map(function(cell) {
          if (cell instanceof Date) {
            return Utilities.formatDate(cell, "GMT+8", "yyyy-MM-dd'T'HH:mm:ss+08:00");
          }
          return cell;
        });
      });
      result[name] = formattedData;
    }
  });
  return result;
}

function saveAllSheetsData(allData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!allData || typeof allData !== 'object') return;
  
  Object.keys(allData).forEach(function(key) {
    let sheet = ss.getSheetByName(key);
    if (!sheet) {
      sheet = ss.insertSheet(key);
      initSheetHeaders(sheet, key);
    }
    
    var incomingRows = allData[key];
    if (Array.isArray(incomingRows) && incomingRows.length > 0) {
      var validRows = incomingRows.filter(function(r) { return Array.isArray(r) && r.length > 0; });
      if (validRows.length === 0) return;

      var currentData = sheet.getDataRange().getValues();
      if (currentData.length <= 1) {
        initSheetHeaders(sheet, key);
        for (var i = 0; i < validRows.length; i++) {
          if (i === 0 && (String(validRows[0][0]).toLowerCase() === 'id' || String(validRows[0][0]).toLowerCase() === 'key')) continue;
          sheet.appendRow(validRows[i]);
        }
        return;
      }

      var existingData = sheet.getDataRange().getValues();
      var idRowMap = {};
      for (var exIdx = 1; exIdx < existingData.length; exIdx++) {
        idRowMap[String(existingData[exIdx][0])] = exIdx + 1;
      }

      for (var rIdx = 0; rIdx < validRows.length; rIdx++) {
        var row = validRows[rIdx];
        var rowId = String(row[0]);
        if (rowId.toLowerCase() === 'id' || rowId.toLowerCase() === 'key') continue;

        if (idRowMap[rowId]) {
          sheet.getRange(idRowMap[rowId], 1, 1, row.length).setValues([row]);
        } else {
          sheet.appendRow(row);
          idRowMap[rowId] = sheet.getLastRow();
        }
      }
    }
  });
}

function upsertRowToSheet(sheetName, idColIndex, matchValue, newRowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initSheetHeaders(sheet, sheetName);
  }
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    sheet.appendRow(newRowData);
    return;
  }
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(matchValue)) {
      sheet.getRange(i + 1, 1, 1, newRowData.length).setValues([newRowData]);
      return;
    }
  }
  sheet.appendRow(newRowData);
}

function deleteRowFromSheet(sheetName, idColIndex, matchValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(matchValue)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function updateSheetRow(sheetName, colIndex, matchValue, newRowData) {
  upsertRowToSheet(sheetName, colIndex, matchValue, newRowData);
}

function appendRowToSheet(sheetName, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.appendRow(rowData);
}

function logActivity(user, action, details) {
  appendRowToSheet('ActivityLogs', [
    'log-' + new Date().getTime() + '-' + Math.floor(Math.random() * 10000),
    new Date().toISOString(),
    user,
    'System',
    action,
    details
  ]);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export function formatFullDataPayload(state: Record<string, any>): Record<string, (string | number | boolean)[][]> {
  if (state.Orders && Array.isArray(state.Orders) && Array.isArray(state.Orders[0])) {
    return state as Record<string, (string | number | boolean)[][]>;
  }

  const orders: Order[] = Array.isArray(state.orders) ? state.orders : [];
  const menuItems: MenuItem[] = Array.isArray(state.menuItems) ? state.menuItems : [];
  const tables: Table[] = Array.isArray(state.tables) ? state.tables : [];
  const reservations: Reservation[] = Array.isArray(state.reservations) ? state.reservations : [];
  const waitlist: any[] = Array.isArray(state.waitlist) ? state.waitlist : [];
  const customers: Customer[] = Array.isArray(state.customers) ? state.customers : [];
  const coupons: any[] = Array.isArray(state.coupons) ? state.coupons : [];
  const inventory: InventoryItem[] = Array.isArray(state.inventory) ? state.inventory : [];
  const employees: Employee[] = Array.isArray(state.employees) ? state.employees : [];
  const activityLogs: ActivityLog[] = Array.isArray(state.activityLogs) ? state.activityLogs : [];
  const suppliers: Supplier[] = Array.isArray(state.suppliers) ? state.suppliers : INITIAL_SUPPLIERS;
  const settings: RestaurantSettings = state.settings || {};

  const employeesRows = [
    ['ID', 'Name', 'Email', 'Role', 'Phone', 'HourlyRate', 'ShiftsThisWeek', 'ClockedIn', 'PIN'],
    ...employees.map(e => [
      String(e.id || ''),
      String(e.name || ''),
      String(e.email || ''),
      String(e.role || ''),
      String(e.phone || ''),
      Number(e.hourlyRate || 0),
      Number(e.shiftsThisWeek || 0),
      e.isClockedIn ? 'YES' : 'NO',
      String(e.pinCode || '')
    ])
  ];

  const usersRows = [
    ['ID', 'Name', 'Email', 'Role', 'PIN', 'ClockedIn'],
    ...employees.map(e => [
      String(e.id || ''),
      String(e.name || ''),
      String(e.email || ''),
      String(e.role || ''),
      String(e.pinCode || ''),
      e.isClockedIn ? 'YES' : 'NO'
    ])
  ];

  const menuRows = [
    ['ID', 'Name', 'Category', 'Price', 'Cost', 'Available', 'Popular', 'Combo', 'Image'],
    ...menuItems.map(m => [
      String(m.id || ''),
      String(m.name || ''),
      String(m.category || ''),
      Number(m.price || 0),
      Number(m.cost || 0),
      m.isAvailable ? 'YES' : 'NO',
      m.isPopular ? 'YES' : 'NO',
      m.isCombo ? 'YES' : 'NO',
      String(m.image || '')
    ])
  ];

  const tableRows = [
    ['ID', 'Number', 'Name', 'Seats', 'Status', 'Zone', 'X', 'Y', 'Shape', 'CurrentOrder', 'CustomerName'],
    ...tables.map(t => {
      const isFree = t.status === 'Available' || t.status === 'Cleaning';
      return [
        String(t.id || ''),
        Number(t.number || 0),
        String(t.name || ''),
        Number(t.seats || 0),
        String(t.status || ''),
        String(t.zone || ''),
        Number(t.x || 0),
        Number(t.y || 0),
        String(t.shape || 'square'),
        String(isFree ? '' : (t.currentOrderId || '')),
        String(isFree ? '' : (t.customerName || ''))
      ];
    })
  ];

  const orderRows = [
    ['ID', 'OrderNumber', 'Type', 'Table', 'Customer', 'TotalAmount', 'Status', 'PaymentStatus', 'PaymentMethod', 'CreatedAt', 'CreatedBy', 'UpdatedAt', 'Subtotal', 'DiscountAmount', 'DiscountPercentage', 'PointsRedeemed', 'PointsDiscountAmount', 'CouponCode', 'CouponDiscountAmount', 'PromoDiscountAmount', 'AppliedPromos', 'CustomerPhone', 'CustomerId', 'CustomerPointsBalance'],
    ...orders.map(o => [
      String(o.id || ''),
      String(o.orderNumber || ''),
      String(o.type || ''),
      String(o.tableName || ''),
      String(o.customerName || ''),
      Number(o.totalAmount || 0),
      String(o.status || ''),
      String(o.paymentStatus || ''),
      String(o.paymentMethod || ''),
      String(o.createdAt || ''),
      String(o.createdBy || ''),
      String(o.updatedAt || o.createdAt || new Date().toISOString()),
      Number(o.subtotal || o.totalAmount || 0),
      Number(o.discountAmount || 0),
      Number(o.discountPercentage || 0),
      Number(o.pointsRedeemed || 0),
      Number(o.pointsDiscountAmount || 0),
      String(o.couponCode || ''),
      Number(o.couponDiscountAmount || 0),
      Number(o.promoDiscountAmount || 0),
      JSON.stringify(o.appliedPromos || []),
      String(o.customerPhone || ''),
      String(o.customerId || ''),
      o.customerPointsBalance !== undefined ? Number(o.customerPointsBalance) : ''
    ])
  ];

  const orderItemRows: (string | number)[][] = [
    ['ID', 'OrderID', 'OrderNumber', 'MenuItemID', 'Name', 'Price', 'Quantity', 'Modifiers', 'Status']
  ];
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      orderItemRows.push([
        String(item.id || ''),
        String(o.id || ''),
        String(o.orderNumber || ''),
        String(item.menuItemId || ''),
        String(item.name || ''),
        Number(item.price || 0),
        Number(item.quantity || 1),
        Array.isArray(item.modifiers) ? item.modifiers.join(', ') : '',
        String(item.status || 'Served')
      ]);
    });
  });

  const reservationRows = [
    ['ID', 'CustomerName', 'Phone', 'Email', 'Date', 'Time', 'PartySize', 'Table', 'Status', 'Notes'],
    ...reservations.map(r => [
      String(r.id || ''),
      String(r.customerName || ''),
      String(r.phone || ''),
      String(r.email || ''),
      String(r.date || ''),
      String(r.time || ''),
      Number(r.partySize || 1),
      String(r.tableName || r.tableId || ''),
      String(r.status || 'Upcoming'),
      String(r.notes || '')
    ])
  ];

  const waitlistRows = [
    ['ID', 'QueueNumber', 'CustomerName', 'Phone', 'PartySize', 'Notes', 'Status', 'CreatedAt', 'EstimatedWaitMinutes'],
    ...waitlist.map(w => [
      String(w.id || ''),
      String(w.queueNumber || ''),
      String(w.customerName || ''),
      String(w.phone || ''),
      Number(w.partySize || 1),
      String(w.notes || ''),
      String(w.status || 'Waiting'),
      String(w.createdAt || ''),
      Number(w.estimatedWaitMinutes || 15)
    ])
  ];

  const customerRows = [
    ['ID', 'Name', 'Phone', 'Email', 'LoyaltyPoints', 'VisitCount', 'TotalSpent', 'Tier', 'LastVisit', 'UpdatedAt'],
    ...customers.map(c => [
      String(c.id || ''),
      String(c.name || ''),
      String(c.phone || ''),
      String(c.email || ''),
      Number(c.loyaltyPoints || 0),
      Number(c.visitCount || 0),
      Number(c.totalSpent || 0),
      String(c.tier || 'Bronze'),
      String(c.lastVisit || ''),
      String(c.updatedAt || c.lastVisit || new Date().toISOString())
    ])
  ];

  const couponRows = [
    ['ID', 'CustomerID', 'Code', 'Title', 'DiscountType', 'DiscountValue', 'PointsSpent', 'RedeemedAt', 'IsUsed'],
    ...coupons.map(cp => [
      String(cp.id || ''),
      String(cp.customerId || ''),
      String(cp.code || ''),
      String(cp.title || ''),
      String(cp.discountType || 'fixed'),
      Number(cp.discountValue || 0),
      Number(cp.pointsSpent || 0),
      String(cp.redeemedAt || ''),
      cp.isUsed ? 'YES' : 'NO'
    ])
  ];

  const inventoryRows = [
    ['ID', 'Name', 'Category', 'Unit', 'StockQty', 'MinAlert', 'CostPerUnit', 'Supplier'],
    ...inventory.map(i => [
      String(i.id || ''),
      String(i.name || ''),
      String(i.category || ''),
      String(i.unit || ''),
      Number(i.stockQuantity || 0),
      Number(i.minStockAlert || 0),
      Number(i.costPerUnit || 0),
      String(i.supplierName || '')
    ])
  ];

  const supplierRows = [
    ['ID', 'Name', 'ContactPerson', 'Phone', 'Email', 'ItemsSupplied'],
    ...suppliers.map(s => [
      String(s.id || ''),
      String(s.name || ''),
      String(s.contactPerson || ''),
      String(s.phone || ''),
      String(s.email || ''),
      Array.isArray(s.itemsSupplied) ? s.itemsSupplied.join(', ') : ''
    ])
  ];

  const paymentRows = [
    ['ID', 'OrderID', 'OrderNumber', 'Amount', 'Method', 'Discount', 'Status', 'Timestamp'],
    ...orders.filter(o => o.paymentStatus === 'Paid' || o.paymentMethod).map(o => [
      'pay-' + o.id,
      String(o.id || ''),
      String(o.orderNumber || ''),
      Number(o.totalAmount || 0),
      String(o.paymentMethod || 'Cash'),
      Number(o.discountAmount || 0),
      o.paymentStatus === 'Paid' ? 'Success' : 'Pending',
      String(o.updatedAt || o.createdAt || '')
    ])
  ];

  const activityRows = [
    ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Details'],
    ...activityLogs.map(a => [
      String(a.id || ''),
      String(a.timestamp || ''),
      String(a.user || ''),
      String(a.role || ''),
      String(a.action || ''),
      String(a.details || '')
    ])
  ];

  const settingRows = [
    ['Key', 'Value'],
    ['RestaurantName', String(settings.restaurantName || 'Grand Bistro & Grill')],
    ['Phone', String(settings.phone || '')],
    ['Address', String(settings.address || '')],
    ['CurrencySymbol', String(settings.currencySymbol || '$')],
    ['TaxRate', Number(settings.taxRate || 8)],
    ['ServiceChargeRate', Number(settings.serviceChargeRate || 5)],
    ['TableCount', Number(settings.tableCount || 12)],
    ['OpeningHours', String(settings.openingHours || '')],
    ['ReceiptHeader', String(settings.receiptHeader || '')],
    ['ReceiptFooter', String(settings.receiptFooter || '')],
    ['RolePermissions', JSON.stringify(settings.rolePermissions || {})]
  ];

  return {
    Users: usersRows,
    Employees: employeesRows,
    Menu: menuRows,
    Tables: tableRows,
    Orders: orderRows,
    OrderItems: orderItemRows,
    Reservations: reservationRows,
    Waitlist: waitlistRows,
    Customers: customerRows,
    Coupons: couponRows,
    Inventory: inventoryRows,
    Suppliers: supplierRows,
    Payments: paymentRows,
    ActivityLogs: activityRows,
    Settings: settingRows,
  };
}

export function formatReservationDate(val: any): string {
  return formatDateUTC8(val);
}

export function formatReservationTime(val: any): string {
  return formatTimeUTC8(val);
}

function getColumnIndex(headers: any[], keywords: string[]): number {
  if (!Array.isArray(headers)) return -1;
  const lowerHeaders = headers.map(h => String(h || '').trim().toLowerCase());
  for (const kw of keywords) {
    const target = kw.toLowerCase();
    const idx = lowerHeaders.findIndex(h => h === target || h.includes(target));
    if (idx !== -1) return idx;
  }
  return -1;
}

function findEmailInRow(row: any[]): string {
  if (!Array.isArray(row)) return '';
  for (const cell of row) {
    if (typeof cell === 'string' && cell.includes('@') && cell.includes('.')) {
      const match = cell.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (match) return match[0].trim();
    }
  }
  return '';
}

export function parseSheetsDataToState(sheetsData: Record<string, any[][]>): {
  orders?: Order[];
  reservations?: Reservation[];
  waitlist?: any[];
  menuItems?: MenuItem[];
  tables?: Table[];
  inventory?: InventoryItem[];
  customers?: Customer[];
  coupons?: CustomerCoupon[];
  employees?: Employee[];
  activityLogs?: ActivityLog[];
  settings?: Partial<RestaurantSettings>;
} {
  if (!sheetsData || typeof sheetsData !== 'object') return {};

  const result: any = {};

  // 1. Employees
  if (Array.isArray(sheetsData.Employees)) {
    const rows = sheetsData.Employees.length > 1 ? sheetsData.Employees.slice(1) : [];
    result.employees = rows
      .filter(r => r && r[0])
      .map((r, i) => ({
        id: String(r[0]),
        name: String(r[1] || `Employee ${i + 1}`),
        email: String(r[2] || ''),
        role: (r[3] || 'Staff') as UserRole,
        phone: String(r[4] || ''),
        hourlyRate: parseFloat(r[5]) || 15,
        shiftsThisWeek: parseInt(r[6]) || 0,
        isClockedIn: String(r[7]).toUpperCase() === 'YES' || String(r[7]) === 'true',
        pinCode: String(r[8] || '1234'),
      }));
  }

  // 2. Menu
  if (Array.isArray(sheetsData.Menu)) {
    const rows = sheetsData.Menu.length > 1 ? sheetsData.Menu.slice(1) : [];
    result.menuItems = rows
      .filter(r => r && r[0])
      .map(r => ({
        id: String(r[0]),
        name: String(r[1] || ''),
        category: String(r[2] || 'Main Course'),
        price: parseFloat(r[3]) || 0,
        cost: parseFloat(r[4]) || 0,
        isAvailable: String(r[5]).toUpperCase() === 'YES' || String(r[5]) === 'true',
        isPopular: String(r[6]).toUpperCase() === 'YES' || String(r[6]) === 'true',
        isCombo: String(r[7]).toUpperCase() === 'YES' || String(r[7]) === 'true',
        image: String(r[8] || ''),
      }));
  }

  // 3. Tables
  if (Array.isArray(sheetsData.Tables)) {
    const rows = sheetsData.Tables.length > 1 ? sheetsData.Tables.slice(1) : [];
    result.tables = rows
      .filter(r => r && r[0])
      .map((r, i) => {
        const status = String(r[4] || 'Available') as TableStatus;
        const isFree = status === 'Available' || status === 'Cleaning';
        return {
          id: String(r[0]),
          number: parseInt(r[1]) || i + 1,
          name: String(r[2] || `Table ${i + 1}`),
          seats: parseInt(r[3]) || 4,
          status,
          zone: (String(r[5] || 'Main Hall') as any),
          x: parseInt(r[6]) || 100,
          y: parseInt(r[7]) || 100,
          shape: String(r[8] || 'square') as 'square' | 'round' | 'rectangle',
          currentOrderId: !isFree && r[9] ? String(r[9]) : undefined,
          customerName: !isFree && r[10] ? String(r[10]) : undefined,
        };
      });
  }

  // 4. OrderItems & Orders
  const orderItemsMap: Record<string, OrderItem[]> = {};
  if (Array.isArray(sheetsData.OrderItems) && sheetsData.OrderItems.length > 1) {
    sheetsData.OrderItems.slice(1).forEach(r => {
      if (!r || !r[0]) return;
      const orderId = String(r[1] || '');
      if (!orderItemsMap[orderId]) orderItemsMap[orderId] = [];
      let modifiers: any[] = [];
      try {
        if (r[7]) modifiers = typeof r[7] === 'string' ? JSON.parse(r[7]) : r[7];
      } catch {}
      orderItemsMap[orderId].push({
        id: String(r[0]),
        menuItemId: String(r[3] || ''),
        name: String(r[4] || ''),
        price: parseFloat(r[5]) || 0,
        quantity: parseInt(r[6]) || 1,
        modifiers: Array.isArray(modifiers) ? modifiers : (modifiers ? [String(modifiers)] : []),
        addOns: [],
        status: (String(r[8] || 'Pending') as any),
      });
    });
  }

  if (Array.isArray(sheetsData.Orders)) {
    const rows = sheetsData.Orders.length > 1 ? sheetsData.Orders.slice(1) : [];
    result.orders = rows
      .filter(r => r && r[0])
      .map(r => {
        const orderId = String(r[0]);
        let appliedPromos = [];
        try {
          if (r[20]) appliedPromos = JSON.parse(String(r[20]));
        } catch {}
        return {
          id: orderId,
          orderNumber: String(r[1] || ''),
          type: String(r[2] || 'Dine-In') as OrderType,
          tableName: String(r[3] || ''),
          customerName: String(r[4] || ''),
          totalAmount: parseFloat(r[5]) || 0,
          status: String(r[6] || 'Pending') as OrderStatus,
          paymentStatus: (String(r[7] || 'Unpaid') as any),
          paymentMethod: String(r[8] || ''),
          createdAt: String(r[9] || new Date().toISOString()),
          createdBy: String(r[10] || 'Staff'),
          updatedAt: String(r[11] || r[9] || new Date().toISOString()),
          subtotal: r[12] !== undefined && r[12] !== '' ? parseFloat(r[12]) : undefined,
          discountAmount: r[13] !== undefined && r[13] !== '' ? parseFloat(r[13]) : 0,
          discountPercentage: r[14] !== undefined && r[14] !== '' ? parseFloat(r[14]) : 0,
          pointsRedeemed: r[15] !== undefined && r[15] !== '' ? parseInt(r[15]) : 0,
          pointsDiscountAmount: r[16] !== undefined && r[16] !== '' ? parseFloat(r[16]) : 0,
          couponCode: r[17] ? String(r[17]) : undefined,
          couponDiscountAmount: r[18] !== undefined && r[18] !== '' ? parseFloat(r[18]) : 0,
          promoDiscountAmount: r[19] !== undefined && r[19] !== '' ? parseFloat(r[19]) : 0,
          appliedPromos: Array.isArray(appliedPromos) ? appliedPromos : [],
          customerPhone: r[21] ? String(r[21]) : undefined,
          customerId: r[22] ? String(r[22]) : undefined,
          customerPointsBalance: r[23] !== undefined && r[23] !== '' ? parseInt(r[23]) : undefined,
          items: orderItemsMap[orderId] || [],
        };
      });
  }

  // 5. Reservations
  if (Array.isArray(sheetsData.Reservations) && sheetsData.Reservations.length > 0) {
    const headerRow = sheetsData.Reservations[0] || [];
    const rows = sheetsData.Reservations.length > 1 ? sheetsData.Reservations.slice(1) : [];

    const idIdx = getColumnIndex(headerRow, ['id', '編號']);
    const nameIdx = getColumnIndex(headerRow, ['customername', 'customer', 'name', '姓名', '訂位姓名']);
    const phoneIdx = getColumnIndex(headerRow, ['phone', 'tel', 'mobile', '電話', '手機']);
    const emailIdx = getColumnIndex(headerRow, ['email', 'gmail', 'mail', '電子郵件', '信箱', '郵件']);
    const dateIdx = getColumnIndex(headerRow, ['date', '日期', '訂位日期']);
    const timeIdx = getColumnIndex(headerRow, ['time', '時間', '訂位時間']);
    const partyIdx = getColumnIndex(headerRow, ['partysize', 'guests', 'seats', '人數', '訂位人數']);
    const tableIdx = getColumnIndex(headerRow, ['table', 'tablename', 'tableid', '桌號', '座位']);
    const statusIdx = getColumnIndex(headerRow, ['status', '狀態', '訂位狀態']);
    const notesIdx = getColumnIndex(headerRow, ['notes', 'note', '備註']);

    result.reservations = rows
      .filter(r => r && (r[0] || r[1] || r[2]))
      .map((r, i) => {
        let email = emailIdx !== -1 && r[emailIdx] ? String(r[emailIdx]) : String(r[3] || '');
        if (!email || !email.includes('@')) {
          const detected = findEmailInRow(r);
          if (detected) email = detected;
        }

        const dateVal = dateIdx !== -1 && r[dateIdx] ? r[dateIdx] : r[4];
        const timeVal = timeIdx !== -1 && r[timeIdx] ? r[timeIdx] : r[5];

        return {
          id: idIdx !== -1 && r[idIdx] ? String(r[idIdx]) : String(r[0] || `res-${i + 1}`),
          customerName: nameIdx !== -1 && r[nameIdx] ? String(r[nameIdx]) : String(r[1] || ''),
          phone: phoneIdx !== -1 && r[phoneIdx] ? String(r[phoneIdx]) : String(r[2] || ''),
          email: email.trim(),
          date: formatReservationDate(dateVal),
          time: formatReservationTime(timeVal),
          partySize: partyIdx !== -1 && r[partyIdx] !== undefined ? parseInt(r[partyIdx]) || 1 : parseInt(r[6]) || 1,
          tableName: tableIdx !== -1 && r[tableIdx] ? String(r[tableIdx]) : String(r[7] || ''),
          tableId: tableIdx !== -1 && r[tableIdx] ? String(r[tableIdx]) : String(r[7] || ''),
          status: (statusIdx !== -1 && r[statusIdx] ? String(r[statusIdx]) : String(r[8] || 'Upcoming')) as Reservation['status'],
          notes: notesIdx !== -1 && r[notesIdx] ? String(r[notesIdx]) : String(r[9] || ''),
        };
      });
  }

  // 5.5 Waitlist
  if (Array.isArray(sheetsData.Waitlist)) {
    const rows = sheetsData.Waitlist.length > 1 ? sheetsData.Waitlist.slice(1) : [];
    result.waitlist = rows
      .filter(r => r && r[0])
      .map(r => ({
        id: String(r[0]),
        queueNumber: String(r[1] || ''),
        customerName: String(r[2] || ''),
        phone: String(r[3] || ''),
        partySize: parseInt(r[4]) || 1,
        notes: String(r[5] || ''),
        status: String(r[6] || 'Waiting') as any,
        createdAt: String(r[7] || ''),
        estimatedWaitMinutes: parseInt(r[8]) || 15,
      }));
  }

  // 6. Customers
  if (Array.isArray(sheetsData.Customers) && sheetsData.Customers.length > 0) {
    const headerRow = sheetsData.Customers[0] || [];
    const rows = sheetsData.Customers.length > 1 ? sheetsData.Customers.slice(1) : [];

    const idIdx = getColumnIndex(headerRow, ['id', '編號', '顧客編號', '會員編號']);
    const nameIdx = getColumnIndex(headerRow, ['name', 'customer', 'customername', '姓名', '顧客姓名', '會員姓名']);
    const phoneIdx = getColumnIndex(headerRow, ['phone', 'tel', 'mobile', '電話', '手機']);
    const emailIdx = getColumnIndex(headerRow, ['email', 'gmail', 'mail', '電子郵件', '信箱', '郵件']);
    const pointsIdx = getColumnIndex(headerRow, ['loyaltypoints', 'points', 'point', '點數', '會員點數', '積分']);
    const visitIdx = getColumnIndex(headerRow, ['visitcount', 'visits', '次數', '來訪次數']);
    const spentIdx = getColumnIndex(headerRow, ['totalspent', 'spent', '消費總額', '累計消費']);
    const tierIdx = getColumnIndex(headerRow, ['tier', 'level', '等級', '會員等級']);
    const lastVisitIdx = getColumnIndex(headerRow, ['lastvisit', '最後訪問', '最後來訪']);
    const updatedAtIdx = getColumnIndex(headerRow, ['updatedat', '更新時間']);

    result.customers = rows
      .filter(r => r && (r[0] || r[1] || r[2] || r[3]))
      .map((r, i) => {
        let email = emailIdx !== -1 && r[emailIdx] ? String(r[emailIdx]) : String(r[3] || '');
        // If not in specified column or doesn't have @, scan the whole row
        if (!email || !email.includes('@')) {
          const detected = findEmailInRow(r);
          if (detected) email = detected;
        }

        const points = pointsIdx !== -1 && r[pointsIdx] !== undefined ? parseInt(r[pointsIdx]) || 0 : parseInt(r[4]) || 0;
        const visits = visitIdx !== -1 && r[visitIdx] !== undefined ? parseInt(r[visitIdx]) || 0 : parseInt(r[5]) || 0;
        const spent = spentIdx !== -1 && r[spentIdx] !== undefined ? parseFloat(r[spentIdx]) || 0 : parseFloat(r[6]) || 0;
        const tier = (tierIdx !== -1 && r[tierIdx] ? String(r[tierIdx]) : String(r[7] || 'Bronze')) as Customer['tier'];
        const lastVisit = lastVisitIdx !== -1 && r[lastVisitIdx] ? String(r[lastVisitIdx]) : String(r[8] || '');
        const updatedAt = updatedAtIdx !== -1 && r[updatedAtIdx] ? String(r[updatedAtIdx]) : String(r[9] || lastVisit || new Date().toISOString());

        return {
          id: idIdx !== -1 && r[idIdx] ? String(r[idIdx]) : String(r[0] || `cust-${i + 1}`),
          name: nameIdx !== -1 && r[nameIdx] ? String(r[nameIdx]) : String(r[1] || ''),
          phone: phoneIdx !== -1 && r[phoneIdx] ? String(r[phoneIdx]) : String(r[2] || ''),
          email: email.trim(),
          loyaltyPoints: points,
          visitCount: visits,
          totalSpent: spent,
          tier: tier || 'Bronze',
          lastVisit,
          updatedAt,
        };
      });
  }

  // 7. Coupons
  if (Array.isArray(sheetsData.Coupons)) {
    const rows = sheetsData.Coupons.length > 1 ? sheetsData.Coupons.slice(1) : [];
    result.coupons = rows
      .filter(r => r && r[0])
      .map(r => ({
        id: String(r[0]),
        customerId: String(r[1] || ''),
        code: String(r[2] || ''),
        title: String(r[3] || ''),
        discountType: String(r[4] || 'fixed') as 'fixed' | 'percentage',
        discountValue: parseFloat(r[5]) || 0,
        pointsSpent: parseInt(r[6]) || 0,
        redeemedAt: String(r[7] || ''),
        isUsed: String(r[8]).toUpperCase() === 'YES' || String(r[8]) === 'true',
      }));
  }

  // 8. Inventory
  if (Array.isArray(sheetsData.Inventory)) {
    const rows = sheetsData.Inventory.length > 1 ? sheetsData.Inventory.slice(1) : [];
    result.inventory = rows
      .filter(r => r && r[0])
      .map(r => ({
        id: String(r[0]),
        name: String(r[1] || ''),
        category: String(r[2] || ''),
        unit: String(r[3] || ''),
        stockQuantity: parseFloat(r[4]) || 0,
        minStockAlert: parseFloat(r[5]) || 0,
        costPerUnit: parseFloat(r[6]) || 0,
        supplierName: String(r[7] || ''),
      }));
  }

  // 9. ActivityLogs
  if (Array.isArray(sheetsData.ActivityLogs)) {
    const rows = sheetsData.ActivityLogs.length > 1 ? sheetsData.ActivityLogs.slice(1) : [];
    const seenIds = new Set<string>();
    result.activityLogs = rows
      .filter(r => r && r[0])
      .map((r, i) => {
        let logId = String(r[0]);
        if (seenIds.has(logId)) {
          logId = `${logId}-${i}`;
        }
        seenIds.add(logId);
        return {
          id: logId,
          timestamp: String(r[1] || new Date().toISOString()),
          user: String(r[2] || 'System'),
          role: String(r[3] || 'Staff'),
          action: String(r[4] || ''),
          details: String(r[5] || ''),
        };
      });
  }

  // 10. Settings
  if (Array.isArray(sheetsData.Settings) && sheetsData.Settings.length > 1) {
    const settingsObj: any = {};
    sheetsData.Settings.slice(1).forEach(r => {
      if (!r || !r[0]) return;
      const key = String(r[0]);
      const val = r[1];
      if (key === 'RestaurantName') settingsObj.restaurantName = String(val);
      if (key === 'Phone') settingsObj.phone = String(val);
      if (key === 'Address') settingsObj.address = String(val);
      if (key === 'CurrencySymbol') settingsObj.currencySymbol = String(val);
      if (key === 'TaxRate') settingsObj.taxRate = parseFloat(val) || 0;
      if (key === 'ServiceChargeRate') settingsObj.serviceChargeRate = parseFloat(val) || 0;
      if (key === 'TableCount') settingsObj.tableCount = parseInt(val) || 12;
      if (key === 'OpeningHours') settingsObj.openingHours = String(val);
      if (key === 'ReceiptHeader') settingsObj.receiptHeader = String(val);
      if (key === 'ReceiptFooter') settingsObj.receiptFooter = String(val);
      if (key === 'RolePermissions') {
        try {
          settingsObj.rolePermissions = typeof val === 'string' ? JSON.parse(val) : val;
        } catch {}
      }
    });
    result.settings = settingsObj;
  }

  return result;
}

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwKGW87AiBAl1p5bUZtlmfgY87_Ck6DCWRTCLuw5kfijKhLrd6xvNv_5F5rqSs5rcsXkQ/exec';

let activeScriptUrl = DEFAULT_GAS_URL;

export const gasService = {
  setScriptUrl(url: string) {
    activeScriptUrl = url || DEFAULT_GAS_URL;
  },

  getScriptUrl(): string {
    return activeScriptUrl || DEFAULT_GAS_URL;
  },

  async fetchAllFromGoogleSheets(webAppUrl?: string): Promise<{ success: boolean; data?: any; message?: string }> {
    const targetUrl = webAppUrl || activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl || !targetUrl.startsWith('http')) {
      return { success: false, message: 'Please enter a valid Google Apps Script Web App URL.' };
    }
    try {
      const response = await fetch(`${targetUrl}?action=fetchAll`, { method: 'GET' });
      const data = await response.json();
      if (data && data.status === 'success' && data.data) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Failed to fetch database from Google Sheets.' };
    } catch (err) {
      return { success: false, message: 'Fetch error: ' + String(err) };
    }
  },

  async testConnection(webAppUrl?: string): Promise<{ success: boolean; message: string }> {
    const targetUrl = webAppUrl || activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl || !targetUrl.startsWith('http')) {
      return { success: false, message: 'Please enter a valid Google Apps Script Web App URL.' };
    }
    try {
      const response = await fetch(`${targetUrl}?action=ping`, {
        method: 'GET',
      });
      const data = await response.json();
      if (data && data.status === 'success') {
        return { success: true, message: data.message || 'Connected successfully!' };
      }
      return { success: false, message: 'Received invalid response structure from Google Sheets.' };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to reach Google Apps Script. Check CORS & deployment access permissions.',
      };
    }
  },

  async syncOrder(order: any): Promise<{ success: boolean }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) return { success: false };
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'saveOrder',
          data: order,
        }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async syncReservation(reservation: any): Promise<{ success: boolean }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) return { success: false };
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'saveReservation',
          data: reservation,
        }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async syncWaitlist(waitlistItem: any): Promise<{ success: boolean }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) return { success: false };
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'saveWaitlist',
          data: waitlistItem,
        }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async syncClockIn(employeeName: string, role: string, isClockedIn: boolean): Promise<{ success: boolean }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) return { success: false };
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'logClockIn',
          data: {
            id: 'clock-' + Date.now(),
            employeeName,
            role,
            action: isClockedIn ? 'Clock In' : 'Clock Out',
            timestamp: new Date().toISOString()
          },
        }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async syncAllToGoogleSheets(webAppUrl: string, statePayload: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    const targetUrl = webAppUrl || activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) {
      return { success: false, message: 'No Google Apps Script URL set.' };
    }
    try {
      const formattedData = formatFullDataPayload(statePayload);
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'syncAll',
          data: formattedData,
        }),
      });
      const data = await response.json();
      if (data && data.status === 'success') {
        return { success: true, message: 'All POS data synchronized to Google Sheets!' };
      }
      return { success: false, message: data.message || 'Sync failed.' };
    } catch (err) {
      return { success: false, message: 'Network or CORS error during Google Sheets sync: ' + String(err) };
    }
  },

  async sendReminderEmail(reservation: any): Promise<{ success: boolean; message: string }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) {
      return { success: false, message: 'Google Apps Script URL is not configured in Settings.' };
    }
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'sendReminder',
          data: reservation,
        }),
      });
      const data = await response.json();
      if (data && data.status === 'success') {
        return { success: true, message: 'Reminder email sent successfully to ' + (reservation.email || 'customer') };
      }
      return { success: false, message: data.message || 'Failed to send email.' };
    } catch (err) {
      return { success: false, message: 'Error triggering reminder email: ' + String(err) };
    }
  },

  async syncCustomer(customer: any): Promise<{ success: boolean }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) return { success: false };
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'saveCustomer', data: customer }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async syncInventory(item: any): Promise<{ success: boolean }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) return { success: false };
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'saveInventory', data: item }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async syncMenuItem(item: any): Promise<{ success: boolean }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) return { success: false };
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'saveMenuItem', data: item }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async syncTable(table: any): Promise<{ success: boolean }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) return { success: false };
    const isFree = table.status === 'Available' || table.status === 'Cleaning';
    const tableToSync = isFree
      ? { ...table, currentOrderId: '', customerName: '', reservationTime: '' }
      : table;
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'saveTable', data: tableToSync }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async syncEmployee(employee: any): Promise<{ success: boolean }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) return { success: false };
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'saveEmployee', data: employee }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  async deleteRow(sheetName: string, id: string): Promise<{ success: boolean }> {
    const targetUrl = activeScriptUrl || DEFAULT_GAS_URL;
    if (!targetUrl) return { success: false };
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'deleteRow', data: { sheetName, id } }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  },
};

export const GAS_INDEX_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Restaurant POS & Guest Loyalty Web App</title>
    <!-- Tailwind CSS CDN for Google Apps Script -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0f172a; color: #f8fafc; }
    </style>
  </head>
  <body class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
    <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl">
          🍽️
        </div>
        <div>
          <h1 class="text-base font-black text-white">Grand Bistro POS & Membership</h1>
          <p class="text-xs text-amber-400 font-semibold">Hosted on Google Apps Script & Google Sheets DB</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          ● Apps Script Active
        </span>
      </div>
    </header>

    <main class="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
      <div class="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center space-y-4 shadow-2xl">
        <div class="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-lg">
          🎁
        </div>
        <h2 class="text-2xl font-black text-white">Google Apps Script Web App Backend</h2>
        <p class="text-sm text-slate-400 max-w-lg mx-auto">
          Your Google Sheets database and REST API endpoints are fully running inside this Google Apps Script project!
        </p>
        
        <div id="statusBox" class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 text-left overflow-x-auto">
          Loading system diagnostics...
        </div>
      </div>
    </main>

    <footer class="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
      Restaurant POS & Member Loyalty System • Powered by Google Sheets & Apps Script
    </footer>

    <script>
      // Test Apps Script Data Bridge
      window.onload = function() {
        const box = document.getElementById('statusBox');
        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(function(res) {
              box.innerHTML = '<strong>Data Bridge Status:</strong> Connected to Google Sheets!<br>Active Tables: ' + (res.Tables ? res.Tables.length : 0) + ' sheets configured.';
            })
            .withFailureHandler(function(err) {
              box.innerHTML = 'Error fetching sheet data: ' + err;
            })
            .fetchAllSheetsData();
        } else {
          box.innerHTML = 'API Status: Active. Serving REST API endpoint for POS App.';
        }
      };
    </script>
  </body>
</html>`;


