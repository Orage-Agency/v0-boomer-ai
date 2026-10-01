# Índice del proyecto

Inventario de archivos versionados de Boomer AI. Se incluyen código, documentación, configuración y recursos del producto en las dos aplicaciones separadas (web y móvil). Los archivos de dependencias bloqueadas se describen como tales; no se incluyen carpetas generadas como `.next/` o `node_modules/`.

## Raíz y configuración compartida

| Archivo | Descripción |
|---|---|
| `AGENTS.md` | Guía de producto, UX, habilidades y ciclo de trabajo para agentes. |
| `README.md` | Descripción del proyecto y enlaces de sincronización y despliegue de v0/Vercel. |
| `.gitignore` | Patrones que Git debe ignorar en el repositorio. |
| `components.json` | Configuración de shadcn/ui para componentes y estilos. |
| `eslint.config.mjs` | Configuración de ESLint para el proyecto web. |
| `next.config.mjs` | Configuración de Next.js. |
| `package.json` | Dependencias y comandos de desarrollo, lint, build y ejecución web. |
| `pnpm-lock.yaml` | Versiones resueltas de dependencias del workspace pnpm. |
| `pnpm-workspace.yaml` | Definición de paquetes incluidos en el workspace pnpm. |
| `postcss.config.mjs` | Plugins de PostCSS usados por estilos web. |
| `tsconfig.json` | Opciones del compilador TypeScript web. |

### Datos y contratos compartidos

| Archivo | Descripción |
|---|---|
| `mobile/shared/package.json` | Paquete local consumido por Next.js y Expo. |
| `mobile/shared/src/api.ts` | Rutas y contratos de las operaciones API compartidas. |
| `mobile/shared/src/content.ts` | Fuente común del contenido de lecciones, consejos y preguntas rápidas. |
| `mobile/shared/src/index.ts` | Exportaciones públicas del paquete compartido. |
| `mobile/shared/src/profile.ts` | Modelo de perfil y valores iniciales comunes. |
| `mobile/shared/src/progress.ts` | Reglas para combinar progreso local y de cuenta. |

## Instrucciones y documentación

| Archivo | Descripción |
|---|---|
| `.agents/INDEX.md` | Este inventario de archivos del proyecto. |
| `.agents/docs/ux-learning-resources.md` | Videos y referencias de estudio sobre UX y aprendizaje. |
| `.agents/skills/boomer-ai-prompt-coach/SKILL.md` | Guía de respuestas y coaching de prompts orientados al aprendizaje de Boomer AI. |
| `.agents/skills/boomer-ai-ux/SKILL.md` | Guía de diseño y evaluación UX específica del producto. |
| `.agents/skills/boomer-ai-ux/references/design-principles.md` | Principios de diseño referenciados por la habilidad UX. |
| `.atl/skill-registry.md` | Registro local de habilidades y sus referencias. |

## Aplicación web: rutas y páginas

| Archivo | Descripción |
|---|---|
| `app/layout.tsx` | Layout raíz, metadatos y proveedores globales de Next.js. |
| `app/page.tsx` | Entrada principal de la aplicación web. |
| `app/globals.css` | Estilos globales y configuración visual de la aplicación web. |
| `app/privacy/page.tsx` | Página de política de privacidad. |
| `app/support/page.tsx` | Página de soporte y ayuda. |
| `app/terms/page.tsx` | Página de términos del servicio. |
| `app/workwithus/page.tsx` | Página para trabajar o colaborar con el equipo. |

### API web

