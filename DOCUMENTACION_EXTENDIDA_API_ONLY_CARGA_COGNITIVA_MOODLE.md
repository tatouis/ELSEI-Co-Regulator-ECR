# Documentación extendida para Antigravity  
## Módulo API-only de Carga Cognitiva Estimada en Moodle

**Versión propuesta:** 1.0  
**Objetivo:** convertir la aplicación en un producto fácil de conectar a cualquier Moodle usando solo Moodle REST API, sin necesidad de acceso directo a base de datos.  
**Idioma UI:** Español  
**Modo principal:** API-only  
**Modo futuro opcional:** Hybrid/API + DB o API + plugin local Moodle

---

## 0. Resumen ejecutivo

Esta documentación define cómo debe funcionar el módulo de **Carga Cognitiva Estimada** usando únicamente la API estándar de Moodle. La app ya tiene un módulo ECR en Admin > Governance basado en una ecuación logística con sigmoide:

```text
CL(u,t) = σ(β0 + β1·RetryRate + β2·ErrRate + β3·SwitchRate + β4·TimePressure - β5·ProgressRate)
```

La versión original dependía de variables como `SwitchRate`, `TimeSpentActive` y logs de navegación. Esas variables son sólidas cuando existe acceso a base de datos o a `mdl_logstore_standard_log`, pero **no son fiables en API-only**, porque Moodle no expone de forma estándar una función REST limpia para obtener todos los logs por usuario, curso y ventana temporal.

Por eso, el modelo API-only debe reemplazar las variables dependientes de logs por variables proxy obtenibles mediante Web Services estándar:

```text
CL_API(u,t) = σ(
  β0
  + β1·RetryPressureNorm
  + β2·ErrorPressureNorm
  + β3·QuizTimePressureNorm
  + β4·DeadlinePressureNorm
  + β5·LowProgressNorm
  + β6·GradeDropNorm
  + β7·NonCompletionRiskNorm
  + β8·AssignmentPressureNorm
  + β9·LessonDifficultyNorm
  + β10·ContentCoverageGapNorm
)
```

La app debe permitir calcular la carga cognitiva incluso con datos parciales, pero debe mostrar siempre un nivel de confianza: **Alta**, **Media**, **Baja** o **Datos insuficientes**.

---

## 1. Principios del diseño API-only

### 1.1 Objetivo funcional

Permitir que un administrador Moodle pueda conectar la app con:

```text
Moodle URL
Moodle REST token
```

y obtener:

```text
Cursos disponibles
Estudiantes matriculados
Actividades del curso
Cuestionarios
Intentos de cuestionario
Calificaciones
Estado de completitud
Fechas límite
Presión temporal
Estimación de carga cognitiva
Diagnóstico de cobertura de datos
```

### 1.2 Lo que debe evitarse en API-only

No se debe fingir que existen logs de navegación reales. En modo API-only, estas variables deben considerarse **no disponibles** o **sustituidas por proxy**:

```text
SwitchRate real
TimeSpentActive real
ActivitiesAttempted desde logstore
RevisitRate real
HelpSeekingAfterError basado en secuencia real de eventos
```

### 1.3 Mensaje obligatorio en UI

Mostrar en Admin > Governance:

```text
Modo API-only activo: esta estimación usa intentos, calificaciones, progreso, fechas límite y tiempos de cuestionario disponibles mediante Moodle Web Services. Las señales de navegación real, como cambios entre páginas, revisitas y tiempo activo exacto, no están disponibles sin logs, plugin local o base de datos.
```

---

## 2. Configuración Moodle necesaria para el usuario final

La app debe incluir una guía en la pantalla de conexión.

### 2.1 Pasos en Moodle

```text
1. Ir a Site administration > Advanced features.
2. Activar Enable web services.
3. Ir a Site administration > Server/Plugins > Web services > Manage protocols.
4. Activar REST protocol.
5. Activar Web services documentation si se desea validar las funciones disponibles.
6. Crear un External service personalizado:
   Nombre sugerido: EduAI Cognitive Load API
   Enabled: true
   Authorised users only: true
7. Añadir al servicio las funciones necesarias.
8. Crear o seleccionar un usuario técnico con permisos de lectura.
9. Autorizar ese usuario en el servicio.
10. Crear un token para ese usuario y servicio.
11. Pegar el Moodle URL y el token en la app.
```

### 2.2 Endpoint REST esperado

```text
https://<MOODLE_BASE_URL>/webservice/rest/server.php
```

Cada llamada debe incluir:

```text
wstoken=<TOKEN>
wsfunction=<FUNCTION_NAME>
moodlewsrestformat=json
```

### 2.3 Validación inicial obligatoria

La app debe llamar primero a:

```text
core_webservice_get_site_info
```

Objetivos:

```text
Verificar que el token funciona.
Obtener información básica del sitio.
Obtener el usuario asociado al token.
Obtener, si Moodle lo devuelve, la lista de funciones disponibles para el token.
Detectar si falta alguna función requerida.
```

---

## 3. Paquetes de funciones Moodle API

La app debe organizar las funciones en paquetes para que el usuario entienda qué activa cada bloque.

---

# 3.1 Paquete CRÍTICO mínimo

Estas funciones son las mínimas para que la app funcione con un cálculo API-only razonable.

