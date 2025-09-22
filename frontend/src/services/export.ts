// Advanced export service for the Stock Management System
// Supports Excel, CSV, and PDF exports with professional formatting

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Product, Transaction, Supplier, DashboardStats } from '../types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportOptions {
  filename?: string;
  format: 'excel' | 'csv' | 'pdf';
  includeTimestamp?: boolean;
  customHeaders?: Record<string, string>;
  filters?: Record<string, any>;
}

export interface ExportData {
  products?: Product[];
  transactions?: Transaction[];
  suppliers?: Supplier[];
  dashboardStats?: DashboardStats;
  customData?: any[];
  customHeaders?: string[];
}

class ExportService {
  private getTimestamp(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getFilename(baseName: string, format: string, includeTimestamp: boolean = true): string {
    const timestamp = includeTimestamp ? `_${this.getTimestamp()}` : '';
    return `${baseName}${timestamp}.${format}`;
  }

  // Main export method
  async exportData(data: ExportData, options: ExportOptions): Promise<void> {
    try {
      switch (options.format) {
        case 'excel':
          await this.exportToExcel(data, options);
          break;
        case 'csv':
          await this.exportToCSV(data, options);
          break;
        case 'pdf':
          await this.exportToPDF(data, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Excel Export
  private async exportToExcel(data: ExportData, options: ExportOptions): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Export products if available
    if (data.products && data.products.length > 0) {
      const productsData = this.prepareProductsForExport(data.products, options.customHeaders);
      const productsSheet = XLSX.utils.json_to_sheet(productsData);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');
    }

    // Export transactions if available
    if (data.transactions && data.transactions.length > 0) {
      const transactionsData = this.prepareTransactionsForExport(data.transactions, options.customHeaders);
      const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
    }

    // Export suppliers if available
    if (data.suppliers && data.suppliers.length > 0) {
      const suppliersData = this.prepareSuppliersForExport(data.suppliers, options.customHeaders);
      const suppliersSheet = XLSX.utils.json_to_sheet(suppliersData);
      XLSX.utils.book_append_sheet(workbook, suppliersSheet, 'Suppliers');
    }

    // Export dashboard stats if available
    if (data.dashboardStats) {
      const statsData = this.prepareDashboardStatsForExport(data.dashboardStats);
      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Dashboard Stats');
    }

    // Export custom data if available
    if (data.customData && data.customHeaders) {
      const customSheet = XLSX.utils.json_to_sheet(data.customData);
      XLSX.utils.book_append_sheet(workbook, customSheet, 'Custom Data');
    }

    // Generate filename
    const filename = options.filename || 'stock_management_export';
    const finalFilename = this.getFilename(filename, 'xlsx', options.includeTimestamp);

    // Save file
    XLSX.writeFile(workbook, finalFilename);
  }

  // CSV Export
  private async exportToCSV(data: ExportData, options: ExportOptions): Promise<void> {
    let csvContent = '';

    // Add header with export info
    csvContent += 'Stock Management System Export\n';
    csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

    // Export products if available
    if (data.products && data.products.length > 0) {
      csvContent += this.convertToCSV(this.prepareProductsForExport(data.products, options.customHeaders), 'Products');
      csvContent += '\n\n';
    }

    // Export transactions if available
    if (data.transactions && data.transactions.length > 0) {
      csvContent += this.convertToCSV(this.prepareTransactionsForExport(data.transactions, options.customHeaders), 'Transactions');
      csvContent += '\n\n';
    }

    // Export suppliers if available
    if (data.suppliers && data.suppliers.length > 0) {
      csvContent += this.convertToCSV(this.prepareSuppliersForExport(data.suppliers, options.customHeaders), 'Suppliers');
      csvContent += '\n\n';
    }

    // Generate filename
    const filename = options.filename || 'stock_management_export';
    const finalFilename = this.getFilename(filename, 'csv', options.includeTimestamp);

    // Save file
    this.downloadCSV(csvContent, finalFilename);
  }

  // PDF Export
  private async exportToPDF(data: ExportData, options: ExportOptions): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;

    // Add header
    pdf.setFontSize(20);
    pdf.text('Stock Management System', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Export products if available
    if (data.products && data.products.length > 0) {
      yPosition = await this.addProductsToPDF(pdf, data.products, yPosition, pageHeight);
    }

    // Export transactions if available
    if (data.transactions && data.transactions.length > 0) {
      if (yPosition > 50) {
        pdf.addPage();
        yPosition = 20;
      }
      yPosition = await this.addTransactionsToPDF(pdf, data.transactions, yPosition, pageHeight);
    }

    // Export suppliers if available
    if (data.suppliers && data.suppliers.length > 0) {
      if (yPosition > 50) {
        pdf.addPage();
        yPosition = 20;
      }
      yPosition = await this.addSuppliersToPDF(pdf, data.suppliers, yPosition, pageHeight);
    }

    // Export dashboard stats if available
    if (data.dashboardStats) {
      if (yPosition > 50) {
        pdf.addPage();
        yPosition = 20;
      }
      yPosition = this.addDashboardStatsToPDF(pdf, data.dashboardStats, yPosition, pageHeight);
    }

    // Generate filename
    const filename = options.filename || 'stock_management_export';
    const finalFilename = this.getFilename(filename, 'pdf', options.includeTimestamp);

    // Save file
    pdf.save(finalFilename);
  }

  // Data preparation methods
  private prepareProductsForExport(products: Product[], customHeaders?: Record<string, string>): any[] {
    return products.map(product => ({
      'Product ID': product.id,
      'Name': product.name,
      'SKU': product.sku,
      'Category': product.category,
      'Description': product.description || '',
      'Quantity': product.current_stock,
      'Min Stock Level': product.min_stock_level || 0,
      'Unit Price': product.unit_price || 0,
      'Total Value': (product.current_stock * (product.unit_price || 0)).toFixed(2),
      'Status': product.status || 'Active',
      'Supplier': product.supplier?.name || '',
      'Created At': product.created_at ? new Date(product.created_at).toLocaleDateString() : '',
      'Updated At': product.updated_at ? new Date(product.updated_at).toLocaleDateString() : '',
      ...customHeaders
    }));
  }

  private prepareTransactionsForExport(transactions: Transaction[], customHeaders?: Record<string, string>): any[] {
    return transactions.map(transaction => ({
      'Transaction ID': transaction.id,
      'Type': transaction.transaction_type,
      'Product ID': transaction.product_id,
      'Product Name': transaction.product?.name || '',
      'Quantity': transaction.quantity,
      'Unit Price': transaction.unit_price || 0,
      'Total Value': (transaction.quantity * (transaction.unit_price || 0)).toFixed(2),
      'Transaction Date': new Date(transaction.transaction_date).toLocaleString(),
      'Notes': transaction.notes || '',
      'Performed By': transaction.created_by || '',
      ...customHeaders
    }));
  }

  private prepareSuppliersForExport(suppliers: Supplier[], customHeaders?: Record<string, string>): any[] {
    return suppliers.map(supplier => ({
      'Supplier ID': supplier.id,
      'Name': supplier.name,
      'Contact Person': supplier.contact_person || '',
      'Email': supplier.email || '',
      'Phone': supplier.phone || '',
      'Address': supplier.address || '',
      'Products Supplied': supplier.product_count || 0,
      'Total Value': supplier.total_value || 0,
      'Status': supplier.status || 'Active',
      'Created At': supplier.created_at ? new Date(supplier.created_at).toLocaleDateString() : '',
      'Updated At': supplier.updated_at ? new Date(supplier.updated_at).toLocaleDateString() : '',
      ...customHeaders
    }));
  }

  private prepareDashboardStatsForExport(stats: DashboardStats): any[] {
    return [
      { 'Metric': 'Total Products', 'Value': stats.overview.total_products },
      { 'Metric': 'Active Products', 'Value': stats.overview.active_products },
      { 'Metric': 'Total Suppliers', 'Value': stats.overview.total_suppliers },
      { 'Metric': 'Active Suppliers', 'Value': stats.overview.active_suppliers },
      { 'Metric': 'Total Transactions', 'Value': stats.transactions.stock_in.count + stats.transactions.stock_out.count },
      { 'Metric': 'Low Stock Items', 'Value': stats.inventory.low_stock_items },
      { 'Metric': 'Out of Stock Items', 'Value': stats.inventory.out_of_stock_items },
      { 'Metric': 'Stock In Today', 'Value': stats.transactions.stock_in.quantity },
      { 'Metric': 'Stock Out Today', 'Value': stats.transactions.stock_out.quantity },
      { 'Metric': 'Total Inventory Value', 'Value': `$${stats.inventory.total_inventory_value?.toFixed(2) || '0.00'}` },
      { 'Metric': 'Total Stock Units', 'Value': stats.inventory.total_stock_units },
    ];
  }

  // Helper methods
  private convertToCSV(data: any[], title: string): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      title,
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private async addProductsToPDF(pdf: jsPDF, products: Product[], startY: number, pageHeight: number): Promise<number> {
    let yPosition = startY;

    pdf.setFontSize(16);
    pdf.text('Products', 20, yPosition);
    yPosition += 10;

    const productsData = this.prepareProductsForExport(products);
    const headers = Object.keys(productsData[0]);

    const tableData = productsData.map(product =>
      headers.map(header => product[header]?.toString() || '')
    );

    pdf.autoTable({
      head: [headers],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 10 },
      didDrawPage: (data: any) => {
        if (data.pageNumber > 1) {
          yPosition = data.cursor?.y || yPosition;
        }
      }
    });

    return yPosition + 20;
  }

  private async addTransactionsToPDF(pdf: jsPDF, transactions: Transaction[], startY: number, pageHeight: number): Promise<number> {
    let yPosition = startY;

    pdf.setFontSize(16);
    pdf.text('Transactions', 20, yPosition);
    yPosition += 10;

    const transactionsData = this.prepareTransactionsForExport(transactions);
    const headers = Object.keys(transactionsData[0]);

    const tableData = transactionsData.map(transaction =>
      headers.map(header => transaction[header]?.toString() || '')
    );

    pdf.autoTable({
      head: [headers],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 152, 219] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 10 },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          yPosition = data.cursor?.y || yPosition;
        }
      }
    });