| Archivo | Descripción |
|---|---|
| `app/api/auth/delete/route.ts` | Endpoint para eliminar una cuenta o usuario autenticado. |
| `app/api/auth/login/route.ts` | Endpoint de inicio de sesión. |
| `app/api/auth/me/route.ts` | Endpoint para recuperar los datos de la sesión/usuario actual. |
| `app/api/auth/signup/route.ts` | Endpoint de registro de usuario. |
| `app/api/auth/update-stars/route.ts` | Endpoint para actualizar estrellas del usuario. |
| `app/api/chat/route.ts` | Endpoint de conversación con IA mediante el proveedor configurado y moderación de contenido. |
| `app/api/chat-grok/route.ts` | Endpoint de chat con Grok, con soporte para imagen capturada. |
| `app/api/chat-openrouter/route.ts` | Endpoint de chat que envía solicitudes a modelos de OpenRouter. |
| `app/api/conversations/route.ts` | Endpoints para listar, leer, guardar y eliminar conversaciones. |
| `app/api/generate-image/route.ts` | Endpoint de generación de imágenes. |
| `app/api/improve-prompt/route.ts` | Endpoint para sugerir una versión mejorada de un prompt. |
| `app/api/profile/route.ts` | Endpoints para leer y guardar perfiles asociados al dispositivo. |
| `app/api/redeem/route.ts` | Endpoint para validar y canjear códigos de acceso/Pro. |
| `app/api/tts/route.ts` | Endpoint de texto a voz que conecta con ElevenLabs. |

### Componentes web

| Archivo | Descripción |
|---|---|
| `components/theme-provider.tsx` | Proveedor de tema visual de la aplicación. |
| `components/ui/button.tsx` | Componente base de botón y variantes. |
| `components/ui/input.tsx` | Componente base de campo de entrada. |
| `components/boomer-ai/age-selection.tsx` | Paso de selección de edad dentro del perfil/onboarding. |
| `components/boomer-ai/ai-art-tab.tsx` | Interfaz de creación de imágenes con IA. |
| `components/boomer-ai/ai-chat-interface.tsx` | Interfaz reutilizable de chat con IA. |
| `components/boomer-ai/auth-screen.tsx` | Pantalla de acceso y registro. |
| `components/boomer-ai/avatar-selection.tsx` | Selector de avatar de perfil. |
| `components/boomer-ai/camera-modal.tsx` | Modal para capturar o adjuntar una imagen al flujo de chat. |
| `components/boomer-ai/celebration-modal.tsx` | Modal de reconocimiento al completar una actividad. |
| `components/boomer-ai/chat-history-view.tsx` | Vista del historial de conversaciones. |
| `components/boomer-ai/chat-tab.tsx` | Pestaña de chat de la aplicación. |
| `components/boomer-ai/header.tsx` | Encabezado principal de la aplicación. |
| `components/boomer-ai/home-tab.tsx` | Inicio y accesos principales de aprendizaje. |
| `components/boomer-ai/learning-level.tsx` | Selector o presentación del nivel de aprendizaje. |
| `components/boomer-ai/lesson-view.tsx` | Vista del contenido de una lección. |
| `components/boomer-ai/lessons-tab.tsx` | Pestaña de listado de lecciones. |
| `components/boomer-ai/main-app.tsx` | Contenedor y coordinación de vistas principales de la app web. |
| `components/boomer-ai/main-menu.tsx` | Menú de navegación principal. |
| `components/boomer-ai/play-tab.tsx` | Pestaña de actividades de juego/práctica. |
| `components/boomer-ai/profile-view.tsx` | Vista y edición del perfil del usuario. |
| `components/boomer-ai/questions-tab.tsx` | Pestaña de preguntas y respuestas rápidas. |
| `components/boomer-ai/quick-questions.tsx` | Componente de preguntas rápidas sugeridas. |
| `components/boomer-ai/quiz.tsx` | Flujo de cuestionario o práctica guiada. |
| `components/boomer-ai/stepper.tsx` | Indicador y controles de pasos secuenciales. |
| `components/boomer-ai/tips-tab.tsx` | Pestaña con consejos de uso de IA. |
| `components/boomer-ai/voice-assistant.tsx` | Interfaz del asistente de voz. |
| `components/boomer-ai/voice-chat-tab.tsx` | Pestaña de conversación por voz. |

### Estado, servicios y estilos web

| Archivo | Descripción |
|---|---|
| `contexts/user-context.tsx` | Contexto React para compartir el estado del usuario en la web. |
| `lib/auth-service.ts` | Funciones cliente para registro, acceso y sesión de usuario. |
| `lib/content-moderation.ts` | Términos y utilidades de filtrado de contenido. |
| `lib/db-service.ts` | Capa de persistencia de datos del usuario usada por la web. |
| `lib/neon-client.ts` | Cliente de conexión a Neon Postgres desde el servidor. |
| `lib/utils.ts` | Utilidades compartidas; incluye composición y combinación de clases CSS. |
| `styles/globals.css` | Hoja de estilos global complementaria. |

