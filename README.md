# 🔧 CampusFix AI

### Report Less. Resolve Smarter.

A smart campus maintenance platform that helps students report problems, identifies duplicate complaints, measures the impact of campus issues, and helps college staff prioritize repairs.

> **Our story:** We built a system that turns individual student complaints into a clearer, community-supported picture of campus problems. It helps maintenance teams decide what needs attention and track whether it was fixed.

---

## 📌 Table of Contents
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Campus Impact Score](#-campus-impact-score)
- [Where Is the "AI"?](#-where-is-the-ai)
- [Tech Stack](#-tech-stack)
- [Getting Started (Localhost)](#-getting-started-localhost)
- [Deploying Online (Vercel + Neon)](#-deploying-online-vercel--neon)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Demo Script for Judges](#-demo-script-for-judges)
- [Troubleshooting](#-troubleshooting)
- [Limitations & Future Work](#-limitations--future-work)

---

## ❗ The Problem

In a college with thousands of students and many buildings, problems happen every day:

- A classroom fan or projector stops working
- Wi-Fi goes down in the library
- Water leaks in a washroom
- Corridor lights stop working

These are usually reported verbally or on WhatsApp. That causes several problems:
- **Reports get lost** in group chats
- **Duplicates pile up**: ten students report the same broken fan
- **No visibility**: students never learn if anything was done
- **No prioritization**: staff can't tell which issue affects 3 people and which affects 300

**The core problem isn't just that things break. Reporting, prioritizing, tracking and verifying repairs are all hard.**

---

## 💡 Our Solution

CampusFix AI is **one central platform** for students and maintenance staff:

| User | What they get |
|---|---|
| 🎓 **Students** | Easy reporting, ticket tracking, and the ability to support shared issues |
| 🛠️ **Maintenance staff** | A centralized, prioritized issue list with status controls |
| 🏫 **College administration** | Hotspot reports on recurring problems and problem areas |
| 🌐 **Campus community** | A transparent way to see maintenance progress |

---

## ⭐ Key Features

### 1. One Problem, One Ticket
While a student types a report, the system compares it in real time against all open tickets, using **location, description keywords and category**. If it finds a match, it shows the existing ticket with a match percentage and the reasons, for example *"Same location (C-204) · Same category · 4 matching keywords"*. The student can then tap **"I'm affected too"** instead of creating a duplicate.

### 2. Campus Impact Score (0–100)
Every ticket gets a transparent score built from four factors. The UI shows **exactly why** a ticket scored high or low. An exposed wire outranks a broken chair even with only one reporter.

### 3. Campus Problem Hotspots
The staff dashboard summarizes tickets by **building** and **category** (charts) and highlights **locations with repeated issues**. Recurring problems can then be investigated instead of treated as isolated incidents.

### 4. Verify Before Closing
When staff mark a ticket **Resolved**, students can either **confirm the fix** or report **"Still broken"**. A "still broken" vote **automatically reopens** the ticket and sends it back to the maintenance queue.

### Plus
- 🕶️ Anonymous reporting option
- ✨ Live smart-triage panel that suggests category and severity as you type
- 📋 Live ticket board with search, filters (status, building, category) and sorting (impact, affected count, newest)
- 🧑‍🔧 Staff controls: change status, add repair notes, override severity (the human always decides)
- 📈 KPIs: open tickets, duplicates avoided, students engaged, average resolution time
- 📱 Fully responsive design

---

## 🔄 How It Works

| Step | What happens |
|---|---|
| **1. Report** | Student enters title, description, building, room and category (optionally anonymous) |
| **2. Detect duplicates** | System checks unresolved tickets and suggests a matching one |
| **3. Community impact** | Affected students click **"I'm affected too"**; support is counted on one ticket |
| **4. Prioritize** | The Campus Impact Score ranks the ticket using safety, reach, recurrence and age |
| **5. Resolve** | Staff move the ticket: **Reported → In Progress → Resolved**, with repair notes |
| **6. Verify** | Students confirm the repair, or flag it as still broken (which reopens it) |

---

## 📊 Campus Impact Score

```
Impact Score = S + A + R + T     (max 100)
```

| Factor | Meaning | Rule | Max |
|---|---|---|---|
| **S**: Safety & severity | How dangerous or disruptive the issue is | critical = 40, high = 30, moderate = 16, low = 8 | **40** |
| **A**: Affected students | Reporter + everyone who clicked "I'm affected too" | 3 points per student | **30** |
| **R**: Recurrence | Earlier tickets at the same location in the same category | 5 points per earlier ticket | **15** |
| **T**: Time unresolved | How long the ticket has been open | 2 points per day (0 once resolved) | **15** |

**Priority bands:** 75–100 = **Critical** · 50–74 = **High** · 25–49 = **Medium** · 0–24 = **Low**

**Design principle:** community support is *not* the only way an issue becomes urgent. A safety hazard such as exposed wiring gets a strong score from **S** alone, even with a single reporter.

> ⚠️ These weights are **design choices for the prototype**, not scientifically validated measurements. They should be tested and tuned with real campus data.

---

## 🤖 Where Is the "AI"?

**This prototype uses a rule-based smart triage system. It is *not* a connected AI or language model.** It works like this:

- **Category & severity suggestion:** keyword rules. Words like *"spark"*, *"exposed wire"* or *"electric shock"* trigger **Electrical Safety (critical)**; *"leaking"* or *"pipe"* suggest **Plumbing (high)**; *"wifi"* or *"router"* suggest **Network**, and so on.
- **Duplicate detection:** keyword-overlap similarity (Jaccard) combined with bonuses for the same room, building and category.
- **Impact score:** the documented S + A + R + T formula above.

All suggestions are shown with their reasons, and **staff can override severity and status at any time**.

**Possible future enhancement:** connect a real language model (for example an open-weight model) to classify and summarize complaints, with validated output and human review.

---

## 🧰 Tech Stack

| Part | Technology |
|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** + **TypeScript** |
| Styling | **Tailwind CSS 4** + **Lucide** icons |
| Database | **PostgreSQL** with **Drizzle ORM** |
| Charts | **Chart.js** + **react-chartjs-2** |
| Backend | Next.js API route handlers |

Unlike a localStorage-only demo, this uses a **real shared database**. A student on a phone and an admin on a laptop see the same data.

---

## 🚀 Getting Started (Localhost)

### Prerequisites
- **Node.js 20+**: https://nodejs.org
- **PostgreSQL**: a local install, Docker, or a free cloud database at https://neon.tech

### 1. Get the code
```bash
git clone https://github.com/YOUR-USERNAME/campusfix-ai.git
cd campusfix-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start a PostgreSQL database
**With Docker (easiest):**
```bash
docker run -d --name campusfix-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app_db postgres:16
```
**With a normal PostgreSQL install:** create a database named `app_db` (user `postgres`, password `postgres`).

### 4. Configure environment variables
```bash
cp .env.example .env          # Windows: copy .env.example .env
```
`.env` contains:
```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```
If your database uses a different URL or password, update it in **both** `.env` and `drizzle.config.json`.

### 5. Create the database tables
```bash
npx drizzle-kit push
```

### 6. Run the app
```bash
npm run dev
```
Open **http://localhost:3000** 🎉

### Available scripts
| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript type check |

---

## 🌐 Deploying Online (Vercel + Neon)

1. Push the project to GitHub.
2. Go to **vercel.com**, sign in with GitHub, choose **Add New → Project** and import the repository.
3. In the Vercel project, go to **Storage → Create Database → Neon (Postgres)** and **Connect** it. This sets `DATABASE_URL` automatically.
4. Create the tables. Either:
   - run `npx drizzle-kit push` locally with the Neon URL temporarily set in `drizzle.config.json` (change it back afterwards), **or**
   - paste the SQL below into Neon's **SQL Editor** and click **Run**.
5. Go to **Deployments → ⋯ → Redeploy**.

<details>
<summary><b>SQL to create the tables manually</b></summary>

```sql
CREATE TABLE tickets (
  id serial PRIMARY KEY, code text NOT NULL, title text NOT NULL, description text NOT NULL,
  building text NOT NULL, room text NOT NULL, category text NOT NULL,
  severity text NOT NULL DEFAULT 'moderate', status text NOT NULL DEFAULT 'reported',
  anonymous boolean NOT NULL DEFAULT false, reporter_name text, reporter_id text NOT NULL,
  triage_reason text, merged_into_id integer, resolution_note text, resolved_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE supports (
  id serial PRIMARY KEY, ticket_id integer NOT NULL, student_id text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE verifications (
  id serial PRIMARY KEY, ticket_id integer NOT NULL, student_id text NOT NULL,
  verdict text NOT NULL, note text, created_at timestamp NOT NULL DEFAULT now()
);
```
</details>

> 🔒 Never commit your real `.env` file. It is already listed in `.gitignore`.

---

## 📁 Project Structure

```
campusfix-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page (live highest-impact tickets)
│   │   ├── layout.tsx                # Root layout, navigation, footer
│   │   ├── globals.css               # Theme, colors, animations
│   │   ├── report/page.tsx           # Report form + live triage + duplicate check
│   │   ├── tickets/page.tsx          # Live ticket board (search, filter, sort)
│   │   ├── tickets/[id]/page.tsx     # Ticket detail, score breakdown, verify, staff controls
│   │   ├── dashboard/page.tsx        # Staff dashboard: KPIs, charts, hotspots, queue
│   │   └── api/
│   │       ├── health/route.ts       # Health check
│   │       ├── triage/route.ts       # Live category suggestion + duplicate detection
│   │       ├── stats/route.ts        # Dashboard statistics & hotspots
│   │       └── tickets/
│   │           ├── route.ts          # List / create tickets
│   │           └── [id]/
│   │               ├── route.ts      # Get / update a ticket (status, severity, notes)
│   │               ├── support/route.ts  # "I'm affected too" toggle
│   │               └── verify/route.ts   # Confirm fix / still broken
│   ├── components/
│   │   ├── Nav.tsx                   # Top navigation + Student/Staff switch
│   │   ├── TicketCard.tsx            # Ticket card with support button
│   │   ├── ui.tsx                    # Status/priority chips, score dial, breakdown
│   │   ├── HotspotCharts.tsx         # Chart.js building & category charts
│   │   └── Reveal.tsx                # Scroll-reveal animation
│   ├── db/
│   │   ├── schema.ts                 # Drizzle tables: tickets, supports, verifications
│   │   └── index.ts                  # Database connection
│   └── lib/
│       ├── triage.ts                 # Rule engine, duplicate detection, impact score
│       ├── server.ts                 # Adds counts & scores to tickets
│       ├── types.ts                  # Shared TypeScript types
│       └── useStudent.ts             # Browser student ID, role, time helpers
├── drizzle.config.json
├── .env.example
├── package.json
└── README.md
```

### Database tables
| Table | Purpose |
|---|---|
| `tickets` | Each reported issue: location, category, severity, status, repair note |
| `supports` | One row per student who clicked "I'm affected too" |
| `verifications` | Student verdicts on resolved tickets (`confirmed` / `still_broken`) |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check (`{ ok: true }`) |
| `GET` | `/api/tickets?viewer=ID` | List all tickets with scores and counts |
| `POST` | `/api/tickets` | Create a ticket |
| `GET` | `/api/tickets/:id?viewer=ID` | Get one ticket |
| `PATCH` | `/api/tickets/:id` | Update `status`, `severity` or `resolutionNote` (staff) |
| `POST` | `/api/tickets/:id/support` | Toggle "I'm affected too" (`{ studentId }`) |
| `POST` | `/api/tickets/:id/verify` | Verify a repair (`{ studentId, verdict: "confirmed" \| "still_broken" }`) |
| `POST` | `/api/triage` | Preview category/severity + duplicate suggestions |
| `GET` | `/api/stats` | Dashboard KPIs, building/category breakdown, hotspots |

---

## 🎤 Demo Script for Judges

1. **Start with the problem:** students report the same issue many times and never know its status.
2. **Create a ticket:** report *"Ceiling fan not working"* in **Block B, Room C-204**.
3. **Show duplicate detection:** open a new report, type the same issue again, and the existing ticket is suggested with a match %.
4. **Show community support:** click **"I'm affected too"** and watch the affected count and impact score rise.
5. **Show prioritization:** open the ticket and explain the S + A + R + T breakdown. Try *"sparking wire"* to show a safety issue scoring high immediately.
6. **Switch to Staff mode** (top bar): move the ticket to **In Progress**, then **Resolved**, with a repair note.
7. **Verify:** as a student, click **"Yes, it's fixed"**, or **"Still broken"** to show it reopening.
8. **Finish with the dashboard:** show the hotspots, charts and KPIs.

> 💡 The browser keeps a random student ID. To act as a *different* student (for example, to support your own report), open the app in a **private/incognito window** or another browser.

### 60-second pitch
> Our project is **CampusFix AI**, a smart campus maintenance platform that makes problem reporting organized and transparent. Today, complaints about broken fans, projectors, leaks or Wi-Fi go through informal channels, get duplicated, and students never know if they were fixed. CampusFix AI brings reporting and tracking into one platform. It identifies potential duplicates, lets affected students support an existing report, and shows an explainable impact score to help staff prioritize. The dashboard highlights recurring problem areas, and resolution verification lets students confirm a fix actually worked. **CampusFix AI: Report less. Resolve smarter.**

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| `'npm' is not recognized` | Install Node.js and reopen the terminal |
| `DATABASE_URL is required` | Create `.env` from `.env.example` |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL isn't running. Start Docker or the PostgreSQL service |
| `password authentication failed` | Update the password in `.env` and `drizzle.config.json` |
| `relation "tickets" does not exist` | Run `npx drizzle-kit push` |
| Port 3000 is already in use | Run `npm run dev -- -p 3001` |
| Ticket board is empty | Expected on a new database. Report a few issues first |

---

## 🚧 Limitations & Future Work

**What works now:** reporting, tracking, duplicate suggestions, community support, explainable scoring, staff status updates, verification with auto-reopen, and the hotspot dashboard.

**Current limitations (prototype):**
- No real authentication. The Student/Staff switch is a **demo toggle**, and students are identified by a random ID stored in the browser.
- Triage is rule-based, not a language model.
- Score weights are untested design choices.
- No photo uploads yet.

**Needed for real deployment:**
- 🔐 Authentication and role-based access (college login / SSO)
- 🛡️ Protection against spam, misleading reports and unauthorized admin access
- 🔏 Privacy safeguards for student information
- 📷 Before/after photo uploads
- 🔔 Notifications when a ticket's status changes
- 🤖 Optional real language model for classification and summaries, with human review
- 🏢 Expansion to hostels, schools, offices and other shared facilities

> **Note:** claims like *"reduces maintenance time"* describe the **intended benefit**. They should only be stated as results after measuring with real usage data.

---

## 📄 License

Built for a hackathon. Free to use and adapt for educational purposes.

<p align="center"><b>CampusFix AI: Report less. Resolve smarter. 🔧</b></p>
