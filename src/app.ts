export interface ReleaseSummary {
  company: string;
  user: string;
  state: 'ready' | 'pending';
}

export function releaseSummary(passedChecks: number, totalChecks: number): ReleaseSummary {
  if (!Number.isInteger(passedChecks) || !Number.isInteger(totalChecks) ||
      totalChecks < 1 || passedChecks < 0 || passedChecks > totalChecks) {
    throw new RangeError('Invalid check counts');
  }
  return {
    company: 'Example Company',
    user: 'Test User 1',
    state: passedChecks === totalChecks ? 'ready' : 'pending',
  };
}
