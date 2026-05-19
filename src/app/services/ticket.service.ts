import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Ticket, TicketListItem, WorkspaceTicketSummary } from '../models/ticket.model';
import { environment } from '../../environments/environment';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

const MOCK_TICKET: Ticket = {
  key: 'PAY-4827',
  project: 'Payments',
  title: 'Checkout fails silently when applying expired promo code — order completes at full price',
  priority: 'P1',
  status: 'In Progress',
  assignee: { name: 'Marcus Tang', avatar: { initials: 'MT', variant: 'b' } },
  reporter: { name: 'Priya Ramachandran', avatar: { initials: 'PR', variant: 'a' } },
  sprint: 'Sprint 47 · May 4–18',
  affects: '2.41.0 · prod',
  labels: ['regression', 'silent-failure', 'promo-engine', 'p1-customer'],
  descriptionHtml: `
    <p>During the May 4 release we shipped <code>promo-engine@3.2.0</code>, which moved expiration validation from the checkout service into a shared <code>PromotionGateway</code>. Since then, customers applying an expired code see the discount line appear in the cart for ~600ms, then quietly disappear without any error toast or message. <strong>The order proceeds and is charged at full price.</strong></p>
    <p>We have 47 confirmed customer reports since Monday (see linked Zendesk macro <code>CS-PROMO-SILENT</code>). Refund volume on the affected SKUs is up 4.2× WoW.</p>
    <p><strong>Steps to reproduce</strong></p>
    <ul>
      <li>Add any item ≥ $25 to cart, currency USD or EUR.</li>
      <li>On the checkout page, enter promo code <code>SPRING20</code> (expired 2026-04-30).</li>
      <li>Click <strong>Apply</strong>. Observe discount briefly appears in the summary.</li>
      <li>Within ~600ms the discount line is removed; no error is shown.</li>
      <li>Complete checkout — order is created at full price.</li>
    </ul>
    <p><strong>Expected</strong></p>
    <p>Inline error under the promo field: <code>This code has expired</code>. No mutation to the cart total.</p>
  `,
  stackTraceLabel: 'STACK TRACE · CHECKOUT-SERVICE · POD-EU-WEST-1-A7F',
  stackTraceHtml: `PromotionGatewayError: rule:expiration_window failed (code=SPRING20, exp=2026-04-30T23:59:59Z)
  at PromotionGateway.evaluate (gateway.ts:184)
  at CheckoutService.applyPromo (checkout.ts:412)        <span class="err">← swallowed</span>
  at CartReducer.PROMO_APPLY (cart.reducer.ts:73)
  at dispatch (redux-toolkit/dist/configureStore.js:88)

<span class="mut">[checkout.ts:412]</span>
  try {
    const result = await gateway.evaluate(code, ctx);
    return { ok: true, discount: result.amount };
  } catch (e) {
    <span class="hl">return { ok: true, discount: 0 };</span>   <span class="err">← bug: swallows all gateway errors</span>
  }`,
  comments: [
    {
      id: 'cmt_001',
      author: 'Marcus Tang',
      avatar: { initials: 'MT', variant: 'b' },
      timeAgo: '2 hours ago',
      bodyHtml: `Reproduced locally on <code>main</code> + production replay. The bug is in <code>checkout.ts:412</code> — the catch returns <code>{ok: true}</code> regardless of the failure type, masking every gateway error. Refactor in <code>promo-engine@3.2.0</code> changed the contract from "returns null on invalid" to "throws typed errors", but the consumer was never updated.`,
    },
    {
      id: 'cmt_002',
      author: 'Anya Volkov',
      avatar: { initials: 'AV', variant: 'c' },
      timeAgo: '1 hour ago',
      bodyHtml: `Confirming this should have been caught — our integration tests stub the gateway and never assert on error shape. We need contract tests between checkout and promo-engine, not just happy-path stubs. I can pair on that.`,
    },
    {
      id: 'cmt_003',
      author: 'Priya Ramachandran',
      avatar: { initials: 'PR', variant: 'a' },
      timeAgo: '34 min ago',
      bodyHtml: `CS impact update: 47 tickets, 12 chargebacks initiated. Two customers escalated on Twitter. We need messaging guidance before the fix lands — should we proactively refund the delta or wait for inbound?`,
    },
  ],
};