## Aplicación móvil (Expo / React Native)

| Archivo | Descripción |
|---|---|
| `mobile/README.md` | Guía de la app móvil, suscripciones y configuración de RevenueCat/App Store. |
| `mobile/.gitignore` | Patrones ignorados por Git en el proyecto móvil. |
| `mobile/.env.example` | Plantilla de variables de entorno móvil; no contiene valores de producción. |
| `mobile/app.json` | Configuración de Expo, identificadores y valores públicos de la app. |
| `mobile/babel.config.js` | Configuración Babel, incluyendo resolución de módulos. |
| `mobile/eas.json` | Perfiles y ajustes de compilación de Expo Application Services. |
| `mobile/package.json` | Dependencias y comandos de Expo/React Native. |
| `mobile/package-lock.json` | Versiones resueltas de dependencias npm de la app móvil. |
| `mobile/tsconfig.json` | Opciones TypeScript para móvil. |
| `mobile/credentials.json` | Archivo de credenciales de publicación móvil; contiene información sensible. |
| `mobile/docs/REVENUECAT_SETUP.md` | Pasos de configuración de productos, entitlement y pruebas de RevenueCat. |

### Navegación y pantallas móviles

| Archivo | Descripción |
|---|---|
| `mobile/app/_layout.tsx` | Layout raíz de Expo Router y proveedores globales. |
| `mobile/app/index.tsx` | Ruta de entrada y redirección inicial de la aplicación. |
| `mobile/app/login.tsx` | Pantalla móvil de acceso a cuenta. |
| `mobile/app/onboarding/index.tsx` | Flujo de bienvenida y configuración inicial del perfil. |
| `mobile/app/paywall.tsx` | Pantalla de suscripción y restauración de compras. |
| `mobile/app/image-gen.tsx` | Pantalla móvil para generar imágenes. |
| `mobile/app/quick-questions.tsx` | Pantalla móvil de preguntas rápidas. |
| `mobile/app/voice.tsx` | Pantalla móvil de interacción por voz. |
| `mobile/app/(tabs)/_layout.tsx` | Layout y navegación de pestañas principales. |
| `mobile/app/(tabs)/index.tsx` | Pantalla de inicio dentro de las pestañas. |
| `mobile/app/(tabs)/chat.tsx` | Pantalla de conversación escrita. |
| `mobile/app/(tabs)/lessons.tsx` | Lista de lecciones de aprendizaje. |
| `mobile/app/(tabs)/profile.tsx` | Perfil y preferencias del usuario. |
| `mobile/app/(tabs)/tips.tsx` | Consejos y recursos breves. |
| `mobile/app/lesson/[id].tsx` | Ruta dinámica para mostrar una lección por identificador. |

### Servicios, contexto y UI móviles

