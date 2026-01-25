# PRD — REPLAY

**Tagline:** Discover. Watch. Remember.
**Product Soul:** Personal Movie Companion

---

## 1. Overview

**REPLAY** adalah sebuah website progressive web app (PWA) yang berfungsi sebagai *personal movie companion*. Produk ini membantu pengguna untuk:

* Menemukan film & serial yang relevan.
* Menyimpan daftar tontonan.
* Mengelola histori menonton.
* Mengingat kembali film yang pernah ditonton.
* Melakukan tracking preferensi secara visual, rapi, dan personal.

Fokus utama REPLAY adalah **experience yang clean, smooth, dan personal**, bukan sekadar database film.

---

## 2. Goals & Objectives

### 2.1 Product Goals

1. Menjadi **media personal tracking film** yang nyaman dan memorable.
2. Menyediakan **UI/UX yang elegan, ringan, dan smooth**.
3. Menjadi platform **movie journaling** personal.
4. Menyediakan filtering dan discovery yang detail.

### 2.2 Success Metrics (KPIs)

* Daily Active Users (DAU)
* Retention 7 / 30 hari
* Jumlah movie yang disimpan per user
* Session duration
* Conversion login (guest → google login)

---

## 3. Target Users

### Primary

* Movie enthusiast
* Casual watcher
* People who love tracking & journaling

### Secondary

* Content creator
* Film reviewer
* Cinephile

---

## 4. Core Value Proposition

> **REPLAY membantu kamu membangun memori tontonanmu secara rapi, personal, dan indah.**

* Tidak hanya *watchlist*, tapi **movie memory vault**.
* UI yang **minimal, elegan, dan smooth**.
* Fokus ke **kenyamanan jangka panjang**.

---

## 5. Product Principles

1. **Personal First** — pengalaman personal lebih penting dari fitur sosial.
2. **Clarity Over Density** — informasi banyak tapi tetap ringan.
3. **Smooth Experience** — animasi, transisi, dan interaksi harus lembut.
4. **Minimal but Expressive** — desain sederhana namun berkarakter.

---

## 6. Feature Scope

### 6.1 Landing Page

**Tujuan:**

* Menjelaskan value REPLAY dalam 5–7 detik pertama.

**Komponen:**

1. Hero Section

   * Headline: *Discover. Watch. Remember.*
   * Subheadline: Personal movie companion for your daily watch life
   * CTA: `Get Started`, `Login with Google`

2. Feature Highlights

   * Save & Track
   * Discover & Filter
   * Build Your Movie Memory

3. Visual Preview

   * Mock UI card layout

4. Tech Trust Section

   * Powered by TMDB, IMDb, Watchmode

5. Footer

   * About
   * Privacy Policy
   * Contact

---

### 6.2 Authentication

**Login Methods:**

* Google OAuth

**Behavior:**

* Guest browsing allowed
* Login required for:

  * Save movie
  * Add to watchlist
  * History tracking

**Stack:**

* Supabase Auth

---

### 6.3 Card-based Movie Layout

**Principle:**

> Semua informasi film disajikan dalam bentuk **card modular**.

**Card Structure:**

* Poster
* Title
* Year
* Rating
* Streaming service badges
* Quick action buttons:

  * ➕ Save
  * ❤️ Favorite
  * 👁 Watched

**Detail Card (Expanded):**

* Sinopsis
* Genre
* Runtime
* Cast
* Trailer preview
* Streaming providers

---

### 6.4 Movie Management

**List Types:**

1. Watchlist
2. Watched
3. Favorites
4. History

**Actions:**

* Add
* Remove
* Undo (toast popup)
* Mark watched
* Re-watch log

**Undo UX:**

* Toast bottom-center
* 5s timeout
* One-click undo

---

### 6.5 Advanced Filtering & Discovery

**Filters:**

* Streaming Service (Netflix, Prime, Disney+, dll)
* Genre
* Year
* Rating
* Popularity

**Discovery Sections:**

* Trending
* Popular Today
* Top Rated
* Hidden Gems

**Sorting:**

* Latest
* Highest rating
* Most popular

---

### 6.6 Search

* Instant search
* Debounced input
* Multi-source fetch

---

### 6.7 Progressive Web App (PWA)

* Offline cache
* Add to home screen
* Splash screen
* Push notification (future scope)

---

## 7. UX & UI Guidelines

### 7.1 Design Style

**Theme:**

* Monochrome
* Dark: night tone (deep blue / charcoal)
* Light: soft white (not pure white)

**Example Palette:**

* Dark base: #0E1116
* Card background: #161B22
* Accent: #8A8A8A
* Text light: #E6E6E6
* Text muted: #9CA3AF

---

### 7.2 Layout Principles

* Card-based
* Grid system
* Consistent spacing
* No text overflow
* No button overlap

---

### 7.3 Animations

**Rules:**

* 200–350ms transition
* Ease-in-out
* Motion should guide focus

**Use Cases:**

* Card hover
* Page transition
* Modal open/close
* Toast appearance

---

### 7.4 Interaction UX

* All actions must have feedback
* Loading skeleton
* Smooth transitions
* Zero layout jump

---

## 8. Technical Architecture

### 8.1 Tech Stack

* Frontend: Next.js + Tailwind + Framer Motion
* Backend: Supabase
* Hosting: Vercel
* API Integration: TMDB, IMDb, Watchmode

---

### 8.2 Folder Structure (Clean Architecture)

```
/src
  /app
  /components
  /modules
  /services
  /hooks
  /lib
  /styles
  /types
```

---

### 8.3 API Layer

**Sources:**

* TMDB → metadata, poster, trending
* IMDb → rating enrichment
* Watchmode → streaming providers

**Flow:**

External API → Internal Service Layer → UI

---

### 8.4 Data Model (High Level)

**User**

* id
* email
* name

**Movie**

* id
* title
* year
* poster
* genres

**UserMovie**

* status (watchlist, watched, favorite)
* watched_at
* rating
* notes

---

## 9. Performance & Optimization

* API caching
* Lazy loading images
* Skeleton loaders
* ISR / SSR hybrid
* CDN delivery

---

## 10. Security

* OAuth via Supabase
* Rate limiting API
* Secure env handling
* Token-based auth

---

## 11. Future Scope

* Movie diary
* Mood-based recommendation
* Timeline visualization
* AI recommendation

---

## 12. Milestone Plan

### Phase 1 — MVP

* Landing
* Auth
* Card list
* Save + watchlist
* Basic filter

### Phase 2 — Enhancement

* Advanced filters
* PWA
* Smooth animation

### Phase 3 — Intelligence

* Recommendation
* Analytics
* Memory visualization

---

## 13. Definition of Done

* UI smooth
* No layout breaking
* Responsive
* Lighthouse > 90
* Error-free API calls

---

## 14. Product Vibe

> Calm. Personal. Elegant. Smooth. Nostalgic.

---

**REPLAY is not about watching more movies — it's about remembering them better.**
