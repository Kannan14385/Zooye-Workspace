import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import sqlite3 from 'sqlite3';
import { mkdirSync } from 'fs';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'https://kannan14385.github.io';
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'notion.sqlite');

mkdirSync(DB_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`SQLite database ready at ${DB_PATH}`);
  }
});

function runStatement(sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onDone(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function getRow<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve((row as T | null) ?? null);
    });
  });
}

function getRows<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve((rows as T[]) ?? []);
    });
  });
}

async function initializeDatabase() {
  await runStatement(`
    CREATE TABLE IF NOT EXISTS workspace_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}

async function saveWorkspaceState(key: string, value: unknown) {
  await runStatement(
    `INSERT INTO workspace_state (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, JSON.stringify(value), new Date().toISOString()]
  );
}

async function loadWorkspaceState<T>(key: string): Promise<T | null> {
  const row = await getRow<{ value: string }>(`SELECT value FROM workspace_state WHERE key = ?`, [key]);
  if (!row) {
    return null;
  }

  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

async function loadAllWorkspaceState(): Promise<Record<string, unknown>> {
  const rows = await getRows<{ key: string; value: string }>(`SELECT key, value FROM workspace_state`);
  const result: Record<string, unknown> = {};

  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }

  return result;
}

async function bootstrapDatabase() {
  await initializeDatabase();
}

bootstrapDatabase().catch((error) => {
  console.error('Database bootstrap failed:', error);
});

// =========================================================================
// SMTP TRANSPORTER – Gmail App Password
// =========================================================================
let smtpTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('[SMTP] SMTP_USER or SMTP_PASS not set – emails will be simulated only.');
    return null;
  }

  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false', // true for port 465
    auth: { user, pass },
  });

  // Verify connection asynchronously so startup is not blocked
  smtpTransporter.verify().then(() => {
    console.log(`[SMTP] Transporter ready – connected as ${user}`);
  }).catch((err: Error) => {
    console.error('[SMTP] Transporter verify failed:', err.message);
    smtpTransporter = null; // reset so next request retries
  });

  return smtpTransporter;
}

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

app.get('/api/workspace', async (req, res) => {
  try {
    const state = await loadAllWorkspaceState();
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load workspace state' });
  }
});

