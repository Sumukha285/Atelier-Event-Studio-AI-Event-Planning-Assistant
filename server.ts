/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  generateBlueprintServer,
  generateBrainstormServer,
  generateBudgetServer,
  generateCoPilotServer,
  generateTimelineServer,
  generateVendorVettingServer,
} from './src/services/gemini.server';
import { EventConfig, EventPlanState } from './src/types/event.types';
import { sanitizeEventConfig, sanitizeText } from './src/utils/eventLogic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extracts and sanitizes an `EventConfig` from an incoming Express request body.
 *
 * @param body - Raw request body
 * @returns Sanitized `EventConfig`
 */
function parseRequestConfig(body: Record<string, unknown>): EventConfig {
  const rawConfig = (body?.config ?? body ?? {}) as EventConfig;
  return sanitizeEventConfig(rawConfig);
}

/**
 * Bootstraps the Express API and Vite middleware server on port 3000.
 *
 * @returns Promise resolving once the HTTP server is listening
 */
async function startServer(): Promise<void> {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response): void => {
    res.json({ status: 'ok' });
  });

  app.post('/api/ai/blueprint', async (req: Request, res: Response): Promise<void> => {
    const config = parseRequestConfig(req.body as Record<string, unknown>);
    const result = await generateBlueprintServer(config);
    res.json(result);
  });

  app.post('/api/ai/brainstorm', async (req: Request, res: Response): Promise<void> => {
    const config = parseRequestConfig(req.body as Record<string, unknown>);
    const result = await generateBrainstormServer(config);
    res.json(result);
  });

  app.post('/api/ai/budget', async (req: Request, res: Response): Promise<void> => {
    const config = parseRequestConfig(req.body as Record<string, unknown>);
    const result = await generateBudgetServer(config);
    res.json(result);
  });

  app.post('/api/ai/timeline', async (req: Request, res: Response): Promise<void> => {
    const config = parseRequestConfig(req.body as Record<string, unknown>);
    const result = await generateTimelineServer(config);
    res.json(result);
  });

  app.post('/api/ai/vendor-questions', async (req: Request, res: Response): Promise<void> => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const config = parseRequestConfig(body);
    const vendorCategory = sanitizeText(body.vendorCategory, 80) || 'Event Vendor';
    const roleDescription = sanitizeText(body.roleDescription, 180);
    const result = await generateVendorVettingServer(
      config,
      vendorCategory,
      roleDescription
    );
    res.json(result);
  });

  app.post('/api/ai/copilot', async (req: Request, res: Response): Promise<void> => {
    const body = (req.body ?? {}) as {
      message?: string;
      eventState?: EventPlanState;
    };
    const message = sanitizeText(body.message, 500) || 'Summarize my event priorities.';
    const safeConfig = parseRequestConfig({
      config: body.eventState?.config,
    });
    const fallbackState: EventPlanState = body.eventState ?? {
      config: safeConfig,
      concepts: [],
      selectedConceptId: null,
      budgetCategories: [],
      countdownTasks: [],
      itinerary: [],
      vendors: [],
      chatHistory: [],
      lastUpdated: new Date().toISOString(),
    };
    const result = await generateCoPilotServer(message, fallbackState);
    res.json(result);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response): void => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0');
}

void startServer();
