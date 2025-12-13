import * as XLSX from 'xlsx';
import type { ManagerReport } from '@/features/manager/api/managerApi';

/**
 * Converts manager report data to Excel format and triggers download
 * Uses SheetJS (https://sheetjs.com/) to create the Excel file
 * 
 * @param reportData - The report data from the API
 * @param range - The date range for the report (used in filename)
 */
export function downloadReportAsExcel(
  reportData: ManagerReport,
  range: string
): void {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Helper function to format range label
  const getRangeLabel = (range: string): string => {
    const labels: Record<string, string> = {
      today: 'Today',
      yesterday: 'Yesterday',
      last_7_days: 'Last 7 Days',
      last_30_days: 'Last 30 Days',
      six_months: '6 Months',
      yearly: 'Yearly',
    };
    return labels[range] || range;
  };

  // Sheet 1: Summary Overview
  const summaryData = [
    ['Hotel Performance Report'],
    ['Date Range', getRangeLabel(range)],
    [''],
    ['OCCUPANCY METRICS'],
    ['Occupancy Rate', `${reportData.occupancy?.rate?.toFixed(2) || 0}%`],
    ['Rooms Occupied', reportData.occupancy?.roomsOccupied || 0],
    ['Rooms Available', reportData.occupancy?.roomsAvailable || 0],
    [''],
    ['REVENUE METRICS'],
    ['Total Revenue', `$${reportData.revenue?.total?.toLocaleString() || 0}`],
    ['Average Daily Rate (ADR)', `$${reportData.metrics?.adr?.toFixed(2) || '0.00'}`],
    ['Revenue Per Available Room (RevPAR)', `$${reportData.metrics?.revpar?.toFixed(2) || '0.00'}`],
    [''],
    ['BOOKING METRICS'],
    ['Total Bookings', reportData.bookings?.total || 0],
    ['Cancellations', reportData.bookings?.cancellations || 0],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 2: Revenue by Room Type
  if (reportData.revenue?.byRoomType && reportData.revenue.byRoomType.length > 0) {
    const revenueData = [
      ['Room Type', 'Revenue'],
      ...reportData.revenue.byRoomType.map((item) => [
        item.type,
        item.revenue,
      ]),
      ['', ''],
      ['Total', reportData.revenue.total],
    ];

    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue by Room Type');
  }

  // Sheet 3: Bookings by Source
  if (reportData.bookings?.bySource && reportData.bookings.bySource.length > 0) {
    const bookingsData = [
      ['Source', 'Count'],
      ...reportData.bookings.bySource.map((item) => [
        item.source,
        item.count,
      ]),
      ['', ''],
      ['Total Bookings', reportData.bookings.total],
      ['Cancellations', reportData.bookings.cancellations],
    ];

    const bookingsSheet = XLSX.utils.aoa_to_sheet(bookingsData);
    XLSX.utils.book_append_sheet(workbook, bookingsSheet, 'Bookings by Source');
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const rangeLabel = getRangeLabel(range).replace(/\s+/g, '_');
  const filename = `Hotel_Report_${rangeLabel}_${timestamp}.xlsx`;

  // Write the file and trigger download
  XLSX.writeFile(workbook, filename);
}

