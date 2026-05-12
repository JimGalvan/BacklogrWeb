import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Insights } from '../models/insights.model';

const MOCK_INSIGHTS: Insights = {
  ticketKey: 'PAY-4827',
  tldr: 'A silent error-swallow in checkout lets expired promo codes pass validation, charging customers full price without any UI feedback.',
  bullets: [
    { html: 'Root cause: <code>checkout.ts:412</code> catch block returns <code>ok:true</code> for any gateway exception, including expiration errors.' },
    { html: 'Introduced by <code>promo-engine@3.2.0</code> (May 4) — contract changed from "returns null" to "throws typed errors"; consumer was not updated.' },
    { html: '47 customer reports in 4 days, refund volume up 4.2× WoW, 12 chargebacks initiated.' },
    { html: 'Fix is narrow (4 lines) but exposes a class of contract-test gaps across the checkout/promo boundary.' },
  ],
  model: 'haiku',
  latency: '1.2s',
  contextTokens: '12.4k tok',
};

@Injectable({ providedIn: 'root' })
export class InsightsService {
  // GET /api/v1/insights/:ticketKey
  getInsights(_ticketKey: string): Observable<Insights> {
    return of(MOCK_INSIGHTS).pipe(delay(0));
  }
}
