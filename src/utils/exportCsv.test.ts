import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTicketsCsv, escapeCsvField } from './exportCsv';
import { Ticket } from '../types';

test('escapeCsvField wraps values in quotes and escapes internal quotes', () => {
  assert.equal(escapeCsvField('normal'), '"normal"');
  assert.equal(escapeCsvField('hello, world'), '"hello, world"');
  assert.equal(escapeCsvField('say "hi"'), '"say ""hi"""');
  assert.equal(escapeCsvField(123), '"123"');
  assert.equal(escapeCsvField(null), '""');
});

test('generateTicketsCsv formats headers and rows correctly', () => {
  const mockTickets: Ticket[] = [
    {
      id: 'TK-999',
      title: 'Ceiling fan broken, making noise',
      description: 'Fan shakes and hums in "Block B"',
      building: 'Block B',
      room: 'C-204',
      category: 'electrical',
      status: 'reported',
      safetySeverity: 2,
      affectedCount: 5,
      affectedUserIds: ['u1', 'u2'],
      impactScore: 68,
      impactBreakdown: {
        safetyScore: 14,
        affectedScore: 18,
        recurrenceScore: 20,
        timeScore: 6,
        totalScore: 68,
        priorityLevel: 'High',
        reasons: ['5 students affected'],
      },
      authorId: 'user1',
      authorName: 'Alex',
      authorEmail: 'alex@campus.edu',
      isAnonymous: false,
      verifiedCount: 0,
      unresolvedCount: 0,
      createdAt: '2026-10-24T00:00:00.000Z',
      updatedAt: '2026-10-24T00:00:00.000Z',
    },
  ];

  const csv = generateTicketsCsv(mockTickets);
  const lines = csv.split('\r\n');

  assert.ok(lines.length >= 2, 'CSV must have at least header and one data row');
  assert.ok(lines[0].includes('"Ticket ID"'));
  assert.ok(lines[0].includes('"Campus Impact Score (0-100)"'));
  assert.ok(lines[0].includes('"Status"'));

  // Data row check
  assert.ok(lines[1].includes('"TK-999"'));
  assert.ok(lines[1].includes('"68"'));
  assert.ok(lines[1].includes('"reported"'));
  assert.ok(lines[1].includes('"Block B"'));
  assert.ok(lines[1].includes('"C-204"'));
});
