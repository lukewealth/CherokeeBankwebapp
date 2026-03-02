import React from 'react';
import { cn } from '@/src/utils/helpers';
import { CherokeeBankLogo } from '../layout';

const Spinner = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

const PageLoader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg-primary z-50">
        <CherokeeBankLogo />
        <Spinner className="w-8 h-8 mt-4" />
    </div>
  );
};

export { Spinner, PageLoader };
