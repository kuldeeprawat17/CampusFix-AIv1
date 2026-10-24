import { Ticket } from '../types';

/**
 * Escapes fields according to RFC 4180 CSV standard
 */
export function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) {
    return '""';
  }
  const str = String(field);
  // If the field contains comma, newline or double quote, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Converts tickets array into valid CSV string
 */
export function generateTicketsCsv(tickets: Ticket[]): string {
  const headers = [
    'Ticket ID',
    'Title',
    'Description',
    'Building',
    'Room',
    'Category',
    'Status',
    'Safety Severity (1-5)',
    'Affected Students Count',
    'Campus Impact Score (0-100)',
    'Priority Level',
    'Safety Score (S)',
    'Affected Score (A)',
    'Recurrence Score (R)',
    'Time Score (T)',
    'Assigned Technician',
    'Resolution Notes',
    'Resolved By',
    'Verified Count',
    'Unresolved Count',
    'Reporter Name',
    'Is Anonymous',
    'Created At (UTC)',
    'Last Updated (UTC)',
  ];

  const rows = tickets.map((t) => [
    t.id,
    t.title,
    t.description,
    t.building,
    t.room,
    t.category,
    t.status,
    t.safetySeverity,
    t.affectedCount,
    t.impactScore,
    t.impactBreakdown?.priorityLevel || 'Medium',
    t.impactBreakdown?.safetyScore || 0,
    t.impactBreakdown?.affectedScore || 0,
    t.impactBreakdown?.recurrenceScore || 0,
    t.impactBreakdown?.timeScore || 0,
    t.assignedTechnician || 'Unassigned',
    t.resolutionNotes || '',
    t.resolvedBy || '',
    t.verifiedCount || 0,
    t.unresolvedCount || 0,
    t.isAnonymous ? 'Anonymous' : t.authorName || 'Student',
    t.isAnonymous ? 'Yes' : 'No',
    t.createdAt,
    t.updatedAt,
  ]);

  const csvContent = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\r\n');

  return csvContent;
}

/**
 * Triggers a browser download of the generated CSV file
 */
export function downloadTicketsCsv(tickets: Ticket[], filenamePrefix = 'campusfix_maintenance_report'): void {
  const csvData = generateTicketsCsv(tickets);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
