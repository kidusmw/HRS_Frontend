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

/**
 * Receptionist Operational Report Data Structure
 */
export interface ReceptionistReportData {
  arrivals: {
    total: number;
    byDate: Record<string, number>;
    list: Array<{
      id: number;
      guestName: string;
      roomNumber: string;
      checkIn: string;
      status: string;
    }>;
  };
  departures: {
    total: number;
    byDate: Record<string, number>;
    list: Array<{
      id: number;
      guestName: string;
      roomNumber: string;
      checkOut: string;
    }>;
  };
  inHouse: {
    total: number;
    list: Array<{
      id: number;
      guestName: string;
      roomNumber: string;
      checkIn: string;
      checkOut: string;
    }>;
  };
  occupancy: {
    rate: number;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Converts receptionist operational report data to Excel format and triggers download
 * Uses SheetJS (https://sheetjs.com/) to create the Excel file
 * 
 * @param reportData - The operational report data
 * @param range - The date range for the report (used in filename)
 */
export function downloadReceptionistReportAsExcel(
  reportData: ReceptionistReportData,
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
    };
    return labels[range] || range;
  };

  // Sheet 1: Summary Overview
  const summaryData = [
    ['Operational Report'],
    ['Date Range', `${reportData.dateRange.start} to ${reportData.dateRange.end}`],
    ['Report Period', getRangeLabel(range)],
    [''],
    ['OPERATIONAL METRICS'],
    ['Arrivals', reportData.arrivals.total],
    ['Departures', reportData.departures.total],
    ['In-House Guests', reportData.inHouse.total],
    [''],
    ['OCCUPANCY METRICS'],
    ['Occupancy Rate', `${reportData.occupancy.rate.toFixed(1)}%`],
    ['Total Rooms', reportData.occupancy.totalRooms],
    ['Occupied Rooms', reportData.occupancy.occupiedRooms],
    ['Available Rooms', reportData.occupancy.availableRooms],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 2: Arrivals (Check-ins)
  if (reportData.arrivals.list && reportData.arrivals.list.length > 0) {
    const arrivalsData = [
      ['Guest Name', 'Room Number', 'Check-in Date', 'Status'],
      ...reportData.arrivals.list.map((arrival) => [
        arrival.guestName,
        arrival.roomNumber,
        arrival.checkIn,
        arrival.status,
      ]),
    ];

    const arrivalsSheet = XLSX.utils.aoa_to_sheet(arrivalsData);
    XLSX.utils.book_append_sheet(workbook, arrivalsSheet, 'Arrivals');
  }

  // Sheet 3: Departures (Check-outs)
  if (reportData.departures.list && reportData.departures.list.length > 0) {
    const departuresData = [
      ['Guest Name', 'Room Number', 'Check-out Date'],
      ...reportData.departures.list.map((departure) => [
        departure.guestName,
        departure.roomNumber,
        departure.checkOut,
      ]),
    ];

    const departuresSheet = XLSX.utils.aoa_to_sheet(departuresData);
    XLSX.utils.book_append_sheet(workbook, departuresSheet, 'Departures');
  }

  // Sheet 4: In-House Guests
  if (reportData.inHouse.list && reportData.inHouse.list.length > 0) {
    const inHouseData = [
      ['Guest Name', 'Room Number', 'Check-in Date', 'Check-out Date'],
      ...reportData.inHouse.list.map((guest) => [
        guest.guestName,
        guest.roomNumber,
        guest.checkIn,
        guest.checkOut,
      ]),
    ];

    const inHouseSheet = XLSX.utils.aoa_to_sheet(inHouseData);
    XLSX.utils.book_append_sheet(workbook, inHouseSheet, 'In-House');
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const rangeLabel = getRangeLabel(range).replace(/\s+/g, '_');
  const filename = `Operational_Report_${rangeLabel}_${timestamp}.xlsx`;

  // Write the file and trigger download
  XLSX.writeFile(workbook, filename);
}

