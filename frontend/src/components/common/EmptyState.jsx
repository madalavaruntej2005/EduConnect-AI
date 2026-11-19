import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl ${className}`}>
      {Icon && (
        <div className="w-14 h-14 mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5">{description}</p>}
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