```text
core_webservice_get_site_info
core_course_get_courses
core_course_get_courses_by_field
core_course_get_contents
core_enrol_get_enrolled_users
core_completion_get_activities_completion_status
core_completion_get_course_completion_status
mod_quiz_get_quizzes_by_courses
mod_quiz_get_user_quiz_attempts
mod_quiz_get_user_attempts
mod_quiz_get_user_best_grade
mod_quiz_get_attempt_review
gradereport_user_get_grade_items
gradereport_overview_get_course_grades
```

### Uso por función

| Función | Uso en la app | Obligatoria |
|---|---|---:|
| `core_webservice_get_site_info` | Validar token, sitio y funciones disponibles | Sí |
| `core_course_get_courses` | Listar cursos disponibles | Sí |
| `core_course_get_courses_by_field` | Buscar cursos por `id`, `shortname`, `idnumber` o categoría | Sí |
| `core_course_get_contents` | Obtener estructura de secciones, módulos y actividades | Sí |
| `core_enrol_get_enrolled_users` | Obtener estudiantes matriculados por curso | Sí |
| `core_completion_get_activities_completion_status` | Obtener completitud de actividades por usuario/curso | Sí |
| `core_completion_get_course_completion_status` | Obtener completitud global de curso | Recomendado |
| `mod_quiz_get_quizzes_by_courses` | Listar quizzes de un curso | Sí |
| `mod_quiz_get_user_quiz_attempts` | Obtener intentos de quiz por usuario | Sí si disponible |
| `mod_quiz_get_user_attempts` | Fallback para instalaciones antiguas o cuando la nueva no esté activa | Sí como fallback |
| `mod_quiz_get_user_best_grade` | Obtener mejor nota de usuario en quiz | Recomendado |
| `mod_quiz_get_attempt_review` | Obtener revisión del intento finalizado | Recomendado |
| `gradereport_user_get_grade_items` | Obtener ítems de nota por usuario/curso | Sí |
| `gradereport_overview_get_course_grades` | Obtener nota final/resumen de cursos | Recomendado |

---

# 3.2 Paquete RECOMENDADO para presión temporal y tareas

```text
core_calendar_get_action_events_by_course
core_calendar_get_action_events_by_courses
core_calendar_get_action_events_by_timesort
core_calendar_get_calendar_events
core_calendar_get_calendar_event_by_id
mod_assign_get_assignments
mod_assign_get_submissions
mod_assign_get_submission_status
mod_assign_get_grades
```

| Función | Uso |
|---|---|
| `core_calendar_get_action_events_by_course` | Deadlines de curso y acciones próximas |
| `core_calendar_get_action_events_by_courses` | Deadlines de varios cursos |
| `core_calendar_get_action_events_by_timesort` | Eventos ordenados por fecha |
| `core_calendar_get_calendar_events` | Eventos generales de calendario |
| `core_calendar_get_calendar_event_by_id` | Detalle de un evento concreto |
| `mod_assign_get_assignments` | Configuración de tareas, fechas límite, cutoff date |
| `mod_assign_get_submissions` | Entregas de estudiantes |
| `mod_assign_get_submission_status` | Estado de entrega individual |
| `mod_assign_get_grades` | Notas de tareas |

---

# 3.3 Paquete RECOMENDADO para contenidos y recursos de apoyo

Estas funciones no dan logs reales, pero permiten saber si el curso tiene recursos de apoyo y si la completitud está configurada.

```text
mod_resource_get_resources_by_courses
mod_page_get_pages_by_courses
mod_book_get_books_by_courses
mod_url_get_urls_by_courses
mod_folder_get_folders_by_courses
mod_lesson_get_lessons_by_courses
mod_lesson_get_lesson
mod_lesson_get_pages
mod_lesson_get_user_attempt
mod_lesson_get_user_attempt_grade
mod_lesson_get_user_grade
mod_lesson_get_questions_attempts
mod_lesson_get_user_timers
```

| Función | Uso |
|---|---|
| `mod_resource_get_resources_by_courses` | Detectar archivos/recursos del curso |
| `mod_page_get_pages_by_courses` | Detectar páginas de contenido |
| `mod_book_get_books_by_courses` | Detectar libros Moodle |
| `mod_url_get_urls_by_courses` | Detectar enlaces externos |
| `mod_folder_get_folders_by_courses` | Detectar carpetas de materiales |
| `mod_lesson_get_lessons_by_courses` | Detectar lecciones |
| `mod_lesson_get_lesson` | Configuración de lección |
| `mod_lesson_get_pages` | Páginas de la lección |
| `mod_lesson_get_user_attempt` | Intento de lección del usuario |
| `mod_lesson_get_user_attempt_grade` | Nota de intento de lección |
| `mod_lesson_get_user_grade` | Nota global de lección |
| `mod_lesson_get_questions_attempts` | Intentos de preguntas en lección |
| `mod_lesson_get_user_timers` | Temporizadores de lección |

---

# 3.4 Paquete opcional para foros y ayuda

Sin logs no se puede calcular `HelpSeekingAfterError` real, pero sí una proxy de participación o búsqueda de ayuda si hay foros.

```text
mod_forum_get_forums_by_courses
mod_forum_get_forum_discussions
mod_forum_get_forum_discussions_paginated
mod_forum_get_discussion_posts
mod_forum_get_discussion_posts_by_userid
mod_forum_get_forum_access_information
```

