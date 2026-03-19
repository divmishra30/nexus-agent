import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'uplaod',
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
