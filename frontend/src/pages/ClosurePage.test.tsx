import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiUrl, renderRoutes, signIn } from '@/test/render';
import { ClosurePage } from './ClosurePage';

const routes = [{ path: '/closure/:findingId', element: <ClosurePage /> }];

const finding = {
  id: 'f-1', asset_id: 1, evidence_id: null, finding_type: 'pqc.kex.classical_only', title: 'Key exchange is not post-quantum protected',
  algorithm: 'X25519', protocol: 'TLS', severity: 0.6, confidence: 1, migration_urgency: 1, status: 'OPEN',
  first_seen: '2026-10-01T09:00:00Z', last_seen: '2026-10-02T09:00:00Z',
};

function mockChain(interventions: unknown[] = []) {
  let verifyBody: unknown = 'not called';
  server.use(
    http.get(apiUrl('/findings/f-1'), () => HttpResponse.json(finding)),
    http.get(apiUrl('/findings/f-1/requirements'), () => HttpResponse.json([{
      requirement_id: 'REQ.KEX.HYBRID', requirement: 'Plan hybrid / post-quantum key establishment for TLS', pqc_relevant: true,
      rationale: 'Classical-only key exchange is exposed to harvest-now-decrypt-later.', competency_code: 'PQC.6',
      competency_name: 'hybrid modes and crypto-agility', required_level: 'Proficient', map_version: 'proposed-v1', map_status: 'proposed-unreviewed',
    }])),
    http.get(apiUrl('/findings/f-1/interventions'), () => HttpResponse.json(interventions)),
    http.get(apiUrl('/findings/f-1/risk'), () => HttpResponse.json({
      finding_id: 'f-1', model_version: 'risk-v1', score: null, missing: ['asset criticality'], validated: false,
      factors: { exposure: 0.48, asset_criticality: null, pqc_dependency: 1, migration_urgency: null }, inputs: {},
      computed_at: '2026-10-02T09:00:00Z',
    })),
    http.get(apiUrl('/closures/f-1'), () => HttpResponse.json([])),
    http.get(apiUrl('/users/me/skill-matrix'), () => HttpResponse.json({
      competency_model_version: '1', levels_status: 'pilot-hypothesis', requirement_map_version: 'proposed-v1', requirement_map_status: 'proposed-unreviewed',
      rows: [{
        competency_code: 'PQC.6', competency_name: 'hybrid modes', required_level: 'Proficient', demonstrated_level: 'Unknown', gap: 'unassessed',
        gap_class: 'unassessed', evidence_count: 0, last_evidence_at: null, knowledge_score: null, procedural_score: null,
        driving_findings: [{ finding_id: 'f-1', finding_type: 'pqc.kex.classical_only', title: null, severity: 0.6, requirement_id: 'REQ.KEX.HYBRID', required_level: 'Proficient' }],
      }],
    })),
    http.post(apiUrl('/interventions/iv1/verify'), async ({ request }) => {
      verifyBody = await request.json();
      return HttpResponse.json({
        status: 'OPEN', verification_id: 'v1', event_hash: 'abc', technical_ok: false, learner_result_ok: false, verifier_version: 'closure-v2',
        technical: { remediated: false, same_asset: true, finding_status: 'OPEN', rule: 'finding RESOLVED by a verified scan' },
        learner: { ok: false, competency: 'PQC.6', level: 'Unknown', required_level: 'Proficient', rule: 'level Unknown >= required Proficient' },
      });
    }),
  );
  return () => verifyBody;
}

describe('ClosurePage', () => {
  it('shows the finding, its requirement, the learner gap and that no intervention is assigned', async () => {
    signIn();
    mockChain();
    renderRoutes(routes, '/closure/f-1');

    expect(await screen.findByText('Key exchange is not post-quantum protected')).toBeInTheDocument();
    expect(await screen.findByText('Plan hybrid / post-quantum key establishment for TLS')).toBeInTheDocument();
    expect(await screen.findByText('Unknown (not assessed)')).toBeInTheDocument();
    expect(await screen.findByText(/no intervention assigned yet/i)).toBeInTheDocument();
    expect(await screen.findByText(/no closure events recorded yet/i)).toBeInTheDocument();
    expect(await screen.findByText(/unknown: missing asset criticality/i)).toBeInTheDocument(); // not 0
    expect(screen.getByText(/not yet validated/i)).toBeInTheDocument();
  });

  it('verifies an intervention without sending any results and shows the server outcome', async () => {
    signIn();
    const sent = mockChain([{ id: 'iv1', finding_id: 'f-1', competency_id: 1, intervention_type: 'module', module_id: 'track_d_e4_crypto_agility', minimum_score: 0.8, created_at: '2026-10-02T09:00:00Z' }]);
    renderRoutes(routes, '/closure/f-1');

    await userEvent.setup().click(await screen.findByRole('button', { name: /verify closure/i }));
    expect(await screen.findByText('Result: OPEN')).toBeInTheDocument();
    expect(sent()).toEqual({});
  });

  it('explains when the finding cannot be opened', async () => {
    signIn();
    mockChain();
    server.use(http.get(apiUrl('/findings/f-1'), () => HttpResponse.json({ detail: 'Finding not found' }, { status: 404 })));
    renderRoutes(routes, '/closure/f-1');

    expect(await screen.findByRole('heading', { name: /finding unavailable/i })).toBeInTheDocument();
  });
});