| Función | Uso |
|---|---|
| `mod_forum_get_forums_by_courses` | Listar foros de un curso |
| `mod_forum_get_forum_discussions` | Obtener discusiones |
| `mod_forum_get_forum_discussions_paginated` | Obtener discusiones paginadas |
| `mod_forum_get_discussion_posts` | Obtener posts de discusión |
| `mod_forum_get_discussion_posts_by_userid` | Obtener posts de discusión de un usuario |
| `mod_forum_get_forum_access_information` | Validar permisos de acceso |

Variable derivada posible:

```text
ForumHelpSeekingProxy = userForumPosts / max(1, forumActivities)
```

No usar como indicador directo de dificultad. Interpretar como señal contextual.

---

# 3.5 Paquete opcional para SCORM

Si la institución usa SCORM, estas funciones pueden aportar datos de progreso, intentos y tracking.

```text
mod_scorm_get_scorms_by_courses
mod_scorm_get_scorm_attempt_count
mod_scorm_get_scorm_sco_tracks
mod_scorm_get_scorm_scoes
mod_scorm_get_scorm_user_data
```

Variables derivadas posibles:

```text
ScormAttemptPressure
ScormCompletionGap
ScormScorePressure
ScormTimeProxy
```

---

# 3.6 Paquete opcional para feedback, choice, survey y workshop

Estas funciones son útiles si el Moodle del cliente usa actividades variadas.

```text
mod_feedback_get_feedbacks_by_courses
mod_feedback_get_finished_responses
mod_choice_get_choices_by_courses
mod_choice_get_choice_results
mod_survey_get_surveys_by_courses
mod_survey_get_questions
mod_workshop_get_workshops_by_courses
mod_workshop_get_grades
mod_workshop_get_grades_report
mod_workshop_get_user_plan
```

Uso recomendado:

```text
No meter todas estas variables en la fórmula principal por defecto.
Usarlas como enriquecimiento o diagnóstico de cobertura.
Añadirlas solo si la institución usa esas actividades.
```

---

# 4. Funciones que NO deben activarse para este módulo

El módulo debe ser read-only. No activar funciones de escritura salvo que la app en el futuro necesite modificar Moodle.

Evitar:

```text
mod_quiz_start_attempt
mod_quiz_save_attempt
mod_quiz_process_attempt
mod_assign_save_submission
mod_assign_save_grade
mod_assign_save_grades
core_grade_update_grades
core_course_create_courses
core_course_update_courses
core_course_delete_courses
core_enrol_submit_user_enrolment_form
enrol_manual_enrol_users
enrol_manual_unenrol_users
core_user_update_users
core_message_send_messages_to_conversation
core_message_send_instant_messages
```

Regla para Antigravity:

```text
No usar ninguna función con type = write para el cálculo de carga cognitiva.
Si una función opcional es write, no incluirla en el servicio por defecto.
```

---

## 5. Modelo API-only de Carga Cognitiva

### 5.1 Fórmula principal

```text
CL_API(u,t) = σ(
  β0
  + β1·RetryPressureNorm
  + β2·ErrorPressureNorm
  + β3·QuizTimePressureNorm
  + β4·DeadlinePressureNorm
  + β5·LowProgressNorm
  + β6·GradeDropNorm
  + β7·NonCompletionRiskNorm
  + β8·AssignmentPressureNorm
  + β9·LessonDifficultyNorm
  + β10·ContentCoverageGapNorm
)
```

### 5.2 Sigmoide

```text
σ(x) = 1 / (1 + e^(-x))
```

### 5.3 Rango de salida

```text
0.00 - 0.33 = Carga cognitiva baja
0.34 - 0.66 = Carga cognitiva moderada
0.67 - 1.00 = Carga cognitiva alta
```

### 5.4 Interpretación obligatoria

```text
La carga cognitiva estimada no es un diagnóstico psicológico.
Es una métrica analítica de apoyo basada en señales de comportamiento académico disponibles en Moodle.
Debe usarse para detectar posibles necesidades de apoyo, no para penalizar al estudiante.
```

---

## 6. Variables API-only

---

### 6.1 RetryPressure

**Qué mide:** presión por reintentos en cuestionarios.

**Fuentes API:**

```text
mod_quiz_get_quizzes_by_courses
mod_quiz_get_user_quiz_attempts
mod_quiz_get_user_attempts
```

**Cálculo:**

```text
TotalQuizAttempts = número total de intentos de quiz del usuario en la ventana temporal
TotalQuizzesAttempted = número de quizzes distintos con al menos un intento

RetryPressure = TotalQuizAttempts / (TotalQuizzesAttempted + 1)
RetryPressureNorm = clamp(RetryPressure / 3, 0, 1)
```

**Fallback:**

```text
Si no existe mod_quiz_get_user_quiz_attempts, usar mod_quiz_get_user_attempts.
Si ninguna está disponible, RetryPressure = null.
```

**Confianza:**

```text
Alta si se obtienen intentos por quiz.
Baja si solo se infiere por calificaciones.
```

---

### 6.2 ErrorPressure

**Qué mide:** dificultad del estudiante a partir de calificaciones o errores.

**Fuentes API:**

```text
mod_quiz_get_user_best_grade
mod_quiz_get_attempt_review
gradereport_user_get_grade_items
gradereport_overview_get_course_grades
```

