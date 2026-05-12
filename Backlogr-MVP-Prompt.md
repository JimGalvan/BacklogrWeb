# Backlogr MVP — Build Prompt

Build a single-page web app called **Backlogr** — a dark, pro-tool workspace for reviewing a Jira ticket alongside an AI "Insights" panel. Use **React + Tailwind** (or plain CSS, your choice). One screen, one ticket, no routing. No real Jira API — all data is hard-coded.

## Layout

A 3-column grid that fills the viewport:

```
┌────┬─────────────────────────────┬──────────────────┐
│ 56 │  Main column (ticket)       │  Insights panel  │
│ px │  flex-1                     │  460px           │
│    │                             │                  │
│rail│  ── topbar (52px) ──        │  Header          │
│    │  scrollable ticket body     │  Tool tabs       │
│    │                             │  Scrollable body │
│    │                             │  Footer          │
└────┴─────────────────────────────┴──────────────────┘
```

- App height = `100vh`, `overflow: hidden`. Only the ticket body and insights body scroll.
- Use `display: grid; grid-template-columns: 56px 1fr 460px`.

## Color palette (dark, cool-neutral with amber accent)

All colors use `oklch()`. Set on `:root`:

```css
--bg:        oklch(0.165 0.008 250);   /* app background */
--bg-2:      oklch(0.195 0.009 250);   /* subtle inset surfaces */
--panel:     oklch(0.215 0.010 250);   /* cards */
--panel-2:   oklch(0.245 0.011 250);   /* hover */
--line:      oklch(0.295 0.012 250);   /* borders */
--line-soft: oklch(0.255 0.012 250);   /* subtle dividers */

--text:      oklch(0.965 0.005 250);   /* primary text */
--text-2:    oklch(0.82  0.008 250);   /* body */
--muted:     oklch(0.62  0.012 250);   /* meta */
--muted-2:   oklch(0.46  0.013 250);   /* labels */

--accent:    oklch(0.80 0.155 75);     /* amber — lens / brand */
--accent-2:  oklch(0.80 0.155 75 / .15);
--accent-3:  oklch(0.80 0.155 75 / .30);

--ok:        oklch(0.78 0.14 158);     /* green */
--warn:      oklch(0.82 0.16 55);      /* orange */
--danger:    oklch(0.72 0.18 25);      /* red — P1 */
--info:      oklch(0.78 0.13 235);     /* blue — status chips */
```

Typography:
- Sans: **Geist** (load from Google Fonts, weights 300–700)
- Mono: **Geist Mono** (400–600) — used for ticket key, stack trace, meta values, tags
- Serif: **Instrument Serif** italic — used ONLY for the TL;DR quote
- Base: `font-size: 13px`, `line-height: 1.5`, `-webkit-font-smoothing: antialiased`

Radii: `10px` for cards/panels, `6px` for chips/buttons, `8px` for the logo and modal inputs, `14px` for the modal.

## Left rail (56px)

Vertical stack, centered, `padding: 14px 0`, right border `1px solid var(--line-soft)`.

1. **Logo** (32×32, `border-radius: 8px`) at top, with 14px margin below. Background is a linear gradient `135deg, var(--accent) 0%, oklch(0.65 0.16 35) 100%` with a soft amber glow shadow `0 2px 14px oklch(0.80 0.155 75 / .35)`. Inside: a stroked magnifying-glass SVG with a filled center dot (the "lens").
2. Five icon buttons, 36×36, `border-radius: 8px`, `color: var(--muted)`. First one (Tickets) is active — background `var(--panel)`, color `var(--text)`. Hover applies the same. Icons: ticket, inbox, search, filter.
3. `flex: 1` spacer.
4. Two more icon buttons at bottom: bell, settings.
5. 30×30 avatar circle at the very bottom with initials "YO" on a violet→magenta gradient.

All icons are 18×18, lucide-style stroke icons (stroke-width 1.8).

## Topbar (52px, in the main column)

`padding: 0 22px`, `border-bottom: 1px solid var(--line-soft)`, flex row with 14px gap.

