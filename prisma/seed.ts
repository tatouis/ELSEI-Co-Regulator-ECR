import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database using SQLite...');

  // 1. Modules
  const modules = [
    { code: 'M111', title: 'Sciences Cognitives' },
    { code: 'M112', title: 'PROGRAMMATION EN PYTHON : FONDAMENTAUX ET APPLICATIONS' },
    { code: 'M113', title: 'Technologies émergentes en éducation' },
    { code: 'M114', title: 'Concepts et enjeux en enseignement/apprentissage' },
    { code: 'M115', title: 'Techniques de communication et Développement personnel' },
    { code: 'M116', title: 'Anglais' },
    { code: 'M121', title: 'Ingénierie pédagogique d’elearning' },
    { code: 'M122', title: 'Approches pédagogiques' },
    { code: 'M123', title: 'Scénarisation pédagogique d’une formation en ligne' },
    { code: 'M124', title: 'Méthodologie de Recherche et Statistique' },
    { code: 'M125', title: "Fondements d'apprentissage automatique" },
    { code: 'M126', title: 'Etude de systèmes de gestion de l’apprentissage' },
    { code: 'M231', title: 'Systèmes intelligents en éducation' },
    { code: 'M232', title: 'Management de Projets de Formation' },
    { code: 'M233', title: 'Conception de dispositifs de formation elearning' },
    { code: 'M234', title: 'Design des ressources numériques éducatives' },
    { code: 'M235', title: 'INGENIERIE UI/UX' },
    { code: 'M236', title: 'Conduire un projet de recherche' },
  ];

  for (const mod of modules) {
    await prisma.module.upsert({
      where: { code: mod.code },
      update: { title: mod.title },
      create: mod,
    });
  }

  // 2. Instructor
  const instructorPassword = await bcrypt.hash('3@6A9#ExMvsO4G', 10);
  const instructor = await prisma.user.upsert({
    where: { username: 'instructor01' },
    update: { passwordHash: instructorPassword },
    create: {
      displayName: 'ELSEI Instructor',
      username: 'instructor01',
      passwordHash: instructorPassword,
      role: Role.INSTRUCTOR,
    },
  });

  // 3. Students
  const students = [
    { displayName: 'Mohamed Ajaha', username: 'learner01', pass: 'gED-$b4Y4N$3nE' },
    { displayName: 'Nada Mazar', username: 'learner02', pass: 'Mb*e7L52TBT#!U' },
    { displayName: 'Assaouir Moussi', username: 'learner03', pass: '2B!Lzevm8H-F27' },
    { displayName: 'Zainab Bouzidi', username: 'learner04', pass: 'aMNt#ilU7K@8k@' },
    { displayName: 'Hanaa Faris', username: 'learner05', pass: 'GZqiWU-r5pp6Lg' },
    { displayName: 'Samia Ezouili', username: 'learner06', pass: 'k4-PNMyVkE5m4q' },
    { displayName: 'Demo Learner (synthetic)', username: 'learner07', pass: 'Sz2&S4NSoQd$jN' },
    // Dedicated Test Accounts
    { displayName: 'Tutor Prueba ECR', username: 'tutor_ecr', pass: 'ECRtest2026!', role: Role.INSTRUCTOR },
    { displayName: 'Student Prueba ECR', username: 'student_ecr', pass: 'ECRtest2026!', role: Role.STUDENT },
  ];

  const m112 = await prisma.module.findUnique({ where: { code: 'M112' } });

  for (const s of students) {
    const hashedPass = await bcrypt.hash(s.pass, 10);
    const user = await prisma.user.upsert({
      where: { username: s.username },
      update: { passwordHash: hashedPass },
      create: {
        displayName: s.displayName,
        username: s.username,
        passwordHash: hashedPass,
        role: s.role || Role.STUDENT,
      },
    });

    if (m112) {
      await prisma.enrollment.upsert({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId: m112.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          moduleId: m112.id,
        },
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