**Cálculo recomendado por prioridad:**

```text
1. Si hay attempt grade y max grade:
   ErrorPressure = 1 - (AttemptGrade / MaxGrade)

2. Si hay best grade y max grade:
   ErrorPressure = 1 - (BestGrade / MaxGrade)

3. Si hay grade item:
   ErrorPressure = 1 - (FinalGrade / GradeMax)

4. Si mod_quiz_get_attempt_review devuelve información por pregunta:
   ErrorPressure = WrongAnswers / TotalAnswers
```

**Normalización:**

```text
ErrorPressureNorm = clamp(ErrorPressure, 0, 1)
```

**Notas:**

```text
En API-only no asumir siempre que mod_quiz_get_attempt_review dará todos los detalles de pregunta.
Depende de permisos, configuración de revisión del quiz y rol del token.
```

---

### 6.3 QuizTimePressure

**Qué mide:** presión temporal dentro de cuestionarios.

**Fuentes API:**

```text
mod_quiz_get_quizzes_by_courses
mod_quiz_get_user_quiz_attempts
mod_quiz_get_user_attempts
```

**Campos esperados:**

```text
quiz.timelimit
attempt.timestart
attempt.timefinish
attempt.state
```

**Cálculo:**

```text
AttemptDuration = timefinish - timestart
QuizTimePressure = AttemptDuration / timelimit
QuizTimePressureNorm = clamp(QuizTimePressure, 0, 1)
```

**Reglas:**

```text
Si timefinish = 0 o el intento está en progreso, usar now - timestart, pero marcar warning.
Si timelimit = 0 o null, no calcular esta variable.
Si AttemptDuration < 0, descartar intento.
```

---

### 6.4 DeadlinePressure

**Qué mide:** cercanía o superación de fechas límite.

**Fuentes API:**

```text
core_calendar_get_action_events_by_course
core_calendar_get_action_events_by_courses
core_calendar_get_action_events_by_timesort
core_calendar_get_calendar_events
mod_quiz_get_quizzes_by_courses
mod_assign_get_assignments
```

**Cálculo general:**

```text
TotalWindow = Deadline - OpenDate
TimeRemaining = Deadline - Now

DeadlinePressure = 1 - (TimeRemaining / TotalWindow)
DeadlinePressureNorm = clamp(DeadlinePressure, 0, 1)
```

**Si ya venció:**

```text
DeadlinePressureNorm = 1
```

**Si no hay fecha de apertura:**

```text
Usar ventana configurable:
defaultDeadlineWindowDays = 14
```

---

### 6.5 ProgressRate y LowProgress

**Qué mide:** progreso real del estudiante en actividades con completion configurado.

**Fuentes API:**

```text
core_course_get_contents
core_completion_get_activities_completion_status
core_completion_get_course_completion_status
```

**Cálculo:**

```text
TotalTrackableActivities = actividades visibles y trackeables del curso
CompletedActivities = actividades con completion completada

ProgressRate = CompletedActivities / max(1, TotalTrackableActivities)
LowProgress = 1 - ProgressRate
LowProgressNorm = clamp(LowProgress, 0, 1)
```

**Reglas:**

```text
Si el curso no tiene completion activado o hay muy pocas actividades trackeables, bajar confianza.
Si TotalTrackableActivities = 0, ProgressRate = null.
```

---

### 6.6 NonCompletionRisk

**Qué mide:** riesgo por actividades vencidas o pendientes.

**Fuentes API:**

```text
core_completion_get_activities_completion_status
core_course_get_contents
core_calendar_get_action_events_by_course
core_calendar_get_action_events_by_courses
mod_assign_get_assignments
mod_quiz_get_quizzes_by_courses
```

**Cálculo:**

```text
DueActivities = actividades con deadline dentro de la ventana o vencidas
OverdueIncompleteActivities = actividades vencidas y no completadas

NonCompletionRisk = OverdueIncompleteActivities / max(1, DueActivities)
NonCompletionRiskNorm = clamp(NonCompletionRisk, 0, 1)
```

---

### 6.7 GradeDrop

**Qué mide:** caída de rendimiento reciente respecto a rendimiento previo.

**Fuentes API:**

```text
gradereport_user_get_grade_items
gradereport_overview_get_course_grades
mod_quiz_get_user_best_grade
mod_assign_get_grades
mod_lesson_get_user_grade
mod_scorm_get_scorm_sco_tracks
```

**Cálculo:**

```text
PreviousAverage = media normalizada de notas anteriores a la ventana actual
RecentAverage = media normalizada de notas en la ventana actual

GradeDrop = max(0, PreviousAverage - RecentAverage)
GradeDropNorm = clamp(GradeDrop, 0, 1)
```

**Notas:**

```text
Las notas deben normalizarse a 0..1.
Si no hay histórico suficiente, GradeDrop = null y no penaliza.
```

---

### 6.8 AssignmentPressure

**Qué mide:** presión relacionada con tareas: entregas pendientes, tarde o con baja nota.

**Fuentes API:**

```text
mod_assign_get_assignments
mod_assign_get_submissions
mod_assign_get_submission_status
mod_assign_get_grades
core_calendar_get_action_events_by_course
```

**Cálculo sugerido:**

