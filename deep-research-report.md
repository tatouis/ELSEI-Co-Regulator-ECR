# ELSEI Co-Regulator (ECR) — Extended Project Documentation and Moodle-Ready Data Strategy

## Product vision and research framing

The current prototype at the provided URL already communicates the intended positioning clearly: **ELSEI Co-Regulator (ECR)** is meant to be a *human-centered AI* that monitors learning behavior and delivers **lightweight metacognitive support** “without generating content” and “without being intrusive,” with explicit guardrails like “Max 1 intervention per 5 min,” “Never during quizzes,” “Always dismissible,” and “Transparent AI.” citeturn1view0  
The Student view also already contains the backbone of the target experience: consent-first onboarding, a live “Learning State” widget (Cognitive Load / Attention / Motivation + confidence), a weekly summary, a “What the system sees” transparency panel listing behavioral signals, and demo simulation controls (profiles + scenarios). citeturn2view0  
Likewise, the Instructor view already sketches the analytics story: class-level load/attention/motivation distributions, hotspots, and a privacy-aware drill-down table. citeturn2view1  

What’s missing (and what your professor is effectively asking for) is **research-grade operationalization**: real(istic) module structure, an initial roster, authentication + roles, persistent event/state/intervention logging, and a Moodle-ready ingestion pathway **that does not break the app** even if Moodle data is not yet connected. The two documents you uploaded provide exactly the starting anchors for this: a module catalogue (“Modules ELSEI”) fileciteturn0file1 and a learner roster (“Etudiants”) fileciteturn0file0.

From a PhD validation perspective, the strongest upgrade to your concept is to treat ECR as a **policy-driven co-regulator** with a strict separation of concerns:

- **Data layer**: collects only minimal behavioral signals and stores them with consent.  
- **State inference layer**: transforms signals → (CL, ATT, MOT, confidence).  
- **Policy engine**: decides *whether* to intervene and *which type*, enforcing safety rules.  
- **LLM layer (Gemini)**: generates the *wording* of the intervention only after the policy engine has decided the intervention type, using structured output and safety settings. citeturn0search3turn4search0turn4search6  

This keeps the LLM from “running the system,” and makes the project far more defensible in a research paper (replicable rules + interpretable features + controlled language generation). citeturn1view0turn2view0  

## Users, journeys, and UX operating principles

The Student journey that your current UI begins to implement is aligned with privacy-by-design principles: the learner sees what is collected, can opt out, and is never forced into interventions. citeturn2view0turn1view0  
To make this **production-ready** and “international showcase” credible, the journey should explicitly encode three governance moments that are also consistent with modern consent expectations:

- **Consent must be informed, specific, and easy to withdraw**: GDPR consent guidance emphasizes that withdrawal must be as easy as giving consent, and users must be informed about that right. citeturn5search1turn5search5turn5search0  
- **Data minimization is an explicit requirement**: GDPR principles include processing “lawfully, fairly and transparently” and limiting data to what is necessary for the purpose (data minimization). citeturn5search0  
- **Human-centered, oversight-first AI**: UNESCO and OECD guidance emphasize transparency, human oversight, and human-centered values in AI systems, which is extremely relevant for an educational setting. citeturn5search2turn5search3turn5search7  

Operationally, this means ECR should have two UX modes that you can switch per deployment:

- **Research / internal pilot mode**: identifiable names may appear for instructors and for authenticated students (when ethically approved).  
- **Public demo / showcase mode**: students are pseudonymized (Learner A/B/…) while the full system remains functional, which reduces privacy risk and makes screenshots safe for publications. citeturn1view0turn2view1turn5search0  

This dual-mode approach helps you satisfy “realistic data” requirements without turning a demo into an unintentional disclosure event.

## Data foundations: roster, module catalogue, and event schema

### What you already have in inputs