app.get('/api/workspace/:key', async (req, res) => {
  try {
    const value = await loadWorkspaceState(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to load workspace item' });
  }
});

app.post('/api/workspace/:key', async (req, res) => {
  try {
    const { value } = req.body ?? {};
    if (value === undefined) {
      res.status(400).json({ error: 'A value is required.' });
      return;
    }

    await saveWorkspaceState(req.params.key, value);
    res.json({ key: req.params.key, saved: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to save workspace item' });
  }
});

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// =========================================================================
// 1. GEMINI CHATBOT ASSISTANT API
// =========================================================================
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      userContext = {},
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    const {
      userName = 'Team Member',
      userRole = 'employee',
      userEmail = '',
      assignedTasks = [],
      unreadNotifications = [],
      upcomingDeadlines = [],
      currentPageTitle = 'Notion Workspace',
    } = userContext;

    // Build comprehensive system prompt
    const systemPrompt = `You are Thozha, the Notion Enterprise Workspace AI Copilot & Personal Companion.
Your name "Thozha" means trusted companion and friend. Your primary mission is to:
1. Help the user interact with and edit their Notion workspace documents, kanban boards, and database tables.
2. Intimate upcoming deadlines clearly and warn the user of urgent or overdue work.
3. Notify the user of tasks assigned by their superiors (CEO Elena Vance, HR Manager David Kim).
4. Respect role boundaries: Elena Vance (CEO/Admin), David Kim (HR Manager), Alex Morgan/Sarah Chen (Employees).
5. Provide actionable suggestions, drafting help (bullet points, checklists, meeting notes), and deadline summaries.
6. When greeting or speaking, you can introduce yourself warmly as Thozha.

Current User Profile:
- Name: ${userName}
- Role: ${userRole.toUpperCase()}
- Email: ${userEmail}
- Active Notion Page: "${currentPageTitle}"

Current Assigned Tasks for ${userName}:
${
  assignedTasks.length > 0
    ? assignedTasks
        .map(
          (t: any, i: number) =>
            `${i + 1}. [${t.priority || 'Normal'}] "${t.title}" — Status: ${t.status} — Due: ${
              t.dueDate || 'Unspecified'
            }`
        )
        .join('\n')
    : 'No tasks currently assigned.'
}

Upcoming Deadlines & Alerts:
${
  upcomingDeadlines.length > 0
    ? upcomingDeadlines.map((d: any) => `- ${d}`).join('\n')
    : 'All deadlines are on track.'
}

Recent Inbox & Superior Notifications:
${
  unreadNotifications.length > 0
    ? unreadNotifications
        .slice(0, 5)
        .map((n: any) => `- [${n.type}] from ${n.senderName}: "${n.title}" (${n.message})`)
        .join('\n')
    : 'Inbox is up to date.'
}

Tone & Style:
- Professional, proactive, crisp, and motivating.
- Highlight urgent deadlines with clear time frames and actionable steps.
- If asked to write or outline Notion content, use clean markdown with headers, bullet points, and checkable lists.`;

    const ai = getGemini();

    if (ai) {
      try {
        // Format history for @google/genai
        const formattedContents = history
          .filter((h: any) => h.sender === 'user' || h.sender === 'assistant')
          .slice(-10)
          .map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          }));

        formattedContents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: formattedContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const replyText = response.text || 'I am ready to assist with your Notion workspace.';
        res.json({
          reply: replyText,
          model: 'gemini-3.5-flash',
          status: 'success',
        });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using intelligent context fallback:', geminiError?.message);
      }
    }

    // Intelligent context-aware fallback (if API key missing or rate-limited)
    const lower = message.toLowerCase();
    let fallbackReply = '';

    if (lower.includes('deadline') || lower.includes('due') || lower.includes('time')) {
      if (assignedTasks.length > 0) {
        const taskList = assignedTasks
          .map((t: any) => `• **${t.title}** (${t.priority} priority) — Due: **${t.dueDate || 'Sprint end'}** [${t.status}]`)
          .join('\n');
        fallbackReply = `⏰ **Upcoming Deadlines & Work Schedule for ${userName}:**\n\n${taskList}\n\n*Intimation:* Please ensure all deliverables are updated in the Sprint Kanban board before their respective review windows.`;
      } else {
        fallbackReply = `⏰ You currently have no outstanding deadlines assigned to your queue. All sprint deliverables are clear!`;
      }
    } else if (lower.includes('assigned') || lower.includes('work') || lower.includes('task') || lower.includes('superior')) {
      if (assignedTasks.length > 0) {
        const items = assignedTasks
          .map(
            (t: any, idx: number) =>
              `${idx + 1}. **${t.title}**\n   - Priority: \`${t.priority}\`\n   - Current Stage: *${t.status}*\n   - Target: ${t.dueDate || 'Sprint cadence'}`
          )
          .join('\n\n');
        fallbackReply = `📋 **Tasks Assigned to You by Superiors:**\n\n${items}\n\n💡 *Tip:* You can click on any card in the **Sprint Kanban Board** or visit your **My Dashboard** to update your status.`;
      } else {
        fallbackReply = `📋 You currently have no pending tasks assigned by superiors in your personal queue.`;
      }
    } else if (lower.includes('inbox') || lower.includes('notification') || lower.includes('email') || lower.includes('message')) {
      if (unreadNotifications.length > 0) {
        const notifList = unreadNotifications
          .slice(0, 4)
          .map((n: any) => `• **${n.title}** (from ${n.senderName})\n  ${n.message}`)
          .join('\n');
        fallbackReply = `📥 **Your Recent Workspace & Email Notifications:**\n\n${notifList}\n\nCheck your **Inbox** in the sidebar for full email dispatches and delivery logs.`;
      } else {
        fallbackReply = `📥 Your Inbox is completely clear! All previous notifications and work assignment emails have been reviewed.`;
      }
    } else if (lower.includes('notion') || lower.includes('draft') || lower.includes('document') || lower.includes('help') || lower.includes('write')) {
      fallbackReply = `📝 **Notion Workspace Assistant:**\nI can help you build documents, structure sprint backlogs, format markdown tables, or prepare meeting minutes.\n\nSuggested structure for your active document:\n1. **Objective & Executive Summary**\n2. **Action Items & Assignees**\n3. **Milestone Schedule & Deadlines**\n\nLet me know what specific section you'd like me to draft for you!`;
    } else {
      fallbackReply = `Hello ${userName}! I am **Thozha**, your Notion AI workspace companion & personal assistant.\n\nI am continuously monitoring your:\n- ⏰ **Sprint Deadlines & Intimations**\n- 📋 **Work Assigned by Superiors (CEO Elena Vance & HR David Kim)**\n- 📧 **Real-Time Email Dispatches & Inbox Alerts**\n- 📝 **Notion Document Creation & Formatting**\n\nHow can I help you accelerate your work today?`;
    }

    res.json({
      reply: fallbackReply,
      model: 'fallback-workspace-copilot',
      status: 'success',
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// =========================================================================
// 2. REAL-TIME EMAIL DISPATCH & NOTIFICATION API
// =========================================================================
app.post('/api/email/notify', async (req, res) => {
  try {
    const {
      toEmail,
      toName,
      fromName,
      fromRole,
      taskTitle,
      priority,
      dueDate,
      subject,
      body,
    } = req.body;

    if (!toEmail || !subject) {
      res.status(400).json({ error: 'toEmail and subject are required.' });
      return;
    }

    const emailId = 'email-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const timestamp = new Date().toISOString();
    const fromAddress = process.env.SMTP_USER || 'no-reply@zooye.in';
    const fromLabel = process.env.SMTP_FROM_NAME || 'Zooye Workspace';

    // Build a clean HTML email body
    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr><td style="background:#1c1917;padding:24px 32px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#f59e0b;">Zooye Info Technologies</p>
          <h1 style="margin:6px 0 0;font-size:20px;font-weight:800;color:#ffffff;">WordPress Delivery Workspace</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Hi <strong>${toName}</strong>,</p>
          <div style="white-space:pre-wrap;font-size:14px;color:#1e293b;line-height:1.7;">${body}</div>
          ${taskTitle ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <tr><td style="padding:16px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Task Details</p>
              <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">📋 ${taskTitle}</p>
              ${priority ? `<p style="margin:4px 0 0;font-size:12px;color:#64748b;">Priority: <strong style="color:#dc2626;">${priority}</strong></p>` : ''}
              ${dueDate ? `<p style="margin:4px 0 0;font-size:12px;color:#64748b;">Due: <strong>${dueDate}</strong></p>` : ''}
            </td></tr>
          </table>` : ''}
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This email was sent by <strong>${fromName}</strong> (${fromRole}) from the Zooye Workspace platform.</p>
        </td></tr>
        <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;">
          <p style="margin:0;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} Zooye Info Technologies · WordPress Delivery Workspace · Protected internal access</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const transporter = getSmtpTransporter();
    let smtpMessageId: string | undefined;

    if (!transporter) {
      res.status(503).json({ error: 'SMTP is not configured. Set SMTP_USER and SMTP_PASS on the server.' });
      return;
    }

    try {
      const info = await transporter.sendMail({
        from: `"${fromLabel}" <${fromAddress}>`,
        to: `"${toName}" <${toEmail}>`,
        subject,
        text: body,
        html: htmlBody,
        replyTo: fromAddress,
        headers: {
          'X-Workspace-Email-Id': emailId,
          'X-Sent-From': fromName,
        },
      });
      smtpMessageId = info.messageId;
      console.log(`[SMTP] Email sent to ${toEmail} | Message-Id: ${smtpMessageId}`);
    } catch (smtpErr: any) {
      console.error(`[SMTP] Send failed: ${smtpErr.message}`);
      res.status(502).json({ error: smtpErr?.message || 'SMTP rejected the email.' });
      return;
    }

    res.json({
      success: true,
      messageId: smtpMessageId || emailId,
      timestamp,
      recipient: { email: toEmail, name: toName },
      sender: { name: fromName, role: fromRole },
      task: { title: taskTitle, priority, dueDate },
      deliveryStatus: 'delivered',
    });
  } catch (error: any) {
    console.error('[Email API] Unexpected error:', error);
    res.status(500).json({ error: error?.message || 'Failed to dispatch email' });
  }
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// =========================================================================
// 3. VITE MIDDLEWARE & STATIC SERVING
// =========================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Notion Workspace Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
