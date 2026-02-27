# FareShare — Full Project Plan

**Company:** FareShare
**Product:** FareShare
**Status:** Design complete (10 screens in `carshare.pen`), frontend build ready to start
**Last updated:** 2026-02-27

---

## 1. What Is FareShare?

A local carshare/rideshare platform for the **Ericeira ↔ Lisbon corridor** in Portugal.

People living in Ericeira regularly need rides to Lisbon and back. Rather than relying on expensive Uber/Bolt rides or trying to coordinate via WhatsApp groups, FareShare provides a simple bulletin board where drivers post available rides, passengers claim seats, and anyone can post a request for a ride they need.

It is not a taxi service. It is not Uber. It is a community tool where drivers share their existing journeys and passengers contribute a suggested donation toward fuel costs.

### Core Concept

- **Drivers** post rides they're already making (e.g., "Ericeira → Lisbon, Today 4-6pm, 4 seats available, ~€10 donation suggested")
- **Passengers** browse available rides, claim seats, and optionally donate toward fuel
- **Anyone** can post a **request** (e.g., "Need a ride Lisbon → Ericeira on Saturday afternoon") which drivers can then respond to
- **Dashboard** shows you everything in one place: rides you're driving, seats you've claimed, requests you've posted

### What It Is Not

- Not a ride-hailing service (no real-time GPS, no matching algorithm)
- Not a gig economy platform (no commission, no rating system)
- Not trying to compete with Uber/Bolt on convenience — solving a different problem

---

## 2. Philosophy & Principles

From the original project mindmaps:

- **No VC** — This is a local tool, not a growth-at-all-costs startup
- **No marketing** — Word of mouth, physical cards distributed to locals/arrivals
- **Local solution** — Built for the Ericeira community specifically
- **Solve for passengers** — Make it simple to find and claim rides
- **Solve for drivers** — Help them offset fuel costs by filling empty seats
- **Grassroots acquisition** — 1-by-1 driver onboarding, physical presence in the community

### Design Principles

- **Clean** — Not corporate
- **Simple** — Subtle gritty/coastal/culture/edgy aesthetic
- **Not too minimal, but slick** — Has personality without sacrificing usability

---

## 3. User Types

| User Type | Description | What They Do |
|-----------|-------------|--------------|
| **Driver (private car owner)** | Anyone who owns a car and drives the Ericeira ↔ Lisbon route | Posts rides, accepts passengers, sets suggested donation |
| **Driver (ex-Uber/Bolt)** | Professional drivers who prefer a local, commission-free platform | Same as above, potentially more frequent |
| **Passenger** | Anyone who needs a ride | Browses rides, claims seats, posts requests, donates toward fuel |

A single user can be both a driver and a passenger depending on the situation.

### Pricing Model (from mindmaps)

Suggested donation guidelines based on passengers:
- 1 passenger: ~€20
- 2 passengers: ~€30
- 3 passengers: ~€35
- 4 passengers: ~€40

These are **suggestions**, not enforced prices. The app shows "~€X donation" per ride — drivers set this when posting.

---

## 4. Product Versions

### V1: Bulletin Board (Current Build)

A simple chronological bulletin board of rides and requests. Manual browsing, manual claiming. No matching algorithm, no chat, no real-time features.

**This is what we are building now.**

### V2: LLM-Powered (Future)

A conversational AI interface where:
- Passengers describe what they need in natural language
- The system presents matching ride options
- Chat-style confirmation flow between passenger and driver
- Supports voice, text, and windowed interaction modes

**V2 is not in scope. Do not build toward it. V1 must work standalone.**

---

## 5. Brand & Design System

### Brand Identity

| Property | Value |
|----------|-------|
| Company name | FareShare |
| Product name | FareShare |
| Design system | Stencil Punk (Lavender variation) |
| Aesthetic | Dark, edgy, coastal punk — sharp corners, monospace-influenced labels, bold uppercase headings |

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#141414` | All screen backgrounds |
| Card bg | `#1E1E1E` | Card/surface backgrounds |
| Hover bg | `#2A2A2A` | Hover states |
| Text primary | `#FAFAFA` | Headings, primary content |
| Text muted | `#A0A0A0` | Secondary info, meta text |
| Text dim | `#6B6B6B` | Labels, placeholders, tertiary text |
| Accent | `#B898D0` | Buttons, active tabs, links, lavender highlight |
| Accent hover | `#C9ADE0` | Button/link hover states |
| Accent muted | `#B898D018` | Badge backgrounds, subtle highlights (with alpha) |
| Danger | `#EF4444` | Delete button, error states |
| Status open | `#4ADE80` | "OPEN" badge — seats available |
| Status open bg | `#4ADE8018` | "OPEN" badge background |
| Status full | `#FBBF24` | "FULL" badge — no seats left |
| Status full bg | `#FBBF2418` | "FULL" badge background |
| Border | `#2A2B30` | All borders, dividers, input outlines |

### Typography

