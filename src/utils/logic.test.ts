import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateImpactScore, calculateSafetyScore, calculateAffectedScore } from './scoring';
import { findPotentialDuplicates } from './duplicateDetector';

test('calculateSafetyScore gives high score to electrical hazard even with low base severity', () => {
  const score = calculateSafetyScore(2, 'electrical', 'Exposed wires with spark near blackboard');
  assert.ok(score >= 30, `Expected safety score >= 30, got ${score}`);
});

test('calculateAffectedScore scales with community count', () => {
  assert.equal(calculateAffectedScore(1), 5);
  assert.equal(calculateAffectedScore(3), 12);
  assert.equal(calculateAffectedScore(8), 24);
  assert.equal(calculateAffectedScore(15), 30);
});

test('calculateImpactScore combines S + A + R + T into transparent score', () => {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const result = calculateImpactScore(
    {
      safetySeverity: 4,
      category: 'electrical',
      affectedCount: 10,
      priorReportsInLocation: 3,
      createdAt: oneDayAgo,
    },
    now,
    'Sparking ceiling fan socket'
  );

  assert.ok(result.totalScore >= 75, `Expected high impact score, got ${result.totalScore}`);
  assert.equal(result.priorityLevel, 'Critical');
  assert.ok(result.reasons.length >= 3, 'Expected explainable reasons list');
});

test('duplicateDetector flags same room and fan issue', () => {
  const existingTickets = [
    {
      id: 'TK-101',
      title: 'Ceiling fan not working',
      description: 'The fan in the back row does not spin when switched on',
      building: 'Block B',
      room: 'C-204',
      category: 'electrical',
      status: 'reported',
      affectedCount: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'TK-102',
      title: 'Water tap leaking',
      description: 'Sink 2 dripping water',
      building: 'Block A',
      room: '101',
      category: 'plumbing',
      status: 'reported',
      affectedCount: 1,
      createdAt: new Date().toISOString(),
    },
  ];

  const matches = findPotentialDuplicates(
    {
      title: 'Fan stopped working',
      description: 'No air, fan is dead',
      building: 'Block B',
      room: 'C-204',
      category: 'electrical',
    },
    existingTickets
  );

  assert.equal(matches.length, 1);
  assert.equal(matches[0].ticket.id, 'TK-101');
  assert.ok(matches[0].confidence >= 70, `Expected confidence >= 70, got ${matches[0].confidence}`);
  assert.equal(matches[0].isStrongDuplicate, true);
});