```text
LateSubmissionRate = lateSubmissions / max(1, totalSubmissions)
MissingSubmissionRate = missingSubmissions / max(1, dueAssignments)
AssignmentLowGradeRate = 1 - avgAssignmentGradeNorm

AssignmentPressure = weighted_avg(
  LateSubmissionRate,
  MissingSubmissionRate,
  AssignmentLowGradeRate
)

AssignmentPressureNorm = clamp(AssignmentPressure, 0, 1)
```

---

### 6.9 LessonDifficulty

**Qué mide:** dificultad en lecciones Moodle.

**Fuentes API:**

```text
mod_lesson_get_lessons_by_courses
mod_lesson_get_user_attempt
mod_lesson_get_user_attempt_grade
mod_lesson_get_user_grade
mod_lesson_get_questions_attempts
mod_lesson_get_user_timers
```

**Cálculo sugerido:**

```text
LessonGradePressure = 1 - lessonGradeNorm
LessonAttemptPressure = attempts / configurableMaxLessonAttempts
LessonTimePressure = lessonTimeUsed / expectedLessonTime

LessonDifficulty = weighted_avg(
  LessonGradePressure,
  LessonAttemptPressure,
  LessonTimePressure
)

LessonDifficultyNorm = clamp(LessonDifficulty, 0, 1)
```

---

### 6.10 ContentCoverageGap

**Qué mide:** falta de completitud en recursos de apoyo o contenido.

**Fuentes API:**

```text
core_course_get_contents
core_completion_get_activities_completion_status
mod_resource_get_resources_by_courses
mod_page_get_pages_by_courses
mod_book_get_books_by_courses
mod_url_get_urls_by_courses
mod_folder_get_folders_by_courses
```

**Cálculo:**

```text
TrackableContentItems = recursos/páginas/libros/urls/carpetas con completion configurado
CompletedContentItems = recursos/páginas/libros/urls/carpetas completados

ContentCoverage = CompletedContentItems / max(1, TrackableContentItems)
ContentCoverageGap = 1 - ContentCoverage
```

**Advertencia:**

```text
Sin completion configurado, no usar esta variable.
```

---

### 6.11 ForumHelpSeekingProxy

**Qué mide:** participación en foros como señal contextual de búsqueda de ayuda.

**Fuentes API:**

```text
mod_forum_get_forums_by_courses
mod_forum_get_forum_discussions
mod_forum_get_forum_discussions_paginated
mod_forum_get_discussion_posts
mod_forum_get_discussion_posts_by_userid
```

**Cálculo opcional:**

```text
ForumHelpSeekingProxy = userForumPosts / max(1, totalForumDiscussions)
```

**Uso recomendado:**

```text
No incluir por defecto como presión negativa o positiva.
Mostrar como variable contextual.
En algunos casos, participar mucho en foros es positivo, no dificultad.
```

---

## 7. Variables finales y pesos por defecto

### 7.1 Pesos heurísticos iniciales

Estos pesos deben ser configurables en Admin > Governance > Cognitive Load Settings.

```json
{
  "formulaVersion": "api_only_v1",
  "beta0": -1.20,
  "retryPressure": 0.90,
  "errorPressure": 1.40,
  "quizTimePressure": 0.80,
  "deadlinePressure": 0.70,
  "lowProgress": 1.00,
  "gradeDrop": 0.90,
  "nonCompletionRisk": 1.10,
  "assignmentPressure": 0.80,
  "lessonDifficulty": 0.70,
  "contentCoverageGap": 0.50
}
```

### 7.2 Regla importante

```text
Los coeficientes son heurísticos iniciales.
No deben presentarse como coeficientes científicamente validados.
La app debe permitir calibrarlos por institución, curso o cohorte.
```

---

## 8. Normalización y manejo de valores faltantes

### 8.1 Función clamp

```ts
function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}
```

### 8.2 Weighted average con missing values

```ts
type FeatureValue = {
  value: number | null;
  weight: number;
};

function weightedAverage(features: FeatureValue[]): number | null {
  const available = features.filter(f => f.value !== null && !Number.isNaN(f.value));
  const totalWeight = available.reduce((sum, f) => sum + f.weight, 0);

  if (available.length === 0 || totalWeight === 0) return null;

  return available.reduce((sum, f) => sum + (f.value as number) * f.weight, 0) / totalWeight;
}
```

### 8.3 Sigmoid

```ts
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}
```

### 8.4 Regla para variables faltantes

```text
No sustituir variables faltantes por 0 automáticamente.
No inventar datos.
Calcular el score con las variables disponibles y ajustar el nivel de confianza.
Mostrar missingSources y warnings.
```

---

## 9. Nivel de confianza

### 9.1 Cálculo recomendado

Crear un score interno de cobertura:

```text
coverageScore =
  +25 si ErrorPressure disponible
  +20 si ProgressRate/LowProgress disponible
  +15 si RetryPressure disponible
  +15 si QuizTimePressure o DeadlinePressure disponible
  +10 si NonCompletionRisk disponible
  +10 si GradeDrop disponible
  +5 si AssignmentPressure o LessonDifficulty disponible
```

### 9.2 Clasificación

```text
Alta: coverageScore >= 75
Media: coverageScore >= 50 y < 75
Baja: coverageScore >= 30 y < 50
Datos insuficientes: coverageScore < 30
```