| Role | Font | Weight | Style |
|------|------|--------|-------|
| Headings (all) | Bebas Neue | Bold (400 — it only has one weight) | Always UPPERCASE |
| Body text | Space Grotesk | 400 (regular) / 500 (medium) / 600 (semibold) / 700 (bold) | Normal case |
| Labels | Space Grotesk | 600 (semibold) | UPPERCASE, letter-spacing 1px |

### Specific Font Sizes (from designs)

| Context | Font | Size | Weight | Extras |
|---------|------|------|--------|--------|
| App brand "FARESHARE" (header) | Bebas Neue | 24px | Bold | letter-spacing: 2px |
| App brand "FARESHARE" (auth screens) | Bebas Neue | 48px | Bold | letter-spacing: 4px |
| Page title (POST A RIDE, etc.) | Bebas Neue | 32px | Bold | letter-spacing: 1px |
| Route title (detail view) | Bebas Neue | 28px | Bold | letter-spacing: 1px |
| Dashboard title | Bebas Neue | 28px | Bold | letter-spacing: 1px |
| Primary button text | Bebas Neue | 18px | Bold | letter-spacing: 2px |
| Route text (card) | Space Grotesk | 15px | 700 | letter-spacing: -0.3px |
| Info box value | Space Grotesk | 16px | 700 | — |
| Driver name | Space Grotesk | 15px | 600 | — |
| Body/meta text | Space Grotesk | 12px | 400 | — |
| Donation amount (card) | Space Grotesk | 13px | 600 | — |
| Input placeholder | Space Grotesk | 14px | 400 | — |
| Field label | Space Grotesk | 11px | 600 | UPPERCASE, letter-spacing: 1px |
| Badge text | Space Grotesk | 10px | 700 | UPPERCASE, letter-spacing: 1px |
| Bottom nav label | Space Grotesk | 9px | 500/600 | UPPERCASE, letter-spacing: 1px |
| Tab text | Space Grotesk | 11px | 500/700 | UPPERCASE, letter-spacing: 1px |

### Spatial Rules

| Property | Value |
|----------|-------|
| Border radius | **0px everywhere** (Stencil Punk aesthetic — no rounded corners) |
| Exception | Notification dot only: `border-radius: 9999px` (full circle) |
| Screen size | 390 × 844px (iPhone-sized mobile) |
| Header padding | 20px 24px |
| Content area padding | 20px 24px (lists) / 28-32px 24px (detail/form pages) |
| Card padding | 16px all sides |
| Card gap (between cards) | 12px |
| Form field gap | 18px between fields |
| Form section gap | 28px between major sections |
| Input internal padding | 14px 16px |
| Label-to-input gap | 6px |
| Primary button padding | 16px 0 (vertical, full width) |
| Outlined button padding | 14px 0 or 10px 0 |
| Bottom nav padding | 14px 24px 28px 24px (extra bottom for safe area) |
| Tab padding | 14px 0, centered |
| Info box padding | 14px 16px, gap 6px internal |
| Info box gap | 12px between boxes |
| Driver card padding | 12px 16px, gap 14px between avatar and text |
| Seat squares | 44px × 44px, gap 8px |
| Passenger rows | padding 10px 14px, avatar 32px, gap 12px |
| Donation nudge | padding 10px 14px, gap 8px, heart icon 14px |

---

## 6. Screens (10 Total)

All screens are 390×844px mobile-first. Designed in `carshare.pen` using the Stencil Punk Lavender theme.

### Screen Map

```
AUTH
├── 1. Login          /login
└── 2. Signup         /signup

RIDES (Available tab)
├── 3. Rides List     /rides
├── 4. Ride Detail    /rides/[id]    (passenger view — "Claim a seat")
├── 5. Ride Detail    /rides/[id]    (driver view — "Edit" / "Delete")
├── 6. Post a Ride    /post/ride
└── 7. Edit Ride      /edit/ride/[id]

REQUESTS (Requests tab)
├── 8. Requests List  /requests
└── 9. Post a Request /post/request

DASHBOARD
└── 10. Dashboard     /dashboard
```

### Screen Details

#### Screen 1: Login (`/login`)

