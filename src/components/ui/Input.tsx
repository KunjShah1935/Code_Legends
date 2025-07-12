import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

// 👇 Note: wrap the function in React.forwardRef
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      icon,
      id,
      ...props
    },
    ref // <-- this is the forwarded ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">{icon}</div>
            </div>
          )}
          <input
            ref={ref} // <-- forward the ref here
            id={inputId}
            className={cn(
              'block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-300',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:shadow-glow-sm',
              'hover:border-gray-400 dark:hover:border-gray-500',
              'disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500',
              icon && 'pl-10',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

// For better debugging in React DevTools
Input.displayName = 'Input';
