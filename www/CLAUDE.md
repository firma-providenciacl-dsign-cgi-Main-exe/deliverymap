# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

DeliveryMap is a mobile-first Progressive Web App for Chilean food delivery riders ("riders") to find the exact pickup location of restaurants and dark kitchens — correct floor, entrance, door color, etc. The app is in Spanish. It is deployed at https://deliverymap.cl.

## Development

There is no build system. Files are served directly as static HTML. To develop:
- Open any `.html` file in a browser (or use a static server like `npx serve .`)
- Edit and refresh — no compilation step

To run locally with live reload: `npx serve . -p 3000` from this directory.

## Architecture

**Stack**: Vanilla HTML + CSS + JS only. No framework, no bundler, no dependencies to install.

**Backend**: Supabase (PostgreSQL + Auth + Storage), accessed entirely via direct REST API calls from the client. The Supabase anon key is in `supabase.js` and also duplicated inline in most pages.

**Map**: Leaflet.js v1.9.4 (CDN) with CartoDB Dark tile layer.

### Page structure

| File | Purpose |
|---|---|
| `index.html` | Landing page — cyberpunk aesthetic, intercepts `?type=recovery` hash |
| `app.html` | Main app — Leaflet map, search bar, draggable bottom sheet for local details, likes/comments |
| `login.html` | Email+password login, Google OAuth |
| `registro.html` | Sign-up with apodo (nickname) |
| `perfil.html` | Own profile — edit apodo, photo upload, notifications, stats |
| `perfil-publico.html` | Public read-only profile view (Steam-inspired UI) |
| `sugerir.html` | Form to suggest a new location |
| `cambiar-password.html` | Password reset (receives Supabase recovery hash) |
| `panel.html` | Admin panel |
| `supabase.js` | Shared globals: `SUPABASE_URL`, `SUPABASE_KEY`, `buscarEnSupabase()` |
| `locales.js` | Static fallback array of locations (legacy, mostly replaced by Supabase) |

### Supabase database tables

- `locales` — `id, nombre, comuna, nota, lat, lng, actualizado_en`
- `local_fotos` — `local_id, url`
- `likes` — `local_id, user_id, tipo` ('like' | 'dislike')
- `comentarios` — `local_id, user_id, apodo, texto, creado_en`
- `reportes` — error reports on locales
- `reportes_comentarios` — UNIQUE(comentario_id, user_id) for dedup
- `sugerencias` — `nombre, comuna, nota, estado, fecha, user_id`
- `perfiles` — `user_id, foto_url, apodo, badge`
- `notificaciones` — `user_id, tipo, mensaje, leida, creado_en`
- `config` — key/value store (e.g. `ultimo_delivery_num` for auto-generating apodos)

### Auth pattern

Sessions are stored in `localStorage` under three keys:
- `dm_token` — JWT access token
- `dm_user` — serialized user object (includes `expires_at`, `user_metadata.apodo`)
- `dm_refresh` — refresh token

Every page that requires auth reads these keys on load and redirects to `login.html` if missing. Token refresh (via Supabase's `grant_type=refresh_token`) is done manually before API calls in `perfil.html` and `app.html`.

### CSS design system

All pages use a dark color scheme. Key colors (defined as CSS vars in `index.html`, inlined elsewhere):
- `#4a90e2` — primary blue / neon
- `#ff00cc` — magenta accent (used in `app.html` splash and branding)
- `#0a0a0a` / `#070d1a` — backgrounds
- `#ff4444` — danger/error red

Two UI themes exist: the main dark/neon theme (most pages) and a Steam-inspired theme (`perfil-publico.html`, `cambiar-password.html`) using `#1b2838` backgrounds.

### Key implementation notes

- The bottom sheet in `app.html` uses CSS `transform: translateY()` instead of `bottom` for smooth drag — don't change it to use `bottom` positioning.
- `supabase.js` defines `SUPABASE_URL`/`SUPABASE_KEY` as globals, but most pages also redefine them inline. When editing a page, use the inline constants.
- `app.html` uses a `supaFetch()` helper that auto-injects auth headers — use it for authenticated calls inside that page.
- Google OAuth redirect target is hardcoded to `https://deliverymap.cl/app.html` — the local redirect will not work during development.
- Avatar photos are uploaded to Supabase Storage bucket `Avatares` with upsert (`x-upsert: true`), keyed by `userId.ext`.
- Account deletion uses a Supabase RPC `eliminar_cuenta_propia` — it must exist as a database function.
