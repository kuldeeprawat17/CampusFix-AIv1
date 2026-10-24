/**
 * Duplicate ticket detection logic for CampusFix AI
 * "One Problem, One Ticket"
 */

export interface CandidateTicket {
  id: string;
  title: string;
  description: string;
  building: string;
  room: string;
  category: string;
  status: string;
  affectedCount: number;
  createdAt: string | number | Date;
}

export interface DuplicateMatch {
  ticket: CandidateTicket;
  confidence: number; // 0 to 100
  reasons: string[];
  isStrongDuplicate: boolean;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

function tokenize(text: string): Set<string> {
  const words = normalize(text)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'not', 'are', 'with', 'this', 'that', 'our'].includes(w));
  return new Set(words);
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function findPotentialDuplicates(
  newReport: {
    title: string;
    description: string;
    building: string;
    room: string;
    category: string;
  },
  existingTickets: CandidateTicket[],
  currentTicketId?: string
): DuplicateMatch[] {
  const normBuilding = normalize(newReport.building);
  const normRoom = normalize(newReport.room);
  const newTokens = tokenize(`${newReport.title} ${newReport.description}`);

  const matches: DuplicateMatch[] = [];

  for (const ticket of existingTickets) {
    if (currentTicketId && ticket.id === currentTicketId) continue;
    // Closed tickets are generally not duplicates unless reported just now, focus on active/unresolved tickets
    if (ticket.status === 'verified_closed') continue;

    const existingBuilding = normalize(ticket.building);
    const existingRoom = normalize(ticket.room);

    const isSameBuilding = normBuilding && existingBuilding && (normBuilding.includes(existingBuilding) || existingBuilding.includes(normBuilding));
    const isSameRoom = normRoom && existingRoom && (normRoom === existingRoom || normRoom.includes(existingRoom) || existingRoom.includes(normRoom));
    const isSameCategory = newReport.category === ticket.category;

    const existingTokens = tokenize(`${ticket.title} ${ticket.description}`);
    const textSim = jaccardSimilarity(newTokens, existingTokens);

    let confidence = 0;
    const reasons: string[] = [];

    if (isSameBuilding && isSameRoom) {
      confidence += 50;
      reasons.push(`Exact location match: ${ticket.building}, Room ${ticket.room}`);
    } else if (isSameBuilding) {
      confidence += 20;
      reasons.push(`Same building (${ticket.building})`);
    }

    if (isSameCategory) {
      confidence += 20;
      reasons.push(`Same category: ${ticket.category}`);
    }

    if (textSim > 0.4) {
      confidence += 30;
      reasons.push(`High text similarity (${Math.round(textSim * 100)}%)`);
    } else if (textSim > 0.2) {
      confidence += 15;
      reasons.push(`Shared keywords in description`);
    }

    // Check for high-signal key phrases like "fan", "projector", "water leak", "wi-fi", "ac"
    const keyItems = ['fan', 'projector', 'leak', 'wifi', 'wi-fi', 'ac', 'light', 'toilet', 'flush', 'switch', 'door', 'socket'];
    const matchedKeywords = keyItems.filter(
      (k) => (newReport.title.toLowerCase().includes(k) || newReport.description.toLowerCase().includes(k)) &&
             (ticket.title.toLowerCase().includes(k) || ticket.description.toLowerCase().includes(k))
    );

    if (matchedKeywords.length > 0 && isSameRoom) {
      confidence = Math.max(confidence, 85);
      reasons.push(`Same issue subject (${matchedKeywords.join(', ')}) in this room`);
    }

    const finalConfidence = Math.min(100, confidence);

    // Only surface if threshold is met
    if (finalConfidence >= 45) {
      matches.push({
        ticket,
        confidence: finalConfidence,
        reasons,
        isStrongDuplicate: finalConfidence >= 70,
      });
    }
  }

  // Sort highest confidence first
  return matches.sort((a, b) => b.confidence - a.confidence);
}
