import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';

// Strict Zod Schema according to prompt instructions
export const RouteItemSchema = z.object({
  bus: z.string(),
  boardAt: z.string(),
  getDownAt: z.string(),
  transferPoint: z.string().nullable().optional(),
  transfers: z.number().int().min(0),
  durationMinutes: z.number().min(1),
  fare: z.number().min(0),
  studentFare: z.number().optional(),
  instructions: z.string(),
  aiExplanation: z.string().optional()
});

export const GeminiRouteOutputSchema = z.object({
  recommendation: RouteItemSchema,
  alternatives: z.array(RouteItemSchema).default([]),
  warnings: z.array(z.string()).default([])
});

let genAIClient = null;
if (config.gemini.apiKey && !config.gemini.apiKey.includes('YOUR_')) {
  try {
    genAIClient = new GoogleGenAI({ apiKey: config.gemini.apiKey });
    console.log('✓ Gemini AI client initialized.');
  } catch (err) {
    console.warn('⚠️ Could not initialize GoogleGenAI client:', err.message);
  }
}

/**
 * Fallback synthesizer that adheres 100% strictly to verified backend routes.
 * Never invents stops, bus numbers, schedules, or fares.
 */
function buildDeterministicResponse(candidateData, preference, isStudent) {
  const { recommended, alternatives, origin, destination } = candidateData;

  const prefLabel = preference || 'Balanced';
  let explanation = '';
  if (recommended.transfers === 0) {
    explanation = `Selected Bus ${recommended.bus} as the best match for "${prefLabel}" preference because it offers a direct, seamless journey from ${origin.name} to ${destination.name} taking ~${recommended.durationMinutes} minutes for ₹${recommended.fare} with zero transfers.`;
  } else {
    explanation = `Selected the combination of Bus ${recommended.bus} via ${recommended.transferPoint} as the optimal route for "${prefLabel}" travel, connecting ${origin.name} to ${destination.name} in ~${recommended.durationMinutes} mins including an estimated transfer layover at ${recommended.transferPoint}.`;
  }

  const warnings = [];
  if (recommended.transfers > 0) {
    warnings.push(`Transfer required at ${recommended.transferPoint}. Please allow 5-10 minutes layover between connections.`);
  }
  if (isStudent) {
    warnings.push('Concessional student fares applied. Please carry a valid Student Transit ID.');
  }

  const result = {
    recommendation: {
      bus: recommended.bus,
      boardAt: recommended.boardAt,
      getDownAt: recommended.getDownAt,
      transferPoint: recommended.transferPoint || null,
      transfers: recommended.transfers,
      durationMinutes: recommended.durationMinutes,
      fare: recommended.fare,
      studentFare: recommended.studentFare,
      instructions: recommended.instructions,
      aiExplanation: explanation
    },
    alternatives: alternatives.map(alt => ({
      bus: alt.bus,
      boardAt: alt.boardAt,
      getDownAt: alt.getDownAt,
      transferPoint: alt.transferPoint || null,
      transfers: alt.transfers,
      durationMinutes: alt.durationMinutes,
      fare: alt.fare,
      studentFare: alt.studentFare,
      instructions: alt.instructions,
      aiExplanation: `Alternative route taking ~${alt.durationMinutes} minutes with ${alt.transfers} transfer(s) for ₹${alt.fare}.`
    })),
    warnings
  };

  return GeminiRouteOutputSchema.parse(result);
}

export async function generateRouteRecommendation({
  candidateData,
  preference = 'Balanced',
  isStudent = true,
  travelTime
}) {
  const { recommended, alternatives, origin, destination } = candidateData;

  if (!recommended) {
    return {
      recommendation: null,
      alternatives: [],
      warnings: ['Verified route information is unavailable for the selected stops.']
    };
  }

  // If Gemini API is not configured, safely return deterministic grounded response
  if (!genAIClient) {
    return buildDeterministicResponse(candidateData, preference, isStudent);
  }

  const promptText = `
You are the AI BusMate transit reasoning engine.
Analyze these VERIFIED transit routes provided by the backend:

ORIGIN: ${origin.name} (${origin.locality})
DESTINATION: ${destination.name} (${destination.locality})
USER PREFERENCE: ${preference} (Fastest / Cheapest / Fewest Transfers / Balanced)
PASSENGER TYPE: ${isStudent ? 'Student (Eligible for student fare)' : 'Standard Passenger'}
DEPARTURE/TRAVEL TIME: ${travelTime || 'Current time'}

VERIFIED CANDIDATE ROUTES (DO NOT INVENT ANY OTHER ROUTES, BUS NUMBERS, OR STOPS):
${JSON.stringify({ recommended, alternatives }, null, 2)}

STRICT RULES:
1. ONLY recommend from the verified candidate routes supplied above.
2. NEVER invent bus numbers, bus stops, schedules, fares, or routes.
3. Select the best route matching the user's preference "${preference}".
4. Write a concise, helpful explanation in "aiExplanation" explaining why this route fits their preference.
5. Provide clear, student-friendly instructions.
6. Return purely valid JSON matching the exact schema:
{
  "recommendation": {
    "bus": "...",
    "boardAt": "...",
    "getDownAt": "...",
    "transferPoint": null or "...",
    "transfers": 0,
    "durationMinutes": 35,
    "fare": 30,
    "studentFare": 15,
    "instructions": "...",
    "aiExplanation": "..."
  },
  "alternatives": [ ... ],
  "warnings": [ "..." ]
}
`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await genAIClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const responseText = response.text?.trim() || '';
      const parsed = JSON.parse(responseText);

      // Validate strictly with Zod
      const validated = GeminiRouteOutputSchema.parse(parsed);

      // Ensure recommendation values strictly match verified transit data
      const matchesVerified = [recommended, ...alternatives].some(r => r.bus === validated.recommendation.bus);
      if (!matchesVerified) {
        console.warn('AI generated unverified route number. Falling back to deterministic grounded route.');
        return buildDeterministicResponse(candidateData, preference, isStudent);
      }

      return validated;
    } catch (err) {
      if (attempt < 2 && err.message?.includes('503')) {
        await new Promise(r => setTimeout(r, 1200));
        continue;
      }
      console.warn('Gemini API call or validation notice, using grounded fallback:', err.message);
      return buildDeterministicResponse(candidateData, preference, isStudent);
    }
  }
}
