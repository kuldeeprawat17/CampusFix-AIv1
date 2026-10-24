import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI client (always server-side per guidelines)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Issue Triage & Smart Categorizer
app.post('/api/gemini/triage', async (req, res) => {
  try {
    const { title, description, building, room } = req.body;

    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description required' });
    }

    const prompt = `You are CampusFix AI's expert triage intelligence for university facilities management.
Analyze the following maintenance report submitted by a campus student/staff member:
- Title: ${title || 'N/A'}
- Description: ${description || 'N/A'}
- Location: ${building || 'Campus'} - Room/Area: ${room || 'General'}

Provide a JSON assessment with the following schema:
{
  "suggestedCategory": "electrical" | "plumbing" | "tech" | "wifi" | "furniture" | "hvac" | "safety" | "other",
  "suggestedSeverity": 1 to 5 (1=cosmetic/minor, 3=moderate disruption, 5=immediate hazard like sparks, flood near power, gas, structural),
  "isSafetyHazard": boolean,
  "hazardExplanation": string (short 1 sentence explaining safety implication or why it is high/low risk),
  "urgency": "Immediate" | "Within 24 Hours" | "Scheduled Maintenance",
  "suggestedAction": string (brief technician advice, e.g. "Isolate circuit breaker and inspect motor"),
  "detectedEquipment": string (e.g., "Ceiling Fan", "Ceiling Projector", "Sanitary Plumbing", "Wi-Fi Access Point")
}

Return ONLY valid JSON without markdown tags or backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Triage error:', error);
    // Graceful rule-based fallback if API key is not yet set
    const text = `${req.body.title || ''} ${req.body.description || ''}`.toLowerCase();
    const isSafety = text.includes('spark') || text.includes('wire') || text.includes('leak') || text.includes('shock') || text.includes('smoke');
    let category = 'other';
    if (text.includes('fan') || text.includes('light') || text.includes('plug') || text.includes('wire')) category = 'electrical';
    else if (text.includes('water') || text.includes('leak') || text.includes('tap') || text.includes('toilet')) category = 'plumbing';
    else if (text.includes('projector') || text.includes('screen') || text.includes('mic')) category = 'tech';
    else if (text.includes('wifi') || text.includes('wi-fi') || text.includes('network') || text.includes('internet')) category = 'wifi';
    else if (text.includes('ac') || text.includes('cooling') || text.includes('heater')) category = 'hvac';
    else if (text.includes('chair') || text.includes('desk') || text.includes('door') || text.includes('table')) category = 'furniture';

    return res.json({
      suggestedCategory: category,
      suggestedSeverity: isSafety ? 4 : 2,
      isSafetyHazard: isSafety,
      hazardExplanation: isSafety ? 'Possible safety hazard detected from keywords.' : 'Standard maintenance request.',
      urgency: isSafety ? 'Within 24 Hours' : 'Scheduled Maintenance',
      suggestedAction: 'Inspect unit and test electrical/mechanical connection.',
      detectedEquipment: 'Campus Facility Equipment',
    });
  }
});

// Endpoint: AI Maintenance Chatbot
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, contextTickets, useDeepThinking } = req.body;

    const systemInstruction = `You are CampusFix AI, the smart campus facilities and maintenance copilot.
Your mission is to help students, staff, and technicians manage campus repairs efficiently with transparency.
You are aware of current campus tickets context:
${JSON.stringify((contextTickets || []).slice(0, 15).map((t: any) => ({
  id: t.id,
  title: t.title,
  building: t.building,
  room: t.room,
  status: t.status,
  impactScore: t.impactScore,
  affectedCount: t.affectedCount,
  category: t.category,
})))}

Guidelines:
1. Answer questions about current campus issues concisely and helpfully.
2. If a student is reporting a problem verbally, tell them if a ticket already exists (mentioning the "One Problem, One Ticket" principle).
3. If staff asks for diagnostic advice, provide actionable step-by-step troubleshooting, tools required, and safety precautions.
4. Keep a reassuring, professional, and campus-friendly tone. Format with clear bullet points.`;

    const modelName = useDeepThinking ? 'gemini-4-argon' : 'gemini-3.8-flash';
    const config: any = {
      systemInstruction,
    };

    if (useDeepThinking) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    // Format conversation history
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    return res.json({
      reply: response.text || 'I am here to assist with campus maintenance.',
      modelUsed: modelName,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error.message || 'Chat service temporarily unavailable',
      reply: 'CampusFix AI assistant is ready to help. You can report issues, support existing tickets, or check the campus hotspot dashboard.',
    });
  }
});

// Endpoint: Duplicate Semantic Assessment
app.post('/api/gemini/duplicate-check', async (req, res) => {
  try {
    const { newReport, existingTickets } = req.body;

    if (!existingTickets || existingTickets.length === 0) {
      return res.json({ matches: [] });
    }

    const prompt = `You are a duplicate complaint detector for campus facilities.
New Report:
- Title: ${newReport.title}
- Description: ${newReport.description}
- Building: ${newReport.building}
- Room: ${newReport.room}
- Category: ${newReport.category}

Existing Open Tickets:
${JSON.stringify(existingTickets.slice(0, 8).map((t: any) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  building: t.building,
  room: t.room,
  category: t.category,
})))}

Determine if the new report describes the same underlying physical issue or shared facility failure as any existing ticket.
Return JSON:
{
  "matches": [
    {
      "ticketId": string,
      "isDuplicate": boolean,
      "confidence": number (0 to 100),
      "reason": string
    }
  ]
}
Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{"matches":[]}');
    return res.json(parsed);
  } catch (error: any) {
    // If AI duplicate check fails, client uses local deterministic duplicate detector
    return res.json({ matches: [] });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusFix AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
