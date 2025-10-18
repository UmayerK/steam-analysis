import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm text-gray-400">
            {label}
          </label>
        )}
        <select
          className={`
            bg-slate-800 text-white rounded-lg px-4 py-2
            border border-slate-700 focus:border-blue-500
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
            cursor-pointer transition-colors
            ${className || ''}
          `}
          ref={ref}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