Your uploaded module list contains **18 modules** with codes (M111…M236), including (examples): *Sciences Cognitives (M111)*, *Programmation en Python (M112)*, *Fondements d’apprentissage automatique (M125)*, *Systèmes intelligents en éducation (M231)*, *Ingénierie UI/UX (M235)*, and *Conduire un projet de recherche (M236)*. fileciteturn0file1  
Your uploaded learner roster currently contains **6 students** (with additional identifiers like CNE/CIN and birth dates in the file). fileciteturn0file0  

Because your professor’s note mentioned “7 students,” the cleanest way to proceed **without blocking development** is:

- Import the **6 provided learners** as real test accounts (internal only). fileciteturn0file0  
- Add **1 clearly synthetic “demo learner”** in seeds to meet the “7 learners” demo narrative without fabricating personal identity data. This also supports your stated need for “fictitious but realistic” data for PhD validation.

### Data minimization recommendation for the roster

Even though the roster file includes national identifiers and birth dates, ECR does not need them for learning-state inference. For a privacy-first design, store only:

- internal user id (UUID)  
- Moodle user id (nullable until integration)  
- display name (or pseudonym)  
- role (student / instructor)  
- enrollment mapping to modules  

This aligns with data-minimization and privacy-by-design logic. citeturn5search0turn5search13  

### Event schema that keeps Moodle integration easy

Your current prototype already lists the right category of behavioral features (“time since last action,” “retry count,” “navigation speed,” “inactivity streak,” “error rate”). citeturn2view0  
To make Moodle integration later “drop-in,” define a **single internal event contract** that both sources can feed:

- **Simulation Adapter** emits events in this format today.  
- **Moodle Adapter** emits the same format later (from REST polling, log exports, or xAPI statements).

A practical internal event contract (minimal but research-useful):

- `timestamp` (UTC)  
- `actor_user_id` (ECR UUID)  
- `source` (`SIMULATION` | `MOODLE_REST` | `MOODLE_XAPI`)  
- `module_code` (e.g., “M112”)  
- `activity_type` (`reading` | `quiz` | `forum` | `assignment` | `video` | `other`)  
- `event_type` (`view` | `attempt` | `submit` | `navigate` | `idle_start` | `idle_end` | `error`)  
- `duration_sec` (optional)  
- `attempt_no` (optional)  
- `success` (optional boolean)  
- `metadata` (JSONB, bounded)

This structure is compatible with the way Moodle logs events internally (event-based logging architecture) and the way xAPI expresses learning experience statements (actor, verb, object) if you later choose that route. citeturn8search1turn3search7turn3search0  

### “Realistic but fictitious” data generation for the demo

To keep your PhD validation strong, generate synthetic event streams that look like real usage:

- daily peaks (evening sessions, pre-deadline spikes)  
- module-dependent load (e.g., Python + ML modules produce more retries)  
- learner profiles (focused vs overloaded vs disengaged) like you already expose in the demo controls. citeturn2view0  

Crucially: you should log **intervention exposure and reactions** (dismissed / accepted / ignored) because that becomes your measurable outcome for the paper alongside engagement signals.

## System architecture and implementation blueprint

Your current deployment is already structured as a student route (`/student`) and instructor route (`/instructor`) with a shared design language and a consent-first entry experience. citeturn2view0turn2view1  
To make the application genuinely “production-ready” (and still research-extensible), the architecture should become a **thin UI + explicit backend**:

- **Frontend (Next.js/React + TypeScript + Tailwind + Framer Motion)**  
  - purely presentation + state subscriptions  
  - calls ECR backend for auth, state, interventions, analytics  
  - supports “demo mode” when backend is unavailable  

- **Backend (NestJS recommended)**  
  - Auth & RBAC  
  - Events ingestion endpoint (`POST /events`)  
  - State inference scheduler (every 30–60 seconds per active session)  
  - Policy engine (enforces “max 1 per 5 minutes,” quiz rules, opt-out) citeturn1view0turn2view0  
  - Gemini intervention text service (LLM is *wording-only*, policy decides type) citeturn0search3turn4search0  
  - Instructor analytics / aggregates (privacy-aware) citeturn2view1  

