# Documentación Técnica: LR Fisioderm (Versión 0.3.0)

## Resumen del Proyecto
Aplicación web full-stack para el consultorio "LR Fisioderm" (Fisioterapia Dermatofuncional).
La plataforma está dividida en dos partes principales:
1. **Landing Page y PWA:** Interfaz pública y portal de seguimiento para los pacientes.
2. **Dashboard de Especialista:** Panel administrativo privado para gestión clínica.

## Arquitectura y Stack Tecnológico
* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS.
* **Backend y Base de Datos:** Supabase (Auth, Storage, y Postgres).
* **Iconografía:** Lucide React.
* **Componentes Visuales:** Diseño moderno, "glassmorphism", paleta de colores crema, dorados y verdes elegantes.

## Configuración Actual de Supabase

### 1. Storage (Almacenamiento)
* Se utiliza un bucket llamado `avatares` configurado como **Público**.
* **Propósito:** Almacenar las fotos de perfil de los pacientes.

### 2. Autenticación (Auth)
* Se utiliza Supabase Auth (Email/Password).
* **Propósito:** Proteger la ruta `/dashboard`. Solo usuarios autenticados pueden acceder. El sistema de protección está implementado a nivel de Layout en `src/app/dashboard/layout.tsx`.

## Nuevas Funcionalidades Implementadas (v0.3.0)

### Panel de Especialista (`/dashboard`)
1. **Sidebar Mejorado (Navegación Permanente):**
   - El menú lateral ahora es fijo (`sticky h-screen`). Al hacer scroll en la lista de pacientes o agenda, el menú y el botón de "Cerrar Sesión" permanecen siempre visibles.
   - El logotipo ahora funciona como un botón rápido para regresar a la vista pública de la web.

2. **Compartir App (Código QR):**
   - En el inicio del Dashboard se implementó una tarjeta dinámica que genera un Código QR apuntando a la ruta `/pwa`. Permite a los pacientes escanearlo desde el consultorio para entrar a su portal móvil.

### Gestión de Pacientes y Expedientes
1. **Modal de Edición de Datos Básicos:**
   - La tabla en `/dashboard/pacientes` ahora tiene botones de edición reales.
   - Es posible agregar o editar: Nombre, Email, Teléfono, Fecha de Nacimiento y una lista dinámica de **Alergias**.

2. **Edición de Evaluación Clínica (Expediente):**
   - En la vista detallada de cada paciente (`/dashboard/pacientes/[id]`), se integró un sistema de actualización de estado clínico.
   - Permite modificar: **Fototipo, Hidratación, Elasticidad, Sensibilidad** y **Objetivo** (Estético/Funcional).
   - Permite escribir y visualizar un **Protocolo de Tratamiento** (rutina) paso a paso, guardado de forma persistente.

### Landing Page y Rutas Globales
1. **Acceso Pacientes:**
   - Agregado un botón de "Acceso Pacientes" en la barra de navegación superior (Navbar), facilitando que los usuarios existentes entren a la PWA.
2. **Corrección de Anclas (Enlaces):**
   - Se modificaron los enlaces de `#catalogo` y `#citas` por `/#catalogo` y `/#citas` a nivel global (`layout.tsx`). Esto garantiza que los botones de navegación funcionen correctamente incluso si el usuario intenta usarlos estando dentro del Dashboard o de la PWA.
3. **Integración del Botón Agenda:**
   - El botón de "Agendar Cita" dentro del panel administrativo ahora redirige limpiamente al formulario inteligente (que previene colisiones de horario) ubicado en la Landing Page.

## Siguientes Pasos (Roadmap)
* Configuración de la sección de creación/edición del "Catálogo" de productos.
* Implementación del Stripe Link para pagos de productos.
* Sistema CRUD completo para publicar "Tips y Rutinas" dinámicos en la PWA.
