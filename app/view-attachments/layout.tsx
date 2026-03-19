import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'view attachment',
};

export default function ViewAttachmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