- **Data (PostgreSQL)**  
  - `users`, `roles`, `modules`, `enrollments`  
  - `events` (append-only)  
  - `learner_state` (time series)  
  - `interventions` (audit trail + response)  
  - `consents` (versioned)  

This split is what enables Moodle integration later without rewriting the UI: Moodle becomes “just another event source” that writes to the same ingestion API.

A key design decision for PhD rigor: make the **state inference explainable by design**. Store, alongside each state vector, the feature values that produced it (bounded and privacy-minimized). This directly supports your existing “What the system sees” transparency panel. citeturn2view0turn1view0  

## Moodle integration blueprint

Moodle integration is easiest if you treat it as two independent problems:

- **Identity & structure sync** (users, courses/modules, enrollments, activities)  
- **Behavioral event ingestion** (logs/events that drive state detection)

### Moodle REST web services for identity & structure sync

Moodle’s official documentation describes how admins set up web services and that each user/service uses a unique security key (“token”). citeturn7search6turn7search3  
Moodle supports a REST protocol returning JSON (`moodlewsrestformat=json`) and provides client examples showing how the REST endpoint is typically called with `wstoken` and `wsfunction`. citeturn7search1turn7search8  

A Moodle-ready integration pathway for ECR:

1. **Enable web services + REST protocol** in Moodle admin settings (manage protocols). citeturn7search2turn7search6  
2. **Create a dedicated service user** (least privilege).  
3. **Create an External Service** and add only required functions (Moodle documentation notes there is live “API Documentation” inside Moodle admin menus, which you can use to confirm exact parameter shapes for your specific Moodle version). citeturn7search10turn7search13  
4. **Generate a token** for the service user and restrict by IP and expiry where possible; Moodle guidance emphasizes tokens are linked to users and discusses security constraints around token creation. citeturn0search0turn7search3  
5. **ECR runs a periodic sync job** (e.g., every 6 hours) to refresh:
   - users (only those enrolled in ELSEI courses)  
   - course/module list and contents  
   - enrollments (student↔module)  

A function you should rely on immediately when testing connectivity is the “site info” call (`core_webservice_get_site_info`)—it is commonly used as a ping-style check in Moodle REST clients. citeturn0search9turn7search1  
For course structure, Moodle’s web service function list explicitly includes `core_course_get_contents` (“get course content”). citeturn9search0turn0search1  

### Moodle behavioral event ingestion options

Here is the reality you need to design for: Moodle logs are event-based and can be stored in different log stores (Standard, External database log store, etc.). Moodle’s documentation describes this “Logging 2” event architecture and notes that events are sent to enabled log stores. citeturn8search1turn10search5  
Moodle also supports an **External database log store**, which writes logs to a separate database while keeping the same logging format as Standard log store. citeturn10search1turn10search0  

For ECR, there are two pragmatic ingestion strategies:

**Strategy A: REST-first, “good enough” telemetry (no plugins)**  
You can start by deriving learner activity from periodic REST calls that fetch completion/attempt summaries, enrolled-course lists, and course contents. This yields lower granularity than raw logs, but it is often enough to compute time-on-task approximations and detect inactivity trends. (If you need missing signals, Moodle’s own FAQ recommends implementing new web service functions via a Moodle local plugin—this is the clean “extend Moodle” path.) citeturn7search9turn7search10  

**Strategy B: xAPI for richer and more standard event streams (plugin-based)**  
Moodle has an xAPI subsystem (developer documentation exists) and there is a widely referenced “Logstore xAPI” plugin that converts standard logstore activities into xAPI format and sends them to a Learning Record Store (LRS). citeturn3search7turn3search0turn10search12  
However, Moodle support documentation explicitly warns that these logs can be site-wide and produce a large number of records in an LRS, recommending caution and noting that activity-limiting settings exist. citeturn10search12turn3search4  

