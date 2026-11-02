import test from 'node:test';
import assert from 'node:assert/strict';
import { releaseSummary } from '../dist/app.js';

test('reports complete and incomplete checks using synthetic records', () => {
  assert.deepEqual(releaseSummary(2, 2), {
    company: 'Example Company', user: 'Test User 1', state: 'ready',
  });
  assert.equal(releaseSummary(1, 2).state, 'pending');
});

test('rejects invalid check counts', () => {
  for (const counts of [[-1, 2], [3, 2], [1, 0], [0.5, 2]]) {
    assert.throws(() => releaseSummary(...counts), RangeError);
  }
});
