# Documentación Técnica: Módulo de Carga Cognitiva Estimada (ECR)

Este documento detalla la implementación actual del módulo de Carga Cognitiva integrado en el panel de Gobernanza del Administrador.

## 1. Modelo Matemático

La carga cognitiva se estima mediante una ecuación de regresión logística con una función de activación sigmoide, que normaliza el resultado entre 0 y 1.

### Ecuación Principal
$$CL_{u,t} = \sigma(\beta_0 + \beta_1 \cdot R + \beta_2 \cdot E + \beta_3 \cdot S + \beta_4 \cdot T - \beta_5 \cdot P)$$

Donde:
*   **$\sigma(x)$**: Función Sigmoide $\frac{1}{1 + e^{-x}}$
*   **$R$**: RetryRate (Tasa de Reintentos)
*   **$E$**: ErrRate (Tasa de Errores)
*   **$S$**: SwitchRate (Tasa de Cambio de Contexto)
*   **$T$**: TimePressure (Presión de Tiempo)
*   **$P$**: ProgressRate (Tasa de Progreso)
*   **$\beta_n$**: Coeficientes de peso (Heurísticos configurables en `lib/cognitiveLoadService.ts`).

---

## 2. Variables y Definiciones

| Variable | Definición / Ecuación | Muestra de Datos | Impacto en CL |
| :--- | :--- | :--- | :--- |
| **Attempts** | `COUNT(*)` en intentos de cuestionario | `mdl_quiz_attempts` | Incrementa |
| **RetryRate (R)** | `Attempts / (ActivitiesAttempted + 1)` | Derivado | Incrementa |
| **ErrRate (E)** | `WrongAnswers / TotalAnswers` | Derivado de calificaciones | Incrementa |
| **SwitchRate (S)** | Frecuencia de cambio entre recursos | `mdl_logstore_standard_log` | Incrementa |
| **TimePressure (T)** | `TimeSpentActive / ExpectedTime` | Logs + Configuración | Incrementa |
| **ProgressRate (P)** | `CompletedActivities / TotalActivities` | `mdl_course_modules_completion` | **Reduce** |

---

## 3. Funciones de la API de Moodle Utilizadas

El sistema realiza llamadas a las siguientes funciones del Web Service de Moodle para alimentar el cálculo:

### Núcleo del Cálculo de Carga Cognitiva
*   `core_course_get_courses`: Obtención de la lista de cursos disponibles.
*   `core_enrol_get_enrolled_users`: Identificación de estudiantes matriculados en el curso seleccionado.
*   `mod_quiz_get_quizzes_by_courses`: Identificación de todos los cuestionarios presentes en el curso.
*   `mod_quiz_get_user_attempts`: Obtención de los intentos y calificaciones de un estudiante específico en cada cuestionario.
*   `core_completion_get_activities_completion_status`: Estado de completitud de cada actividad para calcular el `ProgressRate`.
*   `core_course_get_user_navigation_options`: Heurístico para detectar actividad si los logs están restringidos.

### Módulo de Gobernanza General (Metadata Discovery)
*   `core_webservice_get_site_info`: Información general de la plataforma.
*   `core_course_get_categories`: Estructura de categorías de cursos.
*   `core_user_get_users_by_field`: Perfiles profundos de usuario.
*   `core_course_get_contents`: Estructura de contenidos y módulos del curso.
*   `mod_assign_get_assignments`: Datos de tareas y entregas.
*   `mod_forum_get_forums_by_courses`: Actividad en foros.
*   `core_fetch_notifications`: Notificaciones pendientes del sistema.
*   `core_message_get_messages`: Mensajería interna.
*   `gradereport_overview_get_course_grades`: Resumen de calificaciones del curso.
*   `gradereport_user_get_grade_items`: Desglose de ítems de calificación.
*   `core_course_get_course_module`: Información detallada de un módulo específico.

---

## 4. Estructura de Archivos

1.  **`lib/cognitiveLoadService.ts`**: Contiene la lógica pura del cálculo, coeficientes $\beta$, y normalización.
2.  **`app/api/admin/governance/cognitive-load/route.ts`**: API que orquestra las llamadas a Moodle y devuelve los resultados procesados.
3.  **`components/CognitiveLoadModal.tsx`**: Interfaz visual (UI) que presenta la explicación y el simulador al administrador.
4.  **`app/admin/governance/page.tsx`**: Integración del botón y manejo del estado de selección de curso/estudiante.

---

## 5. Interpretación de Niveles

*   **0.00 - 0.33 (Verde)**: Carga cognitiva baja. El estudiante progresa sin signos de estrés o bloqueo.
*   **0.34 - 0.66 (Ámbar)**: Carga cognitiva moderada. Presencia de algunos errores o reintentos; situación de alerta.
*   **0.67 - 1.00 (Rojo)**: Carga cognitiva alta. Signos claros de dificultad, bloqueos repetidos o presión de tiempo extrema.

---

## 6. Nivel de Confianza

El sistema calcula un nivel de confianza (**Alta**, **Media**, **Baja**) basado en la disponibilidad de datos de Moodle. Si funciones como los registros (logs) o los pasos de las preguntas están restringidos, el sistema informará al administrador que la estimación es menos fiable.