- Centered "FARESHARE" brand in Bebas Neue 48px with tagline "share the ride, split the vibe"
- Lavender accent line (60×3px) below brand
- EMAIL field (labeled input, placeholder "you@email.com")
- PASSWORD field (placeholder "••••••••")
- "SIGN IN" button — full-width, accent bg (#B898D0), dark text, Bebas Neue 18px
- "No account? **Sign up**" link — dim text with accent-colored "Sign up"
- No actual auth — button navigates to `/rides`

#### Screen 2: Signup (`/signup`)

- Same brand treatment as Login but tagline is "create your account"
- DISPLAY NAME field (placeholder "Your name")
- EMAIL field
- PASSWORD field
- "CREATE ACCOUNT" button — same style as Sign In
- "Already have an account? **Sign in**" link
- No actual auth — button navigates to `/rides`

#### Screen 3: Rides List (`/rides`)

**Header bar:**
- "FARESHARE" brand text (Bebas Neue 24px, letter-spacing 2px) left-aligned
- Notification dot (8×8px lavender circle) right-aligned
- Bottom border: 1px `#2A2B30`

**Tab bar:**
- AVAILABLE tab: filled accent bg (#B898D0), dark text, bold — active state
- REQUESTS tab: transparent bg, dim text, bottom border — inactive state
- Both tabs equal width, text centered

**Content area (scrollable):**
- 4 ride cards, each containing:
  - **Top row:** Route in bold ("ERICEIRA → LISBON") + Status badge (OPEN green / FULL yellow)
  - **Middle row:** Date/driver info in muted text ("Today, 4–6pm · Miguel R.")
  - **Bottom row:** Seats count in dim text ("2/4 seats") + Donation in accent ("~€10 donation")
- Cards have 1px border, 16px padding, 12px gap between cards
- Cards are tappable → navigate to `/rides/[id]`

**Bottom navigation:**
- Three items: RIDES (compass icon), POST (plus icon), YOU (user icon)
- RIDES is active: accent color for icon + text
- Others: dim color
- Icons: 22×22px Lucide icons
- Labels: 9px uppercase, letter-spacing 1px
- Top border: 1px `#2A2B30`

**Ride card data (from designs):**

| Route | Date/Driver | Seats | Donation | Status |
|-------|------------|-------|----------|--------|
| ERICEIRA → LISBON | Today, 4–6pm · Miguel R. | 2/4 | ~€10 | OPEN |
| LISBON → ERICEIRA | Tomorrow, 9am · Sara M. | 3/5 | ~€25 | OPEN |
| ERICEIRA → SINTRA | Friday, 2–4pm · João P. | 3/3 | ~€15 | FULL |
| MAFRA → LISBON | Monday, 7:30am · Tiago L. | 1/4 | ~€8 | OPEN |

#### Screen 4: Ride Detail — Passenger View (`/rides/[id]`)

Shown when the current user is NOT the ride's driver.

**Back header:** Arrow-left icon + "Ride Details" text

**Content sections (top to bottom):**

1. **Route block:** "ROUTE" label → "ERICEIRA → LISBON" in Bebas Neue 28px
2. **Info row (two boxes side by side):**
   - WHEN box: "WHEN" label → "Today" (bold 16px) → "4–6pm" (muted 12px). Border: `#2A2B30`
   - DONATION box: "DONATION" label → "~€10" (accent bold 16px) → "per seat" (muted 12px). Border: `#B898D0` (accent border)
3. **Driver section:** "DRIVER" label → driver card (40px accent avatar with initials "MR" + "Miguel R." name + "12 rides shared" meta)
4. **Passengers section:** "PASSENGERS (2/4)" label → row of 44×44px seat squares:
   - Filled seats: accent-muted bg with initials ("AK", "JL") in accent color
   - Empty seats: border-only with plus icon in dim color
5. **Actions:**
   - "CLAIM A SEAT" — full-width accent button (Bebas Neue 18px)
   - "MESSAGE DRIVER" — full-width outlined button (white border, Space Grotesk 13px)
   - Donation nudge: heart icon + "Driver suggests ~€10 donation per seat" on accent-muted bg

#### Screen 5: Ride Detail — Driver View (`/rides/[id]`)

Shown when the current user IS the ride's driver. Same route/info layout as passenger view.

**Differences from passenger view:**

- Back header says "Your Ride" instead of "Ride Details"
- No driver section (you ARE the driver)
- Passengers section shows rows instead of squares:
  - Each row: 32px avatar (accent-muted bg, initials) + passenger name (14px)
  - Empty row: centered "2 seats remaining" in dim text
- Actions:
  - "EDIT RIDE" — accent button with pencil icon + Bebas Neue text
  - "DELETE RIDE" — danger-outlined button (red border, red text, trash icon)

#### Screen 6: Post a Ride (`/post/ride`)

**Back header:** Arrow-left + "Back"

**Content:**

1. **Title:** "POST A RIDE" (Bebas Neue 32px) + "Share your journey with others" (dim 13px)
2. **Form fields (18px gap between fields):**
   - FROM — text input (placeholder "Departure location")
   - TO — text input (placeholder "Destination")
   - DATE + TIME — side-by-side half-width inputs (12px gap)
   - SEATS AVAILABLE — text input (value "4")
   - NOTE (OPTIONAL) — textarea 80px height (placeholder "Anything passengers should know?")
3. **Donation nudge:** heart icon + "Suggest a donation amount to help cover fuel costs" on accent-muted bg
4. **Submit:** "POST RIDE" full-width accent button

#### Screen 7: Edit Ride (`/edit/ride/[id]`)

Same form as Post a Ride but:
- Title: "EDIT RIDE" + "Update your ride details"
- All fields pre-filled with existing ride data (white text instead of dim placeholders)
- Pre-filled values: "Ericeira", "Lisbon", "27 Feb 2026", "4:00 PM", "4", "Leaving from the main square. Can pick up along the way."
- No donation nudge
- Two buttons:
  - "SAVE CHANGES" — accent button
  - "CANCEL" — outlined button (dim border, muted text)

#### Screen 8: Requests List (`/requests`)

Same shell as Rides List (Header + TabBar + BottomNav) but:
- REQUESTS tab is active (accent fill), AVAILABLE tab is inactive
- Content shows request cards instead of ride cards

**Request card structure:**
- Top row: Route (bold) + REQUEST badge (accent text on accent-muted bg)
- Mid row: Date preference / requester name (muted)
- Note row (optional): Full note text in dim color, wrapping
- "I CAN DO THIS" button — outlined in accent (accent border, accent text, 10px padding)

**Request card data:**

| Route | Date/Requester | Note |
|-------|---------------|------|
| LISBON → ERICEIRA | Saturday, afternoon preferred · Clara S. | Need to get back after visiting family. Flexible on exact time. |
| ERICEIRA → MAFRA | Monday, morning · Pedro T. | Doctor appointment at 10am. Can leave as early as 8. |
| SINTRA → ERICEIRA | Wednesday, evening · Marta F. | (none) |

#### Screen 9: Post a Request (`/post/request`)

**Back header:** Arrow-left + "Back"

**Content:**

1. **Title:** "POST A REQUEST" (Bebas Neue 32px) + "Let drivers know where you need to go" (dim 13px)
2. **Form fields:**
   - FROM (placeholder "Where are you?")
   - TO (placeholder "Where do you need to go?")
   - PREFERRED DATE + PREFERRED TIME — side-by-side half-width
   - NOTE (OPTIONAL) — textarea (placeholder "Any details to help a driver?")
3. **Submit:** "POST REQUEST" full-width accent button

#### Screen 10: Dashboard (`/dashboard`)

**Header:** "FARESHARE" brand + user avatar (32px accent square with "TS" initials)

**Content:**

1. **Title:** "YOUR DASHBOARD" (Bebas Neue 28px) + "Manage your rides, seats, and requests" (dim 13px)
2. **MY RIDES section:**
   - "MY RIDES" label (muted 11px, uppercase)
   - Card: "Ericeira → Lisbon" / "Today, 4–6pm · 2/4 seats" / OPEN badge (green)
3. **MY SEATS section:**
   - "MY SEATS" label
   - Card: "Lisbon → Ericeira" / "Tomorrow, 9am · Sara M. driving" / CONFIRMED badge (accent)
   - Card: "Ericeira → Sintra" / "Friday, 2–4pm · João P. driving" / FULL badge (yellow)
4. **MY REQUESTS section:**
   - "MY REQUESTS" label
   - Card: "Mafra → Ericeira" / "Next week, flexible" / PENDING badge (accent)

**Bottom nav:** YOU tab active (accent), RIDES + POST inactive (dim)

**Dashboard card structure:** Compact row — left side has route (14px semibold) + meta (11px muted) stacked, right side has status badge.

---

## 7. Technical Implementation Plan

### Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router) | TypeScript, `src/` directory |
| Styling | Tailwind CSS | Custom theme with design tokens |
| Icons | Lucide React | Already used in designs |
| Fonts | Google Fonts via `next/font` | Bebas Neue + Space Grotesk |
| Database | Supabase (later) | Auth, Postgres, Realtime — NOT wired up in v1 |
| State | React state / URL params | No state library needed for static build |
| Deployment | TBD | Vercel likely |

### Build Strategy

**Phase 1: Static pages with mock data.** Build all 10 screens pixel-perfect with hardcoded data. No backend, no auth, no database. Get the UI right first.

**Phase 2: Wire up Supabase.** Add auth (login/signup), database schema, API routes. Replace mock data with real queries.

**This document covers Phase 1 only.**

### Project Location

Standalone repository. Separate from the Boring-dividends monorepo.

```bash
npx create-next-app@latest fareshare --typescript --tailwind --eslint --app --src-dir --no-import-alias
cd fareshare
npm install lucide-react
```

### Folder Structure

```
fareshare/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: fonts, bg, MobileShell
│   │   ├── page.tsx                # Redirect to /login
│   │   ├── globals.css             # Tailwind directives
│   │   ├── login/
│   │   │   └── page.tsx            # Screen 1
│   │   ├── signup/
│   │   │   └── page.tsx            # Screen 2
│   │   ├── rides/
│   │   │   ├── page.tsx            # Screen 3
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Screens 4 & 5 (conditional)
│   │   ├── requests/
│   │   │   └── page.tsx            # Screen 8
│   │   ├── post/
│   │   │   ├── ride/
│   │   │   │   └── page.tsx        # Screen 6
│   │   │   └── request/
│   │   │       └── page.tsx        # Screen 9
│   │   ├── edit/
│   │   │   └── ride/
│   │   │       └── [id]/
│   │   │           └── page.tsx    # Screen 7
│   │   └── dashboard/
│   │       └── page.tsx            # Screen 10
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx          # Primary, outlined, danger variants
│   │   │   ├── Input.tsx           # Labeled text input
│   │   │   ├── TextArea.tsx        # Labeled textarea
│   │   │   ├── Badge.tsx           # Status badges (OPEN, FULL, etc.)
│   │   │   ├── Avatar.tsx          # Initials avatar (multiple sizes)
│   │   │   └── Card.tsx            # Generic bordered card wrapper
│   │   ├── layout/
│   │   │   ├── MobileShell.tsx     # 390px max-width centered wrapper
│   │   │   ├── Header.tsx          # Brand header (FARESHARE + dot)
│   │   │   ├── BackHeader.tsx      # Arrow-left + label
│   │   │   ├── BottomNav.tsx       # RIDES / POST / YOU nav
│   │   │   └── TabBar.tsx          # Available / Requests toggle
│   │   ├── rides/
│   │   │   ├── RideCard.tsx        # Ride list card
│   │   │   ├── RideDetailTop.tsx   # Route + when/donation boxes
│   │   │   ├── DriverCard.tsx      # Driver avatar + info
│   │   │   ├── SeatGrid.tsx        # Seat squares (passenger view)
│   │   │   ├── PassengerRow.tsx    # Passenger row (driver view)
│   │   │   └── DonationNudge.tsx   # Heart + donation text bar
│   │   ├── requests/
│   │   │   └── RequestCard.tsx     # Request list card
│   │   ├── dashboard/
│   │   │   └── DashboardCard.tsx   # Dashboard section card
│   │   └── forms/
│   │       ├── RideForm.tsx        # Shared Post/Edit ride form
│   │       └── RequestForm.tsx     # Post a request form
│   └── lib/
│       ├── types.ts                # TypeScript interfaces
│       ├── mock-data.ts            # All hardcoded data
│       └── utils.ts                # cn() helper, getInitials(), etc.
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

### Route Mapping

| # | Screen | Route | Condition |
|---|--------|-------|-----------|
| 1 | Login | `/login` | Default landing |
| 2 | Signup | `/signup` | — |
| 3 | Rides List | `/rides` | Available tab active |
| 4 | Ride Detail (Passenger) | `/rides/[id]` | `ride.driverId !== currentUser.id` |
| 5 | Ride Detail (Driver) | `/rides/[id]` | `ride.driverId === currentUser.id` |
| 6 | Post a Ride | `/post/ride` | — |
| 7 | Edit Ride | `/edit/ride/[id]` | — |
| 8 | Requests List | `/requests` | Requests tab active |
| 9 | Post a Request | `/post/request` | — |
| 10 | Dashboard | `/dashboard` | YOU nav active |

### TypeScript Interfaces

```typescript
export type RideStatus = 'open' | 'full';
export type BadgeVariant = 'open' | 'full' | 'confirmed' | 'pending' | 'request';

export interface User {
  id: string;
  displayName: string;
  initials: string;
}

export interface Passenger {
  userId: string;
  name: string;
  initials: string;
}

export interface Ride {
  id: string;
  from: string;
  to: string;
  date: string;            // "Today", "Tomorrow", "Friday"
  time: string;            // "4–6pm", "9am"
  driverName: string;
  driverId: string;
  driverInitials: string;
  driverRidesShared: number;
  totalSeats: number;
  filledSeats: number;
  donation: number;        // Euro amount
  status: RideStatus;
  passengers: Passenger[];
  note?: string;
}

export interface RideRequest {
  id: string;
  from: string;
  to: string;
  preferredDate: string;
  requesterName: string;
  requesterId: string;
  note?: string;
}

export interface DashboardItem {
  id: string;
  route: string;
  meta: string;
  badge: BadgeVariant;
}
```

### Mock Data

```typescript
export const currentUser: User = {
  id: 'user-ts',
  displayName: 'Toby S.',
  initials: 'TS',
};

export const rides: Ride[] = [
  {
    id: 'ride-1',
    from: 'Ericeira', to: 'Lisbon',
    date: 'Today', time: '4–6pm',
    driverName: 'Miguel R.', driverId: 'user-mr',
    driverInitials: 'MR', driverRidesShared: 12,
    totalSeats: 4, filledSeats: 2, donation: 10,
    status: 'open',
    passengers: [
      { userId: 'user-ak', name: 'Ana K.', initials: 'AK' },
      { userId: 'user-jl', name: 'João L.', initials: 'JL' },
    ],
  },
  {
    id: 'ride-2',
    from: 'Lisbon', to: 'Ericeira',
    date: 'Tomorrow', time: '9am',
    driverName: 'Sara M.', driverId: 'user-sm',
    driverInitials: 'SM', driverRidesShared: 8,
    totalSeats: 5, filledSeats: 3, donation: 25,
    status: 'open',
    passengers: [
      { userId: 'user-ts', name: 'Toby S.', initials: 'TS' },
      { userId: 'user-lf', name: 'Luís F.', initials: 'LF' },
      { userId: 'user-rb', name: 'Rita B.', initials: 'RB' },
    ],
  },
  {
    id: 'ride-3',
    from: 'Ericeira', to: 'Sintra',
    date: 'Friday', time: '2–4pm',
    driverName: 'João P.', driverId: 'user-jp',
    driverInitials: 'JP', driverRidesShared: 5,
    totalSeats: 3, filledSeats: 3, donation: 15,
    status: 'full',
    passengers: [
      { userId: 'user-ts', name: 'Toby S.', initials: 'TS' },
      { userId: 'user-cs', name: 'Clara S.', initials: 'CS' },
      { userId: 'user-mf', name: 'Marta F.', initials: 'MF' },
    ],
  },
  {
    id: 'ride-4',
    from: 'Mafra', to: 'Lisbon',
    date: 'Monday', time: '7:30am',
    driverName: 'Tiago L.', driverId: 'user-ts', // currentUser is driver
    driverInitials: 'TL', driverRidesShared: 3,
    totalSeats: 4, filledSeats: 1, donation: 8,
    status: 'open',
    passengers: [
      { userId: 'user-pt', name: 'Pedro T.', initials: 'PT' },
    ],
  },
];

export const requests: RideRequest[] = [
  {
    id: 'req-1',
    from: 'Lisbon', to: 'Ericeira',
    preferredDate: 'Saturday, afternoon preferred',
    requesterName: 'Clara S.', requesterId: 'user-cs',
    note: 'Need to get back after visiting family. Flexible on exact time.',
  },
  {
    id: 'req-2',
    from: 'Ericeira', to: 'Mafra',
    preferredDate: 'Monday, morning',
    requesterName: 'Pedro T.', requesterId: 'user-pt',
    note: 'Doctor appointment at 10am. Can leave as early as 8.',
  },
  {
    id: 'req-3',
    from: 'Sintra', to: 'Ericeira',
    preferredDate: 'Wednesday, evening',
    requesterName: 'Marta F.', requesterId: 'user-mf',
  },
];

export const dashboardRides: DashboardItem[] = [
  { id: 'ride-4', route: 'Ericeira → Lisbon', meta: 'Today, 4–6pm · 2/4 seats', badge: 'open' },
];

export const dashboardSeats: DashboardItem[] = [
  { id: 'ride-2', route: 'Lisbon → Ericeira', meta: 'Tomorrow, 9am · Sara M. driving', badge: 'confirmed' },
  { id: 'ride-3', route: 'Ericeira → Sintra', meta: 'Friday, 2–4pm · João P. driving', badge: 'full' },
];

export const dashboardRequests: DashboardItem[] = [
  { id: 'req-x', route: 'Mafra → Ericeira', meta: 'Next week, flexible', badge: 'pending' },
];
```

### Tailwind Configuration

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    borderRadius: {
      none: "0px",
      DEFAULT: "0px",
      full: "9999px",       // notification dot only
    },
    extend: {
      colors: {
        bg: { DEFAULT: "#141414", card: "#1E1E1E", hover: "#2A2A2A" },
        text: { primary: "#FAFAFA", muted: "#A0A0A0", dim: "#6B6B6B" },
        accent: { DEFAULT: "#B898D0", hover: "#C9ADE0", muted: "#B898D018" },
        danger: "#EF4444",
        status: {
          open: "#4ADE80", "open-bg": "#4ADE8018",
          full: "#FBBF24", "full-bg": "#FBBF2418",
        },
        border: "#2A2B30",
      },
      fontFamily: {
        heading: ["var(--font-bebas-neue)", "sans-serif"],
        body: ["var(--font-space-grotesk)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

### Root Layout

```typescript
import { Bebas_Neue, Space_Grotesk } from "next/font/google";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

// Body wraps in MobileShell: max-w-[390px] mx-auto min-h-screen bg-bg font-body
```

### Component Specifications

#### Button Variants

| Variant | Background | Text Color | Font | Border |
|---------|-----------|------------|------|--------|
| Primary | `#B898D0` | `#141414` | Bebas Neue 18px bold, tracking 2px | None |
| Outlined | Transparent | `#FAFAFA` | Space Grotesk 13px medium | 1px `#FAFAFA` |
| Outlined accent | Transparent | `#B898D0` | Space Grotesk 12px semibold, tracking 1px | 1px `#B898D0` |
| Danger outlined | Transparent | `#EF4444` | Space Grotesk 13px semibold | 1px `#EF4444` |

#### Badge Variants

| Variant | Text Color | Background |
|---------|-----------|------------|
| open | `#4ADE80` | `#4ADE8018` |
| full | `#FBBF24` | `#FBBF2418` |
| confirmed | `#B898D0` | `#B898D018` |
| pending | `#B898D0` | `#B898D018` |
| request | `#B898D0` | `#B898D018` |

#### BottomNav States

| Tab | Active Icon/Text | Inactive Icon/Text | Route |
|-----|-----------------|-------------------|-------|
| RIDES | `#B898D0` | `#6B6B6B` | `/rides` |
| POST | `#B898D0` | `#6B6B6B` | `/post/ride` |
| YOU | `#B898D0` | `#6B6B6B` | `/dashboard` |

#### Icons Used (Lucide React)

| Icon | Where Used |
|------|-----------|
| `compass` | Bottom nav — RIDES |
| `plus` | Bottom nav — POST, empty seat squares |
| `user` | Bottom nav — YOU |
| `arrow-left` | Back headers |
| `heart` | Donation nudge |
| `pencil` | Edit ride button |
| `trash-2` | Delete ride button |
| `bell` | (reserved for future notifications) |

### Build Order

**Phase 1 — Foundation:**
1. `tailwind.config.ts` — design tokens
2. `globals.css` — Tailwind directives
3. `layout.tsx` — root layout with fonts + MobileShell
4. `lib/types.ts` — TypeScript interfaces
5. `lib/mock-data.ts` — all mock data
6. `lib/utils.ts` — `cn()` helper
7. `MobileShell.tsx` — 390px wrapper

**Phase 2 — UI Components:**
8. `Button.tsx`
9. `Input.tsx`
10. `TextArea.tsx`
11. `Badge.tsx`
12. `Avatar.tsx`
13. `Card.tsx`

**Phase 3 — Layout Components:**
14. `Header.tsx`
15. `BackHeader.tsx`
16. `BottomNav.tsx`
17. `TabBar.tsx`

**Phase 4 — Auth Pages:**
18. `login/page.tsx`
19. `signup/page.tsx`
20. `page.tsx` (root redirect)

**Phase 5 — Rides Flow:**
21. `RideCard.tsx`
22. `rides/page.tsx`
23. `RideDetailTop.tsx`
24. `DriverCard.tsx`
25. `SeatGrid.tsx`
26. `PassengerRow.tsx`
27. `DonationNudge.tsx`
28. `rides/[id]/page.tsx`
29. `RideForm.tsx`
30. `post/ride/page.tsx`
31. `edit/ride/[id]/page.tsx`

**Phase 6 — Requests Flow:**
32. `RequestCard.tsx`
33. `requests/page.tsx`
34. `RequestForm.tsx`
35. `post/request/page.tsx`

**Phase 7 — Dashboard:**
36. `DashboardCard.tsx`
37. `dashboard/page.tsx`

### Key Design Decisions

1. **Conditional ride detail:** `/rides/[id]` checks `ride.driverId === currentUser.id` to decide passenger vs driver view
2. **No actual auth:** Login/signup buttons just navigate to `/rides` — auth comes in Phase 2
3. **No form submission:** Forms are visual-only, buttons navigate back or do nothing
4. **Tab bar routing:** AVAILABLE → `/rides`, REQUESTS → `/requests` — both share Header + TabBar + BottomNav
5. **POST nav:** Links to `/post/ride` by default (could add a modal choice later)
6. **Font enforcement:** Bebas Neue is always uppercase via CSS `uppercase` class even though the font renders uppercase naturally

---

## 8. Supabase Schema (Phase 2 — Future)

Not being built now, but documented for planning:

### Tables

```sql
-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  display_name text not null,
  created_at timestamptz default now()
);

-- Rides posted by drivers
create table public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.profiles not null,
  origin text not null,
  destination text not null,
  departure_date date not null,
  departure_time text not null,
  total_seats int not null,
  suggested_donation numeric(6,2),
  note text,
  status text default 'open' check (status in ('open', 'full', 'cancelled', 'completed')),
  created_at timestamptz default now()
);

-- Seat claims by passengers
create table public.seats (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references public.rides not null,
  passenger_id uuid references public.profiles not null,
  claimed_at timestamptz default now(),
  unique(ride_id, passenger_id)
);

-- Ride requests from passengers
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles not null,
  origin text not null,
  destination text not null,
  preferred_date text not null,
  preferred_time text,
  note text,
  status text default 'open' check (status in ('open', 'claimed', 'cancelled')),
  created_at timestamptz default now()
);
```

### Row Level Security

- Users can read all rides and requests (public bulletin board)
- Users can only create/edit/delete their own rides
- Users can only create/delete their own seat claims
- Users can only create/edit/delete their own requests
- Profiles are readable by all authenticated users

---

## 9. Design File Reference

All 10 screens are designed in:
```
/Users/tobyscregg/Documents/Projects/Boring-dividends-main/Carshare/carshare.pen
```

**Frame IDs in carshare.pen:**

| Screen | Frame ID | Position |
|--------|----------|----------|
| Login | `fHwbK` | x:0, y:6350 |
| Signup | `0x5EQ` | x:440, y:6350 |
| Rides List | `SWO5w` | x:0, y:7280 |
| Post a Ride | `If5IP` | x:440, y:7280 |
| Ride Detail — Passenger | `DEhHX` | x:880, y:7280 |
| Ride Detail — Driver | `Tfujp` | x:1320, y:7280 |
| Requests List | `3c4Xy` | x:0, y:8210 |
| Post a Request | `JP3IS` | x:440, y:8210 |
| Dashboard | `jc8pQ` | x:880, y:8210 |
| Edit Ride | `yckYZ` | x:1320, y:8210 |

The file also contains 5 earlier design explorations (Surf Shack, Stencil Punk green, Portuguese Concrete, Night Market, Handmade Local) and 4 color variations (Lifted Violet, Lavender, Deep Iris, Soft Lilac). The Lavender B variation was selected as the final direction.

---

## 10. Open Questions / Future Considerations

- **Verification/trust:** Mindmaps note "verification needed" — how do we verify drivers? (V2 concern)
- **Notifications:** Bell icon is reserved but no notification system designed yet
- **WhatsApp integration:** The Stencil Punk green variation had a "WHATSAPP" button on ride detail — consider adding messaging
- **Geographic scope:** V1 focuses on Ericeira ↔ Lisbon corridor. Could expand to other coastal towns
- **Donation handling:** Currently just a suggestion shown in UI. No payment processing

---

## 11. Verbal Identity

### Why

The ride-sharing industry was built to extract — from drivers, from passengers, from cities. Surge pricing. Hidden fees. Algorithms designed to squeeze. FareShare exists because a community already sharing rides on WhatsApp deserves better than that. We believe local people solving local problems don't need a Silicon Valley middleman taking a cut. The road between Ericeira and Lisbon belongs to the people who drive it every day.

### How

Quietly. No ads, no growth hacks, no investor decks. One driver at a time, one physical card at a time. We keep it simple because simple is honest — a bulletin board, not a platform. Drivers post journeys they're already making. Passengers find a seat. A suggested donation covers fuel. No commission. No algorithm deciding your worth. The community sets the terms.

### What

A ride app built for one corridor, one community. Post a ride. Claim a seat. Split the cost. FareShare is the anti-Uber — no surge, no gig economy, no bullshit. Just people sharing the road.

---

### Tone of Voice

#### The Short Version

**Direct. Honest. A little rough around the edges.**
FareShare sounds like a local — not a startup. It doesn't over-explain. It doesn't reassure. It just says the thing.

---

#### Four Voice Principles

**1. Say it straight**

No corporate padding. No "we're excited to share." No "seamless experience." FareShare speaks like someone who knows what they're talking about and doesn't need to dress it up.

> ✓ "Post a ride. Claim a seat."
> ✗ "Connect with fellow travellers on your next journey."

**2. Earn trust, don't perform it**

Trust is built through honesty, not warmth theatre. FareShare doesn't say "we care about your safety" — it shows it through how the product works. Copy should be matter-of-fact, not reassuring.

> ✓ "Driver suggests ~€10 donation. Up to you."
> ✗ "Help support your driver with a small contribution today!"

**3. Community, not platform**

Never sound like a tech company. Avoid words like "users", "onboarding", "ecosystem", "journey" (as metaphor). FareShare is a local tool. It sounds like one.

> ✓ "Someone needs a ride. Maybe that's you."
> ✗ "Join our growing community of travellers."

**4. Quiet edge**

The Stencil Punk aesthetic isn't aggressive — it's confident. The copy doesn't shout. It holds its ground. Dry humour is welcome. Attitude over volume.

> ✓ "No surge pricing. Ever."
> ✗ "We're disrupting the ride-hailing industry!"

---

#### Vocabulary

| Use | Avoid |
|-----|-------|
| ride | journey (metaphor), trip (too tourist) |
| driver | operator, service provider |
| passenger | user, rider |
| donation | fee, fare, charge |
| post | list, submit, publish |
| claim a seat | book, reserve |
| corridor | route, service area |
| community | platform, ecosystem, network |
| share | connect, match |

---

#### Punctuation & Formatting

- **Short sentences.** One idea at a time.
- **No exclamation marks** — ever. Confidence doesn't need them.
- **Lowercase is fine** for casual contexts (UI labels, taglines)
- **ALL CAPS** reserved for UI headings and brand moments — never in running copy
- **Em dashes** over brackets. Parentheses feel corporate.
- **No ellipsis** to create drama. Just say it.

---

#### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| UI labels | Blunt, functional | "POST RIDE", "CLAIM A SEAT" |
| Empty states | Dry, direct | "No rides posted yet. Be the first driver." |
| Error states | Honest, no fuss | "Something went wrong. Try again." |
| Onboarding | Minimal, confident | "Share your drive. Cover your fuel." |
| Physical cards | Punchy, local | "Ericeira → Lisbon. Fair rides. No apps." |
| Error 404 | Wry | "Nothing here. Try a different road." |

---

#### What FareShare Sounds Like

- A local mechanic who charges fair prices and doesn't explain why
- A surf spot with no signs — you either know or you ask someone
- A handwritten note on a café board

#### What FareShare Doesn't Sound Like

- A VC pitch deck
- A Bolt press release
- A wellness app
