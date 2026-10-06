import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiUrl, renderRoutes, signIn } from '@/test/render';
import { Learning } from './Learning';
import type { UserRecommendation } from '@/services/backendService';

const routes = [{ path: '/learning', element: <Learning /> }];

const gapRec: UserRecommendation = {
  course_id: 'track_d_e4_crypto_agility', title: 'Crypto-Agility', topic: 'practical_security', priority: 'High',
  reason: 'Recommended because open finding "Key exchange is not post-quantum protected" needs PQC.6 ...',
  quiz_score: null, scanner_risk: 'Medium', status: 'recommendation', engine: 'gap', graph_paths: [],
  reasons: [],
  recommendations: [{
    module_id: 'track_d_e4_crypto_agility', title: 'Crypto-Agility', code: 'E4', action: 'learn', practical: null,
    competencies: ['PQC.6'], priority: 'High', scanner_risk: 'Medium', topic: 'practical_security',
    reasons: [
      { type: 'gap', competency: 'PQC.6', competency_name: 'hybrid modes and crypto-agility', required: 'Proficient',
        demonstrated: 'Beginner', gap_class: 'high', finding_id: 'f-9', finding_title: 'Key exchange is not post-quantum protected' },
      { type: 'model_status', requirement_map_version: 'proposed-v1', requirement_map_status: 'proposed-unreviewed', levels_status: 'pilot-hypothesis' },
    ],
  }],
};

describe('Learning', () => {
  it('shows the server recommendation with a "Why this?" explanation linking the finding', async () => {
    signIn(7);
    server.use(http.get(apiUrl('/users/7/recommendation'), () => HttpResponse.json(gapRec)));
    renderRoutes(routes, '/learning');

    const queue = (await screen.findByRole('heading', { name: /priority learning queue/i })).closest('section') as HTMLElement;
    expect(within(queue).getByText('Study this module')).toBeInTheDocument();
    await userEvent.setup().click(within(queue).getByText('Why this?'));
    expect(within(queue).getByText(/your demonstrated level is Beginner/)).toBeInTheDocument();
    expect(within(queue).getByRole('link', { name: 'Key exchange is not post-quantum protected' })).toHaveAttribute('href', '/closure/f-9');
    expect(within(queue).getByText(/proposed-unreviewed/)).toBeInTheDocument();
  });

  it('shows the no-evidence state when nothing has been assessed', async () => {
    signIn(7);
    server.use(http.get(apiUrl('/users/7/recommendation'), () => HttpResponse.json({
      ...gapRec, course_id: null, status: 'no_evidence', engine: 'none', recommendations: [], reason: 'No assessment or scan evidence yet.',
    })));
    renderRoutes(routes, '/learning');

    expect(await screen.findByRole('heading', { name: /unlock personalized learning recommendations/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /priority learning queue/i })).not.toBeInTheDocument();
  });

  it('reports a failed request instead of showing no recommendations', async () => {
    signIn(7);
    server.use(http.get(apiUrl('/users/7/recommendation'), () => HttpResponse.json({ detail: 'boom' }, { status: 500 })));
    renderRoutes(routes, '/learning');

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be loaded/i);
  });
});
