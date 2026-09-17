import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-md border border-neutral-200 bg-white p-5 ${className}`}>
      {children}
    </div>
  );
}