| Archivo | Descripción |
|---|---|
| `mobile/src/api/auth.ts` | Cliente de API móvil para registro, acceso, cuenta y canje de códigos. |
| `mobile/src/api/chat.ts` | Cliente para enviar mensajes y consumir respuestas del endpoint de chat. |
| `mobile/src/api/client.ts` | Capa HTTP común para solicitudes al backend Next.js. |
| `mobile/src/api/conversations.ts` | Operaciones de lectura, guardado y borrado de conversaciones. |
| `mobile/src/api/images.ts` | Operaciones de generación de imagen y mejora de prompts. |
| `mobile/src/api/index.ts` | Exportaciones agrupadas de clientes API. |
| `mobile/src/api/profile.ts` | Lectura y sincronización del perfil por dispositivo. |
| `mobile/src/components/AnimatedPressable.tsx` | Control táctil con respuesta animada. |
| `mobile/src/components/Button.tsx` | Botón reutilizable móvil. |
| `mobile/src/components/GradientTile.tsx` | Tarjeta visual reutilizable con fondo en degradado. |
| `mobile/src/components/InfoBanner.tsx` | Banner para información o avisos en pantalla. |
| `mobile/src/components/Screen.tsx` | Contenedor de pantalla con estructura y áreas seguras. |
| `mobile/src/components/Skeleton.tsx` | Marcador visual de carga para contenido. |
| `mobile/src/components/StarBadge.tsx` | Presentación de la cantidad de estrellas del perfil. |
| `mobile/src/components/SuccessCelebration.tsx` | Reconocimiento visual de una acción completada. |
| `mobile/src/config/env.ts` | Lectura y validación de configuración pública móvil. |
| `mobile/src/context/AuthContext.tsx` | Estado de cuenta y autenticación en React Native. |
| `mobile/src/context/EntitlementContext.tsx` | Estado de acceso Pro combinando compras y cuenta. |
| `mobile/src/context/ProfileContext.tsx` | Estado del perfil, carga remota y caché local. |
| `mobile/src/context/purchases.ts` | Integración de RevenueCat y operaciones de compra. |
| `mobile/src/context/storage.ts` | Identificador de dispositivo y persistencia AsyncStorage. |
| `mobile/src/data/content.ts` | Puente de compatibilidad móvil hacia el contenido compartido. |
| `mobile/src/data/progress.test.ts` | Cobertura para la unión del progreso local y el de cuenta. |
| `mobile/src/lib/freeTier.ts` | Reglas y límites de uso del nivel gratuito. |
| `mobile/src/screens/pendingPrompt.ts` | Estado auxiliar para conservar un prompt pendiente. |
| `mobile/src/screens/useChat.ts` | Hook que coordina estado, envío y recepción de mensajes. |
| `mobile/src/theme/theme.ts` | Tokens y configuración del tema visual móvil. |
| `mobile/src/types/index.ts` | Tipos TypeScript y valores iniciales compartidos de móvil. |

### Recursos gráficos móviles

| Archivo | Descripción |
|---|---|
| `mobile/assets/adaptive-icon.png` | Icono adaptable de Android. |
| `mobile/assets/favicon.png` | Favicon de la versión web servida por Expo. |
| `mobile/assets/icon.png` | Icono principal de la aplicación móvil. |
| `mobile/assets/splash.png` | Imagen de la pantalla de inicio. |

### Proyecto nativo iOS