- **Breadcrumbs** (left): `"Payments"` in `--text-2` / slash separator in `--muted-2` / `"PAY-4827"` as a mono pill (`background: var(--panel)`, `border: 1px solid var(--line-soft)`, `padding: 2px 7px`, `border-radius: 5px`).
- Spacer.
- Three pill buttons (28px tall, 11px horizontal padding, 7px radius, mono-ish icon + label, `background: var(--panel)`, `border: 1px solid var(--line-soft)`):
  - `↗ View in Jira` (ghost, no bg)
  - `⧉ Copy` (ghost)
  - `+ Import ticket` (filled — `background: var(--panel)`, the rightmost; this opens the modal)

## Ticket body (scrollable, `padding: 28px 40px 80px`)

### Title block
- Red **priority chip** to the left of the title, top-aligned with 6px top margin. Style:
  - 26px tall, padding `0 9px`, radius 6
  - `background: oklch(0.72 0.18 25 / .12)`, `color: var(--danger)`, border `1px solid oklch(0.72 0.18 25 / .30)`
  - Leading 6px dot with `box-shadow: 0 0 6px var(--danger)` glow
  - Mono font, 11.5px, label `"P1 — Critical"`
- **H1**: `font-size: 24px`, `font-weight: 500`, `letter-spacing: -0.015em`, `line-height: 1.25`, `text-wrap: pretty`, `max-width: 56ch`.
  - Text: *"Checkout fails silently when applying expired promo code — order completes at full price"*

### Meta row
A single boxed strip: `background: var(--bg-2)`, `border: 1px solid var(--line-soft)`, radius 10, padding `14px 16px`, flex-wrap with `gap: 18px 26px`. Six cells, each a tiny column:

- Tiny uppercase label (10.5px, `--muted-2`, letter-spacing 0.08em, weight 500): `STATUS`, `ASSIGNEE`, `REPORTER`, `SPRINT`, `AFFECTS`, `LABELS`
- Value below (12.5px, `--text-2`)

Cells:
1. **Status** — blue chip: `In Progress`, background `oklch(0.78 0.13 235 / .14)`, color `--info`, border `oklch(0.78 0.13 235 / .25)`, with a leading 6px dot.
2. **Assignee** — 18px gradient avatar circle (`MT`, teal→blue gradient) + `"Marcus Tang"`
3. **Reporter** — avatar (`PR`, purple→magenta) + `"Priya Ramachandran"`
4. **Sprint** — `"Sprint 47 · May 4–18"`
5. **Affects** — mono, 12px, `"2.41.0 · prod"`
6. **Labels** — four small mono tags side by side: `regression`, `silent-failure`, `promo-engine`, `p1-customer`. Tag style: 19px tall, padding 0 7px, radius 4, `background: var(--bg)`, border `1px solid var(--line-soft)`, color `--text-2`, mono 10.5px.

Avatar gradients (135deg):
- `a` = `oklch(0.55 0.10 270) → oklch(0.42 0.08 330)` (purple)
- `b` = `oklch(0.55 0.12 180) → oklch(0.40 0.10 220)` (teal)
- `c` = `oklch(0.60 0.13 55)  → oklch(0.45 0.11 30)`  (amber)

### Section labels
Throughout the body, use small uppercase labels: `10.5px`, `--muted-2`, `letter-spacing: 0.09em`, `font-weight: 600`, `margin: 22px 0 10px`.

### Description
`max-width: 72ch`, `font-size: 13.5px`, `color: var(--text-2)`, `line-height: 1.65`. Paragraphs with `margin: 0 0 12px`.

- Inline `<code>` snippets: mono 12px, `background: var(--panel)`, border `1px solid var(--line-soft)`, padding `1px 5px`, radius 4, color `--text`.
- `<strong>` is `--text`, weight 600.
- Unordered lists: `padding-left: 20px`, list items 3px vertical margin.

Content for description:
> During the May 4 release we shipped `promo-engine@3.2.0`, which moved expiration validation from the checkout service into a shared `PromotionGateway`. Since then, customers applying an expired code see the discount line appear in the cart for ~600ms, then quietly disappear without any error toast or message. **The order proceeds and is charged at full price.**
>
> We have 47 confirmed customer reports since Monday (see linked Zendesk macro `CS-PROMO-SILENT`). Refund volume on the affected SKUs is up 4.2× WoW.
>
> **Steps to reproduce**
> - Add any item ≥ $25 to cart, currency USD or EUR.
> - On the checkout page, enter promo code `SPRING20` (expired 2026-04-30).
> - Click **Apply**. Observe discount briefly appears in the summary.
> - Within ~600ms the discount line is removed; no error is shown.
> - Complete checkout — order is created at full price.
>
> **Expected**
> Inline error under the promo field: `This code has expired`. No mutation to the cart total.