    return yPosition + 20;
  }

  private async addSuppliersToPDF(pdf: jsPDF, suppliers: Supplier[], startY: number, pageHeight: number): Promise<number> {
    let yPosition = startY;

    pdf.setFontSize(16);
    pdf.text('Suppliers', 20, yPosition);
    yPosition += 10;

    const suppliersData = this.prepareSuppliersForExport(suppliers);
    const headers = Object.keys(suppliersData[0]);

    const tableData = suppliersData.map(supplier =>
      headers.map(header => supplier[header]?.toString() || '')
    );

    pdf.autoTable({
      head: [headers],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [46, 204, 113] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 10 },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          yPosition = data.cursor?.y || yPosition;
        }
      }
    });

    return yPosition + 20;
  }

  private addDashboardStatsToPDF(pdf: jsPDF, stats: DashboardStats, startY: number, pageHeight: number): number {
    let yPosition = startY;

    pdf.setFontSize(16);
    pdf.text('Dashboard Statistics', 20, yPosition);
    yPosition += 10;

    const statsData = this.prepareDashboardStatsForExport(stats);
    const headers = Object.keys(statsData[0]);

    const tableData = statsData.map(stat =>
      headers.map(header => stat[header]?.toString() || '')
    );

    pdf.autoTable({
      head: [headers],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [155, 89, 182] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 10 },
    });

    return yPosition + 20;
  }

  // Utility methods for specific exports
  async exportProducts(products: Product[], options: Partial<ExportOptions> = {}): Promise<void> {
    await this.exportData({ products }, { format: 'excel', ...options });
  }

  async exportTransactions(transactions: Transaction[], options: Partial<ExportOptions> = {}): Promise<void> {
    await this.exportData({ transactions }, { format: 'excel', ...options });
  }

  async exportSuppliers(suppliers: Supplier[], options: Partial<ExportOptions> = {}): Promise<void> {
    await this.exportData({ suppliers }, { format: 'excel', ...options });
  }

  async exportDashboardReport(stats: DashboardStats, options: Partial<ExportOptions> = {}): Promise<void> {
    await this.exportData({ dashboardStats: stats }, { format: 'pdf', ...options });
  }

  async exportFullReport(data: ExportData, options: Partial<ExportOptions> = {}): Promise<void> {
    await this.exportData(data, { format: 'excel', ...options });
  }
}

// Export singleton instance
export const exportService = new ExportService();
export default exportService;