The best Moodle-ready design for your PhD (balanced effort vs value):

- **Phase 1 (now):** keep your current simulation stream and seed students + modules locally; all inference + dashboards become fully functional with realistic synthetic events. citeturn2view0turn2view1turn0file0turn0file1  
- **Phase 2 (later):** add Moodle REST sync for users/modules/enrollment, without changing UI logic (just swapping data source). citeturn7search6turn7search1turn7search10  
- **Phase 3 (optional, strong research upgrade):** add xAPI emission (logstore_xapi) or external log-store piping for higher-fidelity event traces and better temporal accuracy. citeturn3search0turn10search1turn8search1  

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["Moodle web services REST token architecture diagram","Moodle logstore xAPI to LRS architecture diagram","xAPI learning record store LMS diagram"],"num_per_query":1}

## AI co-regulation logic and Gemini prompt package

### State detection that is explainable and defensible

Your UI already communicates which behavioral signals are used (time since last action, retries, nav speed, inactivity streak, error rate) and displays a confidence score. citeturn2view0  
To make this “research-extensible,” implement inference in two layers:

1. **Feature computation (real-time)**  
   - rolling windows (e.g., last 60s, last 5m)  
   - robust against missing data (simulation pause, offline)  
2. **State classifier (rule-based v1)**  
   - deterministic thresholds  
   - outputs: `CL`, `ATT`, `MOT` ∈ {low, medium, high} + `confidence` ∈ [0,1]

A defensible rule-based seed example (you can refine from collected data later):

- Cognitive Load ↑ when: retries high, error rate high, navigation slows *and* time-on-task increases  
- Attention ↓ when: inactivity streak grows, time since last action grows, rapid chaotic navigation spikes  
- Motivation ↓ when: repeated failures + prolonged inactivity + short sessions + low return frequency  

Because the system must never “interrupt quizzes,” the inference loop should mark when a quiz attempt is active and postpone interventions accordingly (policy layer, below). citeturn1view0turn2view0  

### Policy engine as the safety-critical decision maker

Your own prototype text already encodes the safety rules (frequency limiter, no quiz interruption, dismissible, optional). citeturn1view0turn2view0  
Implement these as non-negotiable constraints:

- Hard rate limit: at most 1 intervention / 5 minutes / student  
- Context lock: never show during quiz attempt windows  
- User autonomy: dismissible + opt-out toggle (store preference)  
- “Why this?” explanation required for each intervention shown citeturn1view0turn2view0  

### Gemini as “wording generator,” not a decision-maker

The Gemini API supports structured outputs using JSON Schema so you can force predictable, type-safe responses (ideal for intervention payloads). citeturn0search3turn4news40  
Gemini also provides configurable safety settings that you can adjust and document during prototyping, plus official guidance about prompting strategies and system instructions. citeturn4search0turn4search6turn4search3  
On the API surface, Gemini exposes standard content generation endpoints (including `generateContent` and streaming variants), which fits the “lightweight UI assistant” interaction model. citeturn4search1turn4search5  

Below is a **production-grade prompt package** (designed for your use case constraints). It emphasizes: no learning content, short output, and a strict schema.

```text
SYSTEM INSTRUCTION (Gemini)
You are ECR, an AI pedagogical co-regulator for higher education.
You MUST NOT generate learning content, explanations, or answers to course material.
Your only job is to phrase short, supportive, metacognitive micro-interventions.

Rules:
- You only phrase the message for an intervention type already decided by the policy engine.
- Keep it non-intrusive: max 2 short sentences.
- Always respectful, autonomy-supportive, never judgmental.
- Always include a brief "why" explanation referencing only behavioral signals (not personal traits).
- Never mention sensitive data or speculation.
- If context indicates a quiz is active, respond with a NO_OP payload.

Output must follow the provided JSON Schema exactly.
Language: English.
```