### 9.3 Mensajes UI

```text
Alta:
La estimación usa suficientes señales académicas: errores/notas, progreso, intentos y presión temporal.

Media:
La estimación usa señales suficientes, pero faltan algunas variables temporales o de tareas.

Baja:
La estimación se basa en pocos datos. Active completitud, cuestionarios calificados y fechas límite para mejorarla.

Datos insuficientes:
No hay datos suficientes para calcular una estimación fiable.
```

---

## 10. Modelo TypeScript recomendado

```ts
export type CognitiveLoadConfidence =
  | "Alta"
  | "Media"
  | "Baja"
  | "Datos insuficientes";

export type CognitiveLoadLevel =
  | "Baja"
  | "Moderada"
  | "Alta"
  | "No disponible";

export interface MoodleApiConnectionConfig {
  baseUrl: string;
  token: string;
  restEndpoint?: string;
}

export interface MoodleFunctionStatus {
  functionName: string;
  requiredLevel: "critical" | "recommended" | "optional";
  available: boolean;
  purpose: string;
  variablesEnabled: string[];
  missingImpact: "blocks_calculation" | "reduces_confidence" | "optional_context";
}

export interface ApiOnlyCognitiveLoadFeatures {
  userId: number;
  courseId: number;
  windowStart: string;
  windowEnd: string;

  retryPressure: number | null;
  errorPressure: number | null;
  quizTimePressure: number | null;
  deadlinePressure: number | null;
  progressRate: number | null;
  lowProgress: number | null;
  nonCompletionRisk: number | null;
  gradeDrop: number | null;
  assignmentPressure: number | null;
  lessonDifficulty: number | null;
  contentCoverageGap: number | null;
  forumHelpSeekingProxy: number | null;

  missingSources: string[];
  warnings: string[];
}

export interface ApiOnlyCognitiveLoadResult {
  userId: number;
  courseId: number;
  score: number | null;
  level: CognitiveLoadLevel;
  confidence: CognitiveLoadConfidence;
  coverageScore: number;
  formulaVersion: "api_only_v1";
  features: ApiOnlyCognitiveLoadFeatures;
  normalizedFeatures: Record<string, number | null>;
  explanation: string[];
}
```

---

## 11. Servicios que Antigravity debe crear o adaptar

### 11.1 `lib/moodle/MoodleApiClient.ts`

Responsabilidad:

```text
Crear un cliente genérico para llamadas REST Moodle.
Gestionar URL, token, wsfunction y moodlewsrestformat=json.
Gestionar errores HTTP y errores Moodle.
Normalizar errores.
```

Método base:

```ts
async function callMoodle<T>(
  functionName: string,
  params: Record<string, unknown> = {}
): Promise<T>
```

---

### 11.2 `lib/moodle/MoodleApiDiagnosticsService.ts`

Responsabilidad:

```text
Probar conexión.
Llamar core_webservice_get_site_info.
Detectar funciones disponibles.
Comparar con catálogo requerido.
Generar matriz de cobertura.
```

Salida:

```ts
interface MoodleApiDiagnosticsResult {
  connected: boolean;
  siteName?: string;
  moodleVersion?: string;
  userId?: number;
  availableFunctions: string[];
  missingCriticalFunctions: string[];
  missingRecommendedFunctions: string[];
  missingOptionalFunctions: string[];
  functionStatuses: MoodleFunctionStatus[];
  canCalculate: boolean;
  estimatedMaxConfidence: CognitiveLoadConfidence;
}
```

---

### 11.3 `lib/cognitive-load/ApiOnlyFeatureExtractor.ts`

Responsabilidad:

```text
Recibir userId, courseId y ventana temporal.
Llamar las funciones API disponibles.
Calcular las variables API-only.
Devolver ApiOnlyCognitiveLoadFeatures.
```

---

### 11.4 `lib/cognitive-load/CognitiveLoadService.ts`

Responsabilidad:

```text
Aplicar fórmula.
Normalizar variables.
Calcular sigmoide.
Calcular nivel.
Calcular confianza.
Generar explicación.
```

---

### 11.5 `app/api/admin/governance/moodle-diagnostics/route.ts`

Endpoint interno:

```text
POST /api/admin/governance/moodle-diagnostics
```

Entrada:

```json
{
  "baseUrl": "https://moodle.example.com",
  "token": "xxxx"
}
```

Salida:

```json
{
  "connected": true,
  "canCalculate": true,
  "estimatedMaxConfidence": "Alta",
  "missingCriticalFunctions": [],
  "missingRecommendedFunctions": ["core_calendar_get_action_events_by_course"],
  "functionStatuses": []
}
```

---

### 11.6 `app/api/admin/governance/cognitive-load-api-only/route.ts`

Endpoint interno:

```text
POST /api/admin/governance/cognitive-load-api-only
```

Entrada:

```json
{
  "courseId": 12,
  "userId": 345,
  "windowStart": "2026-01-01T00:00:00Z",
  "windowEnd": "2026-01-31T23:59:59Z"
}
```

Salida:

```json
{
  "score": 0.72,
  "level": "Alta",
  "confidence": "Media",
  "coverageScore": 65,
  "features": {},
  "warnings": [
    "QuizTimePressure no disponible porque los quizzes no tienen timelimit.",
    "DeadlinePressure parcial porque no se pudo leer calendario."
  ]
}
```

