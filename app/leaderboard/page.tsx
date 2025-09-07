'use client';

import { ProtectedLayout } from '../../src/components/ProtectedLayout';
import { Leaderboard } from '../../src/pages/Leaderboard';

export default function LeaderboardPage() {
  return (
    <ProtectedLayout>
      <Leaderboard />
    </ProtectedLayout>
  );
}