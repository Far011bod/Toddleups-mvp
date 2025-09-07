'use client';

import { ProtectedLayout } from '../../../src/components/ProtectedLayout';
import { LessonPlayer } from '../../../src/pages/LessonPlayer';

export default function Lesson() {
  return (
    <ProtectedLayout>
      <LessonPlayer />
    </ProtectedLayout>
  );
}