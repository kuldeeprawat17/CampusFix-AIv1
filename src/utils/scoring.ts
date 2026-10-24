/**
 * Campus Impact Score calculation
 * Formula: Impact Score = S + A + R + T (normalized to 0-100)
 * S = Safety & Severity (0-35)
 * A = Affected Students (0-30)
 * R = Recurrence in area / equipment (0-20)
 * T = Time Unresolved (0-15)
 */

export interface ImpactBreakdown {
  safetyScore: number;
  affectedScore: number;
  recurrenceScore: number;
  timeScore: number;
  totalScore: number;
  priorityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  reasons: string[];
}

export interface ScoreFactors {
  safetySeverity: number; // 1 to 5
  category: string;
  affectedCount: number;
  priorReportsInLocation?: number; // count of past tickets in same room/area
  createdAt: string | number | Date;
  customSafetyBonus?: boolean;
}

export function calculateSafetyScore(severity: number, category: string, description = ''): number {
  let score = 5;
  if (severity === 1) score = 7;
  else if (severity === 2) score = 14;
  else if (severity === 3) score = 21;
  else if (severity === 4) score = 28;
  else if (severity >= 5) score = 35;

  const descLower = description.toLowerCase();
  const isElectricalHazard = descLower.includes('spark') || descLower.includes('shock') || descLower.includes('exposed wire');
  const isWaterElectrical = (descLower.includes('leak') || descLower.includes('water')) && (descLower.includes('socket') || descLower.includes('wire') || descLower.includes('switch'));
  const isGasOrFire = descLower.includes('smoke') || descLower.includes('fire') || descLower.includes('gas');

  if (isElectricalHazard || isWaterElectrical || isGasOrFire || category === 'safety') {
    score = Math.max(score, 30);
  }

  return Math.min(35, Math.max(0, score));
}

export function calculateAffectedScore(affectedCount: number): number {
  if (affectedCount <= 1) return 5;
  if (affectedCount <= 3) return 12;
  if (affectedCount <= 6) return 18;
  if (affectedCount <= 12) return 24;
  return 30; // 13+ students
}

export function calculateRecurrenceScore(priorCount = 0): number {
  if (priorCount <= 0) return 0;
  if (priorCount === 1) return 6;
  if (priorCount <= 3) return 13;
  return 20; // 4+ recurring issues in same location
}

export function calculateTimeScore(createdAt: string | number | Date, now: number = Date.now()): number {
  const createdTime = typeof createdAt === 'string' || createdAt instanceof Date ? new Date(createdAt).getTime() : createdAt;
  const hoursUnresolved = Math.max(0, (now - createdTime) / (1000 * 60 * 60));

  if (hoursUnresolved < 4) return 2;
  if (hoursUnresolved < 24) return 6;
  if (hoursUnresolved < 72) return 10;
  return 15; // > 3 days unresolved
}

export function calculateImpactScore(factors: ScoreFactors, now: number = Date.now(), description = ''): ImpactBreakdown {
  const safety = calculateSafetyScore(factors.safetySeverity, factors.category, description);
  const affected = calculateAffectedScore(factors.affectedCount);
  const recurrence = calculateRecurrenceScore(factors.priorReportsInLocation || 0);
  const time = calculateTimeScore(factors.createdAt, now);

  const rawTotal = safety + affected + recurrence + time;
  const totalScore = Math.min(100, Math.max(5, Math.round(rawTotal)));

  let priorityLevel: ImpactBreakdown['priorityLevel'] = 'Low';
  if (totalScore >= 75) priorityLevel = 'Critical';
  else if (totalScore >= 55) priorityLevel = 'High';
  else if (totalScore >= 35) priorityLevel = 'Medium';

  const reasons: string[] = [];
  if (safety >= 28) {
    reasons.push(`High Safety/Hazard risk (+${safety} pts)`);
  } else if (safety >= 15) {
    reasons.push(`Moderate equipment severity (+${safety} pts)`);
  } else {
    reasons.push(`Standard severity (+${safety} pts)`);
  }

  if (factors.affectedCount > 1) {
    reasons.push(`${factors.affectedCount} students affected (+${affected} pts)`);
  } else {
    reasons.push(`Individual report (+${affected} pts)`);
  }

  if ((factors.priorReportsInLocation || 0) > 0) {
    reasons.push(`Recurring problem area (${factors.priorReportsInLocation} prior tickets, +${recurrence} pts)`);
  }

  const hours = Math.round((now - new Date(factors.createdAt).getTime()) / (1000 * 60 * 60));
  if (hours >= 24) {
    reasons.push(`Unresolved for ${hours}h (+${time} pts)`);
  }

  return {
    safetyScore: safety,
    affectedScore: affected,
    recurrenceScore: recurrence,
    timeScore: time,
    totalScore,
    priorityLevel,
    reasons,
  };
}
