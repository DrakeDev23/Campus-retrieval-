import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Accessible breadcrumb trail.
 * items: Array<{ label: string, to?: string }> — omit `to` on the current page.
 */
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex items-center gap-1.5 flex-wrap text-slate-500">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {idx > 0 && <span aria-hidden="true" className="text-slate-400">/</span>}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="font-medium text-slate-500 hover:text-blue-700 transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-700" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
