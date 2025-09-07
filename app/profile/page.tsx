'use client';

import { ProtectedLayout } from '../../src/components/ProtectedLayout';
import { ProfilePage } from '../../src/pages/ProfilePage';

export default function Profile() {
  return (
    <ProtectedLayout showNav={false}>
      <ProfilePage />
    </ProtectedLayout>
  );
}