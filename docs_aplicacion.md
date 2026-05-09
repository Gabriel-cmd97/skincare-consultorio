# Documentación Técnica: LR Fisioderm (Versión 1.0.0 - Release Candidate)

## Resumen del Proyecto
Aplicación web full-stack adaptativa para el consultorio "LR Fisioderm".
La plataforma cuenta con un enfoque "mobile-first" y está dividida en dos ecosistemas:
1. **Landing Page y PWA (Portal de Pacientes):** Interfaz pública de ventas y aplicación instalable para seguimiento clínico.
2. **Dashboard de Especialista:** Panel administrativo privado responsivo para gestión clínica y e-commerce por WhatsApp.

## Arquitectura y Stack Tecnológico
* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS.
* **Backend y Base de Datos:** Supabase (Auth, Storage y Postgres).
* **PWA:** `manifest.ts` nativo de Next.js.
* **Diseño:** Glassmorphism, paleta crema/dorado/verde, "Mobile-First".

## Módulos Core Implementados

### 1. Panel de Especialista (100% Responsivo)
- **Navegación Inteligente:** En escritorio usa un Sidebar permanente (`sticky`), en móviles (celulares) colapsa a una **Barra de Navegación Inferior (Bottom-Nav)** estilo app nativa para pulgar.
- **Configuración de Marca (`/dashboard/configuracion`):** Interfaz para inyectar dinámicamente en la base de datos:
  - URL del Logotipo.
  - Color Primario (Acento).
  - Número de WhatsApp para ventas/pedidos.
- **Seeding de Catálogo (`/dashboard/seed`):** Módulo de carga rápida de datos reales para inicializar la tienda con productos de grado médico premium (Vitamina C, Protector Solar, etc.).
- **Lista de Pacientes Dual:** 
  - *Escritorio:* Tabla de datos estructurada con columnas.
  - *Móvil:* Diseño de tarjetas (Cards) táctiles, previniendo el "scroll" horizontal.

### 2. Ecosistema PWA (Portal de Pacientes)
- **Instalable:** Implementación de `manifest.ts` y meta-tags para permitir "Añadir a pantalla de inicio" (Instalación nativa sin App Store).
- **Inicio de Sesión sin contraseñas:** El paciente accede digitando o pegando su Código Único (UUID).
- **Vistas Personalizadas:**
  - *Mi Tratamiento:* Renderiza la evaluación clínica y la rutina prescrita desde el dashboard.
  - *Inicio (Blog):* Consume la tabla `tips_rutinas` para leer consejos públicos escritos por la especialista.
  - *Tienda de Productos:* Catálogo con botón de "Comprar".

### 3. Integración WhatsApp (E-Commerce Simplificado)
- **Cero-API y Gratuito:** Uso de la API pública `wa.me` para conectar pacientes con el especialista sin costos.
- **Tienda PWA:** Al hacer clic en "Comprar" en un producto de la PWA, se lee el número guardado en configuración y abre WhatsApp con un mensaje pre-llenado indicando el producto de interés.
- **Envío de Instrucciones:** En el expediente clínico del paciente (`/dashboard/pacientes/[id]`), hay un botón "Enviar a paciente" que redacta un WhatsApp automático con el código del paciente y los pasos para instalar la PWA.

### 4. Sistema de Notificaciones Híbrido
- **Base de Datos:** Uso de la tabla `notificaciones` en Supabase para almacenar el historial de eventos (citas, pedidos, avisos del sistema).
- **Interfaz Web (Panel de Especialista):**
  - Icono de campanita con contador dinámico visible tanto en el menú lateral (escritorio) como en la barra superior (móviles).
  - Página dedicada `Mobile-First` en `/dashboard/notificaciones` para gestionar, leer y acceder al contenido de las notificaciones.
- **Alertas Push (WhatsApp):** Integración con la API gratuita de **CallMeBot** mediante una `Server Action` de Next.js, la cual envía un mensaje de texto automático al WhatsApp del especialista cada vez que se genera un evento crítico (ej. una cita nueva), funcionando de manera nativa sobre el entorno de Cloudflare Pages.

## Seguridad y Conexión (Supabase)
* **Auth:** La ruta `/dashboard` está protegida por Supabase Auth (JWT verificado en el cliente).
* **Storage:** Bucket `avatares` público para subir imágenes de perfil.
* **RLS (Row-Level Security):**
  - `productos`, `tips_rutinas` y `configuracion` accesibles públicamente (modo lectura) vía rol `anon`.
  - `pacientes` accesible públicamente (con conocimiento de UUID exacto) para permitir que la PWA lea el perfil del paciente con el código correcto.
* **Claves:** El entorno local (`.env.local`) y de producción (Cloudflare) utilizan `NEXT_PUBLIC_SUPABASE_URL` y la clave `anon` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Siguientes Pasos Futuros (Versiones Posteriores)
* Habilitar enlaces de pago reales con Stripe para los productos en caso de querer cobrar con tarjeta (actualmente gestionado por WhatsApp).
