import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div className={`rounded-md border border-neutral-200 bg-white p-5 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
