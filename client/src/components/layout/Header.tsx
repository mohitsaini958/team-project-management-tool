import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  title: string;
  action?: ReactNode;
}

export default function Header({ title, action }: HeaderProps) {
  return (
    <header className="border-b border-[#242b37] px-6 py-4 flex items-center justify-between">
      <h1 className="font-display font-semibold text-[15px] text-[#e8eaef]">{title}</h1>
      <div className="flex items-center gap-3">
        {action}
        <NotificationBell />
      </div>
    </header>
  );
}