```json
JSON SCHEMA (structured output)
{
  "type": "object",
  "properties": {
    "action": { "type": "string", "enum": ["SHOW_INTERVENTION", "NO_OP"] },
    "interventionType": {
      "type": "string",
      "enum": ["pacing_suggestion", "reflective_prompt", "task_reframing", "encouragement", "help_routing", "none"]
    },
    "message": { "type": "string" },
    "whyThis": { "type": "string" },
    "suggestedNextStep": {
      "type": "string",
      "enum": ["dismiss", "snooze_5m", "open_forum", "contact_teacher", "take_break_2m", "review_goals", "none"]
    }
  },
  "required": ["action", "interventionType", "message", "whyThis", "suggestedNextStep"],
  "additionalProperties": false
}
```

```text
DEVELOPER PROMPT (filled by your backend per request)
Policy decision:
- interventionType = {INTERVENTION_TYPE}
- quizActive = {true|false}
- studentOptedOut = {true|false}
- cooldownRemainingSec = {number}

Context:
- moduleCode = {e.g., M112}
- moduleTitle = {string}
- activityType = {reading|quiz|forum|assignment|other}
- last60s: timeSinceLastActionSec={n}, inactivityStreakSec={n}, navSpeedPgPerMin={n}, retries={n}, errorRatePct={n}
- currentState: CL={low|medium|high}, ATT={low|medium|high}, MOT={low|medium|high}, confidence={0..1}

Task:
If quizActive OR studentOptedOut OR cooldownRemainingSec>0:
Return action=NO_OP with interventionType=none and empty message, whyThis="".
Else:
Return action=SHOW_INTERVENTION, use the interventionType exactly as provided.
Keep message ≤ 240 characters.
whyThis must reference 1–2 signals (e.g. inactivity, retries, error rate) in plain language.
```

This structure is intentionally “policy first, wording second,” and it’s exactly why structured outputs are valuable here (you can validate and reject malformed responses before the UI sees them). citeturn0search3turn4search0turn4search6  

## Security, privacy, and governance

### Authentication and roles

You need at least two roles: **student** and **instructor**, matching the two major UI routes you already expose. citeturn2view0turn2view1  
For a research pilot, implement standard username/password auth with:

- bcrypt password hashing  
- short-lived access tokens + refresh tokens  
- role-based access control (RBAC) checks on every endpoint  
- audit logging for instructor drill-down views

For Moodle-readiness, plan a future switch to **LTI-based single sign-on** so Moodle can launch ECR without users re-entering passwords; Moodle documentation explains that LTI external tools let students access tools without leaving Moodle or logging in separately. citeturn6search1  

### Consent, opt-out, and transparency requirements

Your UI already contains the essential elements (consent screen, transparency panel, opt-out toggles, “Why am I seeing this?”). citeturn2view0turn1view0  
To align with well-known governance expectations:

- Keep consent versioned and record time + policy version. citeturn5search1turn5search0  
- Include a one-click opt-out and ensure withdrawal is as easy as consent. citeturn5search5turn5search1  
- Apply data minimization and do not store identifiers not required for your purpose (e.g., CIN, birth date) in ECR’s operational database. citeturn5search0turn5search13  
- Document human oversight and transparency as first-class requirements (UNESCO/OECD framing helps in academic review). citeturn5search2turn5search7turn5search3  

### Demo credentials for development and Horizon-style demonstrations

Below is a **safe demo credential set** that keeps the app functional today (even with simulated events), while remaining compatible with later Moodle mapping (you can add a `moodle_user_id` column later without breaking auth). The learner roster is grounded in the uploaded student list, but **no national identifiers or birth dates are used** here. fileciteturn0file0  

**Students (demo):**

