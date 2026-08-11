import { Order, InventoryItem, Customer, MenuItem } from '../types';

export const exportService = {
  exportOrdersToCSV(orders: Order[]) {
    const headers = [
      'Order Number',
      'Type',
      'Table',
      'Customer',
      'Status',
      'Subtotal',
      'Discount',
      'Tax',
      'Service Charge',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Created At',
      'Created By'
    ];

    const rows = orders.map(o => [
      o.orderNumber,
      o.type,
      o.tableName || '-',
      o.customerName || 'Guest',
      o.status,
      o.subtotal.toFixed(2),
      o.discountAmount.toFixed(2),
      o.taxAmount.toFixed(2),
      o.serviceChargeAmount.toFixed(2),
      o.totalAmount.toFixed(2),
      o.paymentMethod || 'Unpaid',
      o.paymentStatus,
      new Date(o.createdAt).toLocaleString(),
      o.createdBy
    ]);

    this.downloadCSV('restaurant_orders_report.csv', [headers, ...rows]);
  },

  exportInventoryToCSV(items: InventoryItem[]) {
    const headers = [
      'Item Name',
      'Category',
      'Stock Quantity',
      'Unit',
      'Min Stock Alert',
      'Cost Per Unit',
      'Supplier',
      'Last Restocked'
    ];

    const rows = items.map(i => [
      i.name,
      i.category,
      i.stockQuantity,
      i.unit,
      i.minStockAlert,
      i.costPerUnit.toFixed(2),
      i.supplierName,
      i.lastRestocked
    ]);

    this.downloadCSV('restaurant_inventory_report.csv', [headers, ...rows]);
  },

  exportCustomersToCSV(customers: Customer[]) {
    const headers = [
      'Customer Name',
      'Phone',
      'Email',
      'Loyalty Points',
      'Visit Count',
      'Total Spent ($)',
      'Tier',
      'Last Visit'
    ];

    const rows = customers.map(c => [
      c.name,
      c.phone,
      c.email,
      c.loyaltyPoints,
      c.visitCount,
      c.totalSpent.toFixed(2),
      c.tier,
      c.lastVisit || '-'
    ]);

    this.downloadCSV('restaurant_customers_report.csv', [headers, ...rows]);
  },

  exportMenuToCSV(menuItems: MenuItem[]) {
    const headers = [
      'Item Name',
      'Category',
      'Price ($)',
      'Cost ($)',
      'Margin ($)',
      'Available',
      'Popular',
      'Combo'
    ];

    const rows = menuItems.map(m => [
      m.name,
      m.category,
      m.price.toFixed(2),
      m.cost.toFixed(2),
      (m.price - m.cost).toFixed(2),
      m.isAvailable ? 'Yes' : 'No',
      m.isPopular ? 'Yes' : 'No',
      m.isCombo ? 'Yes' : 'No'
    ]);

    this.downloadCSV('restaurant_menu_catalog.csv', [headers, ...rows]);
  },

  downloadCSV(filename: string, rows: (string | number)[][]) {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