const MOCK_TICKET_LIST: TicketListItem[] = [
  {
    key: 'PAY-4827',
    project: 'Payments',
    title: 'Checkout fails silently when applying expired promo code — order completes at full price',
    priority: 'P1',
    status: 'In Progress',
    assignee: { name: 'Marcus Tang', avatar: { initials: 'MT', variant: 'b' } },
    importedAt: '2026-05-11T09:00:00Z',
  },
  {
    key: 'PAY-4801',
    project: 'Payments',
    title: '3DS challenge dialog flashes and dismisses on Safari 17',
    priority: 'P2',
    status: 'In Review',
    assignee: { name: 'Anya Volkov', avatar: { initials: 'AV', variant: 'c' } },
    importedAt: '2026-05-10T14:30:00Z',
  },
  {
    key: 'CART-2192',
    project: 'Cart',
    title: 'Item count badge desyncs after add-from-search',
    priority: 'P2',
    status: 'Open',
    assignee: { name: 'Priya Ramachandran', avatar: { initials: 'PR', variant: 'a' } },
    importedAt: '2026-05-10T11:00:00Z',
  },
  {
    key: 'AUTH-891',
    project: 'Auth',
    title: 'Session token not refreshed on tab focus after 24h idle',
    priority: 'P1',
    status: 'Open',
    assignee: { name: 'Marcus Tang', avatar: { initials: 'MT', variant: 'b' } },
    importedAt: '2026-05-09T16:00:00Z',
  },
  {
    key: 'CART-2187',
    project: 'Cart',
    title: 'Discount stacking produces negative totals on multi-item orders',
    priority: 'P1',
    status: 'Done',
    assignee: { name: 'Anya Volkov', avatar: { initials: 'AV', variant: 'c' } },
    importedAt: '2026-05-08T10:00:00Z',
  },
  {
    key: 'PAY-4798',
    project: 'Payments',
    title: 'Webhook retry storm on payment processor timeout',
    priority: 'P2',
    status: 'In Progress',
    assignee: { name: 'Priya Ramachandran', avatar: { initials: 'PR', variant: 'a' } },
    importedAt: '2026-05-07T08:00:00Z',
  },
  {
    key: 'INFRA-312',
    project: 'Infrastructure',
    title: 'EU-WEST pod memory ceiling causes OOM on traffic spikes',
    priority: 'P3',
    status: 'Backlog',
    assignee: { name: 'Marcus Tang', avatar: { initials: 'MT', variant: 'b' } },
    importedAt: '2026-05-06T12:00:00Z',
  },
];

const RECENT_TICKETS: WorkspaceTicketSummary[] = [
  { key: 'PAY-4827', title: 'Checkout fails silently when applying expired promo code', project: 'Payments' },
  { key: 'PAY-4801', title: '3DS challenge dialog flashes and dismisses on Safari 17', project: 'Payments' },
  { key: 'CART-2192', title: 'Item count badge desyncs after add-from-search', project: 'Cart' },
];

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);

  // GET /api/v1/tickets/:key  →  `${BASE}/tickets/${key}`
  getTicket(_key: string): Observable<Ticket> {
    return of(MOCK_TICKET).pipe(delay(0));
  }

  // GET /api/v1/workspace/tickets  →  `${BASE}/workspace/tickets`
  getRecentTickets(): Observable<WorkspaceTicketSummary[]> {
    return of(RECENT_TICKETS).pipe(delay(0));
  }

  // POST /api/v1/tickets/import  →  `${BASE}/tickets/import`
  importTicket(url: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${BASE}/tickets/import`, { url });
  }

  // GET /api/v1/tickets  →  `${BASE}/tickets`
  getImportedTickets(): Observable<TicketListItem[]> {
    return of(MOCK_TICKET_LIST).pipe(delay(0));
  }

  // DELETE /api/v1/tickets/:key  →  `${BASE}/tickets/${key}`
  removeTicket(_key: string): Observable<void> {
    return of(undefined).pipe(delay(0));
  }
}