| Display name | Username | Password |
|---|---|---|
| Mohamed Ajaha | learner01 | gED-$b4Y4N$3nE |
| Nada Mazar | learner02 | Mb*e7L52TBT#!U |
| Assaouir Moussi | learner03 | 2B!Lzevm8H-F27 |
| Zainab Bouzidi | learner04 | aMNt#ilU7K@8k@ |
| Hanaa Faris | learner05 | GZqiWU-r5pp6Lg |
| Samia Ezouili | learner06 | k4-PNMyVkE5m4q |
| Demo Learner (synthetic) | learner07 | Sz2&S4NSoQd$jN |

**Instructor (demo):**

| Display name | Username | Password |
|---|---|---|
| ELSEI Instructor | instructor01 | 3@6A9#ExMvsO4G |

Security note (critical for your README): in any real deployment, force “change password at first login,” never commit seed credentials to git, and store all secrets in environment variables.

### Module catalogue injection (what to seed now)

Seed the following modules as your authoritative “ELSEI master catalogue” in ECR v1 (later you can map them to Moodle course IDs or shortnames). fileciteturn0file1  

- M111 — Sciences Cognitives  
- M112 — PROGRAMMATION EN PYTHON : FONDAMENTAUX ET APPLICATIONS  
- M113 — Technologies émergentes en éducation  
- M114 — Concepts et enjeux en enseignement/apprentissage  
- M115 — Techniques de communication et Développement personnel  
- M116 — Anglais  
- M121 — Ingénierie pédagogique d’elearning  
- M122 — Approches pédagogiques  
- M123 — Scénarisation pédagogique d’une formation en ligne  
- M124 — Méthodologie de Recherche et Statistique  
- M125 — Fondements d'apprentissage automatique  
- M126 — Etude de systèmes de gestion de l’apprentissage  
- M231 — Systèmes intelligents en éducation  
- M232 — Management de Projets de Formation  
- M233 — Conception de dispositifs de formation elearning  
- M234 — Design des ressources numériques éducatives  
- M235 — INGENIERIE UI/UX  
- M236 — Conduire un projet de recherche fileciteturn0file1  

This seeded module list lets your UI show “real master modules” immediately, while the Moodle connector later becomes a sync mechanism (linking Moodle course IDs to these module codes, rather than redefining your domain model).

Finally, your Moodle connector documentation should explicitly include the “admin steps” and technical calling conventions (REST, token, `moodlewsrestformat=json`), because those are the most common integration pitfalls in real deployments. citeturn7search6turn7search1turn0search0turn7search3turn7search10

## Instructor API Configuration Dashboard (UI/UX Requirement)

To make the transition from the simulated environment to the real Moodle connection (Phase 1 to Phase 2) seamless for the administrator/instructor, the platform must include a dedicated **API Configuration Dashboard** within the Instructor view.

### Requirements for the Configuration Interface:

1. **Moodle API Configuration**:
   - Provide input fields for the **Moodle Platform URL** and the **Moodle REST API Token**.
   - **Fallback/Simulation Mode behavior**: If no Moodle API is configured (inputs are empty), the application defaults to using the local, simulated data (the seeded student roster and module catalog).
   - **Live/Connected Mode behavior**: Upon successful entry and validation of the Moodle API token, the system transitions automatically to pull live course modules, enrollments, and learner data from Moodle via the REST API endpoints.

2. **Gemini & Third-Party APIs Integration**:
   - Provide an input field for the **Gemini API Key** (and any future LLM or external service keys).
   - This empowers instructors to self-serve their AI credentials directly from the user interface instead of depending on environment variables at deployment time. 
   - Ensure these keys are stored securely in the database (or secure vaulted storage) and retrieved by the backend before making requests to external APIs.

By incorporating this configuration page directly into the instructor dashboard, you maintain the "plug-and-play" spirit of your prototype while meeting strict research tool criteria mapping to both isolated pilot tests and real-world institution integrations.