---

## 12. Pantallas UI necesarias

### 12.1 Admin > Governance > Moodle API Connection

Sección:

```text
Conexión Moodle API
```

Campos:

```text
Moodle URL
Token REST
```

Botones:

```text
Probar conexión
Guardar conexión
Ver diagnóstico
```

Estados:

```text
Conectado
Token inválido
Moodle no accesible
Faltan funciones críticas
Faltan funciones recomendadas
```

---

### 12.2 Diagnóstico de funciones API

Tabla:

| Función | Nivel | Estado | Variables habilitadas | Impacto si falta |
|---|---|---|---|---|
| `core_webservice_get_site_info` | Critical | OK | Diagnóstico | Bloquea conexión |
| `mod_quiz_get_user_quiz_attempts` | Critical | OK | RetryPressure, QuizTimePressure | Reduce cálculo |
| `core_completion_get_activities_completion_status` | Critical | OK | ProgressRate | Bloquea progreso |
| `core_calendar_get_action_events_by_course` | Recommended | Missing | DeadlinePressure | Reduce confianza |

---

### 12.3 Modal “Ver cálculo de carga cognitiva”

Debe contener:

```text
1. Fórmula API-only
2. Variables usadas
3. Funciones Moodle necesarias
4. Variables no disponibles en API-only
5. Nivel de confianza
6. Limitaciones
7. Simulador opcional
```

---

## 13. Flujo de extracción de datos

### 13.1 Flujo principal

```text
1. Validar Moodle API con core_webservice_get_site_info.
2. Cargar catálogo de funciones disponibles.
3. Obtener curso con core_course_get_courses_by_field o core_course_get_courses.
4. Obtener contenidos con core_course_get_contents.
5. Obtener estudiantes con core_enrol_get_enrolled_users.
6. Obtener completitud con core_completion_get_activities_completion_status.
7. Obtener quizzes con mod_quiz_get_quizzes_by_courses.
8. Para cada quiz:
   a. obtener intentos con mod_quiz_get_user_quiz_attempts.
   b. fallback a mod_quiz_get_user_attempts.
   c. obtener mejor nota con mod_quiz_get_user_best_grade.
   d. obtener review si está disponible.
9. Obtener grade items con gradereport_user_get_grade_items.
10. Obtener eventos/deadlines con calendar APIs.
11. Obtener assignments si están disponibles.
12. Obtener lessons/scorm si están disponibles.
13. Calcular features.
14. Calcular CL_API.
15. Calcular confianza.
16. Devolver resultado y warnings.
```

---

## 14. Lógica de disponibilidad de funciones

La app debe permitir que algunas funciones falten.

### 14.1 Si falta `mod_quiz_get_user_quiz_attempts`

```text
Usar mod_quiz_get_user_attempts.
Warning: "Se usa función legacy/fallback para intentos de quiz."
```

### 14.2 Si falta `mod_quiz_get_attempt_review`

```text
Usar notas de quiz y gradebook para ErrorPressure.
Warning: "No hay revisión detallada de intentos. ErrorPressure se calcula desde calificaciones."
```

### 14.3 Si falta `core_completion_get_activities_completion_status`

```text
No calcular ProgressRate.
Bajar confianza.
Si también faltan notas, mostrar Datos insuficientes.
```

### 14.4 Si faltan calendar APIs

```text
Calcular DeadlinePressure usando fechas de quiz y assignment si existen.
Si no existen, DeadlinePressure = null.
```

### 14.5 Si faltan assignment APIs

```text
AssignmentPressure = null.
No bloquear cálculo.
```

---

## 15. Seguridad y privacidad

### 15.1 Reglas técnicas

```text
No guardar token en texto plano.
Cifrar token en almacenamiento.
No loggear token.
No exponer token al frontend después de guardarlo.
No llamar funciones write.
No modificar datos Moodle.
Respetar permisos del usuario token.
```

### 15.2 Reglas pedagógicas

```text
No mostrar “estudiante con problema”.
No mostrar “diagnóstico”.
Usar “posible sobrecarga”, “señal de apoyo”, “estimación”.
Permitir explicación transparente de variables.
```

### 15.3 Texto recomendado

```text
Esta métrica estima señales de posible sobrecarga cognitiva a partir de datos académicos disponibles en Moodle. No representa un diagnóstico psicológico ni debe utilizarse para penalizar al estudiante.
```

---

## 16. Acceptance criteria para Antigravity

```text
1. Existe una pantalla Admin > Governance > Moodle API Connection.
2. El usuario puede introducir Moodle URL y token.
3. La app valida conexión con core_webservice_get_site_info.
4. La app detecta funciones disponibles y faltantes.
5. La app muestra diagnóstico por función.
6. La app calcula CL_API usando solo Moodle REST API.
7. La app no usa base de datos.
8. La app no usa logs reales en API-only.
9. La app no inventa SwitchRate ni TimeSpentActive.
10. La app calcula RetryPressure.
11. La app calcula ErrorPressure.
12. La app calcula ProgressRate y LowProgress si completion está disponible.
13. La app calcula QuizTimePressure si hay timelimit.
14. La app calcula DeadlinePressure si hay calendario/deadlines.
15. La app calcula NonCompletionRisk si hay completitud y deadlines.
16. La app calcula GradeDrop si hay histórico de notas.
17. La app calcula AssignmentPressure si hay funciones assign.
18. La app calcula LessonDifficulty si hay funciones lesson.
19. La app muestra warnings si faltan variables.
20. La app calcula nivel de confianza.
21. La app muestra fórmula y variables en Governance.
22. La UI está en español.
23. No se activan funciones write por defecto.
24. No se rompen los componentes existentes:
    - lib/cognitiveLoadService.ts
    - app/api/admin/governance/cognitive-load/route.ts
    - components/CognitiveLoadModal.tsx
    - app/admin/governance/page.tsx
25. Build, lint y tests pasan.
```