### Stack trace block
`<pre>` styled as:
- `background: var(--bg-2)`, border `1px solid var(--line-soft)`, radius 10
- `padding: 14px 16px`, mono 11.5px, `--text-2`, line-height 1.7
- `white-space: pre`, `overflow-x: auto`

Use color spans inside:
- `.err` → `--danger` (for `← swallowed`, `← bug: swallows all gateway errors`)
- `.mut` → `--muted-2` (for `[checkout.ts:412]`)
- `.hl` → `--accent` (for `return { ok: true, discount: 0 };`)

Content (preserve indentation):

```
PromotionGatewayError: rule:expiration_window failed (code=SPRING20, exp=2026-04-30T23:59:59Z)
  at PromotionGateway.evaluate (gateway.ts:184)
  at CheckoutService.applyPromo (checkout.ts:412)        ← swallowed
  at CartReducer.PROMO_APPLY (cart.reducer.ts:73)
  at dispatch (redux-toolkit/dist/configureStore.js:88)

[checkout.ts:412]
  try {
    const result = await gateway.evaluate(code, ctx);
    return { ok: true, discount: result.amount };
  } catch (e) {
    return { ok: true, discount: 0 };   ← bug: swallows all gateway errors
  }
```

Label above: `STACK TRACE · CHECKOUT-SERVICE · POD-EU-WEST-1-A7F`

### Comments
Section label `COMMENTS · 3`. Vertical stack, `gap: 16px`, `max-width: 72ch`.

Each comment is a flex row with `gap: 12px`:
- 28×28 gradient avatar (use the same a/b/c palette)
- Body column:
  - Head row (4px bottom margin): name (12.5px, weight 600, `--text`) + time (11.5px, `--muted-2`)
  - Paragraph (13px, `--text-2`, line-height 1.6, margin 0)

The three comments:
1. **Marcus Tang** (teal avatar `MT`), 2 hours ago: "Reproduced locally on `main` + production replay. The bug is in `checkout.ts:412` — the catch returns `{ok: true}` regardless of the failure type, masking every gateway error. Refactor in `promo-engine@3.2.0` changed the contract from \"returns null on invalid\" to \"throws typed errors\", but the consumer was never updated."
2. **Anya Volkov** (amber avatar `AV`), 1 hour ago: "Confirming this should have been caught — our integration tests stub the gateway and never assert on error shape. We need contract tests between checkout and promo-engine, not just happy-path stubs. I can pair on that."
3. **Priya Ramachandran** (purple avatar `PR`), 34 min ago: "CS impact update: 47 tickets, 12 chargebacks initiated. Two customers escalated on Twitter. We need messaging guidance before the fix lands — should we proactively refund the delta or wait for inbound?"

## Insights panel (right, 460px)

Background `var(--bg-2)`, left border `1px solid var(--line-soft)`. Flex column.

### Header (`padding: 14px 20px 0`)

Title row (flex, gap 8px, baseline-aligned):
- 22×22 rounded square glyph (radius 6, `background: var(--accent-2)`, `color: var(--accent)`) containing a 13px sparkle icon
- `h2` "Insights" — 13.5px, weight 600, `--text`
- Right-aligned `"● analyzing live"` indicator — mono 10px, `--muted`, with a 6px green dot using `--ok` and a `box-shadow: 0 0 8px var(--ok)` pulsing between opacity 1 and 0.35 every 1.6s.

Below: the **tool tab strip**. For the MVP only show one tab:
- Container: flex, 4px gap, 4px padding, `background: var(--bg)`, border `1px solid var(--line-soft)`, radius 9.
- Tab: 30px tall, 0 11px padding, radius 6, font 11.5px weight 500, gap 6 between icon and label.
- Active state: `background: var(--panel)`, `color: var(--text)`, inset top highlight `inset 0 1px 0 oklch(1 0 0 / .04)` + drop shadow `0 1px 6px rgba(0,0,0,.25)`.

