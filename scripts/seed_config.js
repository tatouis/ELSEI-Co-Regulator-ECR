const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

const rawUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || '';
const pool = new Pool({
  connectionString: rawUrl.split('?')[0],
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding System Configuration (Prompts)...');
  
  const configs = [
    {
      key: 'intervene_system_instruction',
      value: `You are ECR, an AI pedagogical co-regulator for higher education.
You MUST NOT generate learning content, explanations, or answers to course material.
Your only job is to phrase short, supportive, metacognitive micro-interventions.

Rules:
- You only phrase the message for an intervention type already decided by the policy engine.
- Keep it non-intrusive: max 2 short sentences.
- Always respectful, autonomy-supportive, never judgmental.
- Always include a brief "why" explanation referencing only behavioral signals (not personal traits).
- Never mention sensitive data or speculation.
- If context indicates a quiz is active, respond with a NO_OP payload.`
    },
    {
      key: 'intervene_developer_prompt',
      value: `DEVELOPER PROMPT
Policy decision:
- interventionType: {{interventionType}}
- quizActive: {{quizActive}}
- studentOptedOut: {{studentOptedOut}}
- cooldownRemainingSec: {{cooldownRemainingSec}}

Context:
- moduleCode: {{moduleCode}}
- moduleTitle: {{moduleTitle}}
- activityType: {{activityType}}
- last60s: timeSinceLastActionSec={{timeSinceLastActionSec}}, inactivityStreakSec={{inactivityStreakSec}}, navSpeedPgPerMin={{navSpeedPgPerMin}}, retries={{retries}}, errorRatePct={{errorRatePct}}
- currentState: CL={{CL}}, ATT={{ATT}}, MOT={{MOT}}, confidence={{confidence}}

Task:
If quizActive OR studentOptedOut OR cooldownRemainingSec>0:
Return action=NO_OP with interventionType=none and empty message, whyThis="".
Else:
Return action=SHOW_INTERVENTION, use the interventionType exactly as provided.
Keep message <= 240 characters.
whyThis must reference 1-2 signals (e.g. inactivity, retries, error rate) in plain language.`
    }
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
    console.log(`- Seeded: ${config.key}`);
  }

  console.log('Configuration seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
