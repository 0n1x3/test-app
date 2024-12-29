'use client';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`page-wrapper ${className}`}>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
} 