Tabs to render (Summary is the only one active and clickable; others appear disabled/greyed but visible so the layout looks complete):
- 📄 **Summary** *(active)*
- 🧪 Test cases *(disabled)*
- 🧠 Hypotheses *(disabled)*
- 🛡 Risk *(disabled)*
- 🕘 Similar *(disabled)*

(Use stroke icons, not emoji — the emoji above are just naming hints.)

### Body (scrollable, `padding: 16px 20px 28px`, `gap: 12px` between cards)

Two stacked cards — the **TL;DR card** and the **bullets card** are actually one combined card. Card shell:
- `background: var(--panel)`, border `1px solid var(--line-soft)`, radius 10, `overflow: hidden`

Inside the single Summary card:

**Card head** (11px 14px, bottom border `1px solid var(--line-soft)`):
- Tiny 18×18 amber icon square (`background: var(--accent-2)`, color `--accent`, radius 5) with a 11px document icon
- `h3` "TL;DR" — 12.5px weight 600
- Right-side mono meta tag `"haiku · 1.2s"`, 10.5px, `--muted`

**TL;DR quote block** (12px 14px):
- Background `linear-gradient(180deg, var(--accent-2) 0%, transparent 100%)`
- Bottom border `1px solid var(--line-soft)`
- **Instrument Serif italic, 17px**, `--text`, `text-wrap: pretty`
- Wrapped in straight quotes: `"A silent error-swallow in checkout lets expired promo codes pass validation, charging customers full price without any UI feedback."`

**Bullet list** (10px 14px). Custom bullet using `→` glyph in `--accent` mono. Each item:
- 12px `--text-2`, 4px vertical padding, flex with 8px gap. `::before` content `→`.

Bullets (render `<code>` inline same as ticket body):
1. Root cause: `checkout.ts:412` catch block returns `ok:true` for any gateway exception, including expiration errors.
2. Introduced by `promo-engine@3.2.0` (May 4) — contract changed from "returns null" to "throws typed errors"; consumer was not updated.
3. 47 customer reports in 4 days, refund volume up 4.2× WoW, 12 chargebacks initiated.
4. Fix is narrow (4 lines) but exposes a class of contract-test gaps across the checkout/promo boundary.

### Streaming animation (key MVP detail)

When the panel loads (and on "Re-analyze"):
1. The TL;DR quote streams in character-by-character at ~14ms per chunk of 2–6 chars (slightly random for organic feel). While streaming, show a blinking caret right after the last char: a `7px × 13px` solid `--accent` block, vertical-align -2px, blinking 1s steps(2) infinite.
2. Once the quote finishes, the bullet list reveals one item at a time, ~320ms apart, each fading in.

Implement with a `useStream(text, deps)` hook (returns `[currentText, done]`) and a `useReveal(count, deps, stepMs)` hook (returns how many items to show).

### Footer (`padding: 14px 20px`, top border `1px solid var(--line-soft)`, flex row)
- Left, mono 11px `--muted-2`: bolt icon + `"ticketlens · context window 12.4k tok"`
- Right: `↻ Re-analyze` button — 26px tall, 0 10px padding, radius 6, `background: var(--panel)`, border `1px solid var(--line-soft)`, font 11px. Clicking restarts the streaming animation.

## Import ticket modal

Triggered by the topbar "+ Import ticket" button. Fixed-overlay backdrop:
- `inset: 0`, `background: oklch(0.10 0.005 250 / .68)`, `backdrop-filter: blur(8px)`
- 250ms fade-in
- Click outside the modal to dismiss

Modal card:
- 480px wide, `background: var(--panel)`, border `1px solid var(--line)`, radius 14
- Box shadow `0 30px 80px rgba(0,0,0,.5)` + inset highlight `0 0 0 1px oklch(1 0 0 / .03)`
- Entry animation: 300ms cubic-bezier(.2,.8,.2,1), translateY(14px) → 0 + opacity 0 → 1

### Modal head (`padding: 18px 20px 6px`)
- `h3` "Import a ticket" — 15px weight 600
- `p` "Paste a link, connect a workspace, or pick from recents." — 12.5px `--muted`, 4px top margin

### Tab strip (`padding: 14px 20px 0`, bottom border `1px solid var(--line-soft)`)
Two tabs, 32px tall, 0 12px padding, gap 4. Inactive: `--muted`. Active: `--text` with a 2px `--accent` bottom border, sitting flush with the strip's border (`margin-bottom: -1px`).
- **Paste URL** *(active by default)*
- **Connect workspace**

