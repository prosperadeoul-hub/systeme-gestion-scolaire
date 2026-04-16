import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { Page } from '../../lib/types';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, currentPage, onNavigate, title, subtitle }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
