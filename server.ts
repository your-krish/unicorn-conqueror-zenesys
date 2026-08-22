import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // AI Analysis endpoint
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { operationsData } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Return 503 so client falls back gracefully to local deterministic grounded model
        return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
      }

      const prompt = `You are the STRATIQ Enterprise Operations AI Intelligence Engine.
Analyze the following real-time operational data and return a JSON object with:
1. "anomalies": Array of genuine detected statistical/operational anomalies (Safety Stock Deficits, Revenue-at-Risk Surges, Efficiency Drops, Lead Time Variances). Each with id, metric, category, current_value, expected_value, difference, severity ('LOW'|'MEDIUM'|'HIGH'|'CRITICAL'), explanation, detected_at, linked_insight_id, linked_prediction_id.
2. "insights": Array of business insights (positive trends, negative trends, KPI changes, performance shifts, root causes, and recommended actions). Each with id, title, type, explanation, relevant_metric, impact_level ('LOW'|'MEDIUM'|'HIGH'), possible_causes (array of strings), recommended_action, department_code, linked_anomaly_id, linked_prediction_id.
3. "predictions": Array of predictive analytics forecasting future outcomes based on historical trends (Safety Stock Zero-Stock Horizon, Quarterly Revenue Realization, Efficiency Trajectory, Project Milestones, and an entry for Insufficient Data when historical baseline < 3 intervals). Each with id, metric, category, current_value, predicted_value, prediction_period, confidence_level (0-100), trend_direction, explanation, reason, historical_trend (array of {period, value, isProjected, lowerBound, upperBound}), insufficient_data (boolean), linked_insight_id.
4. "connected_chains": Array of causal chains linking Anomaly -> Business Insight -> Predictive Analytics.
5. "executive_summary": A high-level executive briefing paragraph.

Operational Snapshot:
${JSON.stringify(operationsData, null, 2)}

Return ONLY valid JSON matching this schema without markdown fences if possible.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({
          ...parsed,
          model_used: 'Gemini 3.7 Flash (Live Server Integration)',
          analyzed_at: new Date().toISOString(),
        });
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON output:', parseErr, responseText);
        return res.status(500).json({ error: 'Failed to parse AI output', raw: responseText });
      }
    } catch (error: any) {
      console.error('Gemini API execution error:', error);
      return res.status(500).json({ error: error?.message || 'Gemini API call failed' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`STRATIQ Enterprise OS Server running on http://localhost:${PORT}`);
  });
}

startServer();