### Modal body (`padding: 18px 20px 4px`)

**When "Paste URL" tab is active:**
- Input wrapper: flex row, 38px tall, radius 8, 0 12px padding, `background: var(--bg)`, border `1px solid var(--line)`. Focus state: border becomes `--accent`.
- 14×14 link icon in `--muted` on the left, then transparent input with mono 12px text, placeholder `"https://acme.atlassian.net/browse/PAY-4827"`.
- Hint below: 11.5px mono `--muted-2`, `"⌘V · accepts Jira, Linear, GitHub Issues, ServiceNow"`
- A "Recent in your workspace" subsection with a small uppercase label, then three suggestion rows:
  - Row style: flex 10px gap, 9px 10px padding, radius 6, transparent border. Hover: `background: var(--bg)`, border `var(--line-soft)`.
  - Layout: mono key in `--accent`, then title in 12px `--text-2` (ellipsis), then a small right arrow in `--muted-2`.
  - Rows:
    - `PAY-4827` — Checkout fails silently when applying expired promo code
    - `PAY-4801` — 3DS challenge dialog flashes and dismisses on Safari 17
    - `CART-2192` — Item count badge desyncs after add-from-search
  - Clicking any row triggers the same import flow as the primary button.

**When "Connect workspace" tab is active:**
- Two workspace cards stacked, 4px gap, each 14px padding, `background: var(--bg)`, border `1px solid var(--line)`, radius 8, flex row with 12px gap.
- Card 1 (Atlassian, connected):
  - 36×36 rounded square (radius 8) with the letter `A`, gradient `135deg, oklch(0.55 0.13 200), oklch(0.40 0.10 240)`
  - Name `"acme.atlassian.net"` (13px weight 600), sub `"8 projects · 12,481 tickets · synced 4m ago"` (11.5px `--muted` mono)
  - Right-aligned "Connected" button (`btn` style) with a green check icon
- Card 2 (Linear, opacity 0.85):
  - Letter `L`, gradient `135deg, oklch(0.50 0.12 280), oklch(0.36 0.10 320)`
  - Name `"linear.app/acme"`, sub `"Not connected · OAuth required"`
  - Right "Connect" button
- Hint below (14px top margin): `"Read-only. We never write back to your tracker."`

### Modal footer (`padding: 14px 20px`, top border `1px solid var(--line-soft)`, `background: var(--bg-2)`)
- Left: small hint `"⌥ Enter to import"` — 11.5px mono `--muted-2`
- Spacer
- Two buttons (32px tall, 0 14px padding, radius 7, 12px weight 500):
  - **Cancel** — `background: var(--panel-2)`, border `1px solid var(--line)`, `color: --text-2`. Hover lightens.
  - **Import ticket** *(primary)* — `background: var(--accent)`, `color: oklch(0.18 0.01 80)` (dark on amber), no border, weight 600. Disabled when URL field is empty.
  - On click: replace label with `[spinner] Importing…`. Spinner is a 12×12 circle, 1.5px current-color border, top transparent, spinning 0.8s linear. After 1.4s, close the modal and trigger a re-stream of the Insights summary.

## Behavior summary

- The whole app is static except:
  - Clicking "+ Import ticket" → opens modal. Clicking outside or Cancel → closes. Submitting → 1.4s spinner → closes → restarts Insights streaming.
  - Clicking "↻ Re-analyze" in the Insights footer → restarts the streaming animation.
  - Suggestion rows in the modal behave like an immediate import.

## Stretch / nice-to-have (skip if tight)

- Custom scrollbar: 10px wide, thumb `oklch(0.32 0.012 250)` with `border: 2px solid var(--bg); background-clip: content-box;` to give it inset padding.
- `::selection` background = `var(--accent-3)`.
- `font-feature-settings: 'ss01','cv11'` on body for Geist's stylistic alternates.

## What to skip for MVP

- All other tabs (Test cases, Hypotheses, Risk, Similar) — render them in the tab strip as visible-but-disabled placeholders only.
- No real AI calls. The streaming is a pure UI animation over a hard-coded string.
- No real Jira OAuth. The "Connected" state is static.
- No light mode, no tweaks panel, no settings.

Deliver a single working app at `/` that renders the ticket on load with the Insights panel already streaming the summary.