---

## 17. Mission prompt compacto para ejecutar en Antigravity

```text
MISSION: Implement API-only Moodle Cognitive Load module.

The app already has a Cognitive Load module in Admin > Governance. Extend it so any Moodle administrator can connect using only Moodle REST API token, without database access.

Use API-only formula:

CL_API(u,t) = sigmoid(
  β0
  + β1*RetryPressureNorm
  + β2*ErrorPressureNorm
  + β3*QuizTimePressureNorm
  + β4*DeadlinePressureNorm
  + β5*LowProgressNorm
  + β6*GradeDropNorm
  + β7*NonCompletionRiskNorm
  + β8*AssignmentPressureNorm
  + β9*LessonDifficultyNorm
  + β10*ContentCoverageGapNorm
)

Critical functions:
- core_webservice_get_site_info
- core_course_get_courses
- core_course_get_courses_by_field
- core_course_get_contents
- core_enrol_get_enrolled_users
- core_completion_get_activities_completion_status
- core_completion_get_course_completion_status
- mod_quiz_get_quizzes_by_courses
- mod_quiz_get_user_quiz_attempts
- mod_quiz_get_user_attempts as fallback
- mod_quiz_get_user_best_grade
- mod_quiz_get_attempt_review
- gradereport_user_get_grade_items
- gradereport_overview_get_course_grades

Recommended functions:
- core_calendar_get_action_events_by_course
- core_calendar_get_action_events_by_courses
- core_calendar_get_action_events_by_timesort
- core_calendar_get_calendar_events
- mod_assign_get_assignments
- mod_assign_get_submissions
- mod_assign_get_submission_status
- mod_assign_get_grades
- mod_resource_get_resources_by_courses
- mod_page_get_pages_by_courses
- mod_book_get_books_by_courses
- mod_url_get_urls_by_courses
- mod_folder_get_folders_by_courses
- mod_forum_get_forums_by_courses
- mod_forum_get_forum_discussions
- mod_forum_get_forum_discussions_paginated
- mod_forum_get_discussion_posts
- mod_forum_get_discussion_posts_by_userid
- mod_lesson_get_lessons_by_courses
- mod_lesson_get_user_attempt
- mod_lesson_get_user_attempt_grade
- mod_lesson_get_user_grade
- mod_lesson_get_questions_attempts
- mod_lesson_get_user_timers
- mod_scorm_get_scorms_by_courses
- mod_scorm_get_scorm_attempt_count
- mod_scorm_get_scorm_sco_tracks
- mod_scorm_get_scorm_scoes
- mod_scorm_get_scorm_user_data

Do not use DB.
Do not fake log-based variables.
Do not activate write functions.
Add a Moodle API Connection wizard.
Add a diagnostics table showing available/missing functions.
Add confidence levels: Alta, Media, Baja, Datos insuficientes.
Show warnings and missingSources.
Keep UI in Spanish.
```

---

## 18. Fuentes oficiales y notas de compatibilidad

### 18.1 Fuentes de Moodle a consultar por Antigravity

```text
Moodle Developer Resources 5.2 - API Guides
Moodle Developer Resources 5.0 - External Services
Moodle Developer Resources 5.0 - External Function Definitions
Moodle Developer Resources 5.0 - Function Declarations
MoodleDocs - Web service API functions
MoodleDocs - Using web services
Live Moodle site: Site administration > Server > Web services > API Documentation
```

### 18.2 Regla de compatibilidad

```text
La lista exacta de funciones puede variar por versión de Moodle, plugins instalados, permisos y servicio externo configurado.
La app siempre debe validar funciones contra el Moodle real del cliente mediante core_webservice_get_site_info y, si es necesario, sugerir al admin revisar la API Documentation interna de su Moodle.
```

### 18.3 Nota sobre `mod_quiz_get_user_attempts`

```text
En Moodle reciente, preferir mod_quiz_get_user_quiz_attempts.
Mantener mod_quiz_get_user_attempts como fallback por compatibilidad.
```

---

## 19. Conclusión técnica

El cálculo API-only es viable y útil si se basa en:

```text
Intentos de quiz
Notas
Completitud
Fechas límite
Presión temporal de quizzes
Tareas
Lecciones
SCORM si existe
```

No tendrá la misma granularidad que un modelo basado en logs, pero será mucho más fácil de instalar para usuarios finales. La app debe vender esta versión como:

```text
Carga Cognitiva Estimada API-only
```

y mostrar una explicación honesta:

```text
La estimación se basa en señales académicas disponibles por Moodle API. Para señales de navegación real y tiempo activo exacto, será necesario activar el modo avanzado con base de datos read-only o plugin local Moodle.
```
