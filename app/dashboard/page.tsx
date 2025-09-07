'use client';

import { ProtectedLayout } from '../../src/components/ProtectedLayout';
import { Dashboard } from '../../src/pages/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <Dashboard />
    </ProtectedLayout>
  );
}