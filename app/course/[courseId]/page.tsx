'use client';

import { ProtectedLayout } from '../../../src/components/ProtectedLayout';
import { CoursePage } from '../../../src/pages/CoursePage';

export default function Course() {
  return (
    <ProtectedLayout>
      <CoursePage />
    </ProtectedLayout>
  );
}