| Archivo | Descripción |
|---|---|
| `mobile/ios/.gitignore` | Patrones ignorados para el proyecto iOS. |
| `mobile/ios/.xcode.env` | Ajustes de entorno de compilación de Xcode. |
| `mobile/ios/BoomerAI.storekit` | Configuración local de StoreKit para probar compras. |
| `mobile/ios/Gemfile` | Dependencias Ruby usadas por herramientas iOS/Fastlane. |
| `mobile/ios/Podfile` | Configuración de CocoaPods para dependencias nativas. |
| `mobile/ios/Podfile.properties.json` | Propiedades de generación del proyecto CocoaPods/Expo. |
| `mobile/ios/BoomerAI.xcodeproj/project.pbxproj` | Configuración del proyecto Xcode. |
| `mobile/ios/BoomerAI.xcodeproj/xcshareddata/xcschemes/BoomerAI.xcscheme` | Esquema compartido de ejecución y compilación en Xcode. |
| `mobile/ios/BoomerAI/AppDelegate.h` | Declaración del delegado de la aplicación iOS. |
| `mobile/ios/BoomerAI/AppDelegate.mm` | Inicialización nativa de React Native/Expo en iOS. |
| `mobile/ios/BoomerAI/BoomerAI-Bridging-Header.h` | Cabecera puente para interoperabilidad Swift/Objective-C. |
| `mobile/ios/BoomerAI/BoomerAI.entitlements` | Capacidades y permisos de firma de la app iOS. |
| `mobile/ios/BoomerAI/Info.plist` | Metadatos y claves de configuración de la app iOS. |
| `mobile/ios/BoomerAI/SplashScreen.storyboard` | Storyboard de lanzamiento nativo. |
| `mobile/ios/BoomerAI/Supporting/Expo.plist` | Configuración de Expo para el destino iOS. |
| `mobile/ios/BoomerAI/main.m` | Punto de entrada Objective-C de la app iOS. |
| `mobile/ios/BoomerAI/noop-file.swift` | Archivo Swift vacío requerido por la configuración del proyecto. |
| `mobile/ios/BoomerAI/Images.xcassets/Contents.json` | Índice del catálogo de recursos gráficos de iOS. |
| `mobile/ios/BoomerAI/Images.xcassets/AppIcon.appiconset/Contents.json` | Declaración de tamaños y variantes del icono iOS. |
| `mobile/ios/BoomerAI/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png` | Imagen maestra del icono de App Store. |
| `mobile/ios/BoomerAI/Images.xcassets/SplashScreenBackground.colorset/Contents.json` | Color de fondo del lanzamiento iOS. |
| `mobile/ios/BoomerAI/Images.xcassets/SplashScreenLogo.imageset/Contents.json` | Variantes de resolución del logo de inicio. |
| `mobile/ios/BoomerAI/Images.xcassets/SplashScreenLogo.imageset/image.png` | Logo de inicio en resolución base. |
| `mobile/ios/BoomerAI/Images.xcassets/SplashScreenLogo.imageset/image@2x.png` | Logo de inicio en resolución 2x. |
| `mobile/ios/BoomerAI/Images.xcassets/SplashScreenLogo.imageset/image@3x.png` | Logo de inicio en resolución 3x. |
| `mobile/ios/fastlane/.gitignore` | Patrones ignorados por Fastlane. |
| `mobile/ios/fastlane/Appfile` | Identificadores de aplicación para Fastlane. |
| `mobile/ios/fastlane/Fastfile` | Tareas de automatización de compilación/publicación iOS. |
| `mobile/ios/fastlane/Matchfile` | Configuración de administración de certificados de firma. |
| `mobile/ios-creds/boomerai_appstore.mobileprovision` | Perfil de aprovisionamiento de App Store; archivo sensible de firma. |

## Backend, base de datos y automatización

| Archivo | Descripción |
|---|---|
| `.github/workflows/testflight.yml` | Workflow de GitHub Actions para el proceso de TestFlight. |
| `ci_scripts/ci_post_clone.sh` | Script posterior al clonado de CI para preparar la compilación. |
| `scripts/001-create-boomer-profiles-table.sql` | SQL para crear la tabla de perfiles de Boomer AI. |
| `scripts/001-create-users-table.sql` | SQL para crear la tabla de usuarios. |
| `scripts/002-create-conversations-table.sql` | SQL para crear la tabla de conversaciones. |
| `scripts/003-add-ip-tracking.sql` | SQL para añadir seguimiento de direcciones IP. |
| `scripts/004-create-access-codes-and-pro.sql` | SQL para códigos de acceso y datos de entitlement Pro. |
| `scripts/generate-access-code.mjs` | Script para generar códigos de acceso. |

## Recursos públicos web

| Archivo | Descripción |
|---|---|
| `public/apple-icon.png` | Icono Apple Touch para dispositivos iOS. |
| `public/boomer-ai-logo.png` | Logotipo rasterizado de Boomer AI. |
| `public/friendly-ai-assistant-avatar-robot-face.jpg` | Imagen de avatar ilustrado para el asistente. |
| `public/icon-dark-32x32.png` | Icono de 32 px para contexto oscuro. |
| `public/icon-light-32x32.png` | Icono de 32 px para contexto claro. |
| `public/icon.svg` | Icono vectorial del sitio. |
| `public/manifest.json` | Metadatos de la aplicación web instalable (PWA). |
| `public/placeholder-logo.png` | Imagen genérica de reemplazo para un logotipo. |
| `public/placeholder-logo.svg` | Variante SVG del logotipo de reemplazo. |
| `public/placeholder-user.jpg` | Imagen genérica de reemplazo para usuario. |
| `public/placeholder.jpg` | Imagen genérica de reemplazo. |
| `public/placeholder.svg` | Imagen vectorial genérica de reemplazo. |
| `public/voice-assistant-avatar.jpg` | Avatar usado en la experiencia del asistente de voz. |
