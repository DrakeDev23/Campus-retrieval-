import React, { useId, useState } from 'react';
import { CircleAlert, Eye, EyeOff } from './icons';

const INPUT_BASE =
  'block w-full rounded-lg border bg-white py-2.5 text-sm text-slate-900 placeholder:text-slate-400 ' +
  'transition focus:outline-none focus:ring-2 focus:ring-offset-0';

function inputClasses(hasError, hasIcon, hasTrailing) {
  return [
    INPUT_BASE,
    hasIcon ? 'pl-10' : 'pl-3.5',
    hasTrailing ? 'pr-11' : 'pr-3.5',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-blue-100',
  ].join(' ');
}

/**
 * Labelled text input with optional leading icon, hint and error message.
 * Error/hint text is linked to the input via aria-describedby.
 */
export function FormField({
  label,
  name,
  error,
  hint,
  icon: Icon,
  trailing,
  type = 'text',
  className = '',
  ...inputProps
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={inputClasses(Boolean(error), Boolean(Icon), Boolean(trailing))}
          {...inputProps}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">{trailing}</div>}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600">
          <CircleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-1.5 text-xs text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Show/hide toggle button used inside password fields. */
export function PasswordToggle({ visible, onToggle, controlLabel = 'password' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={visible}
      aria-label={`${visible ? 'Hide' : 'Show'} ${controlLabel}`}
      className="rounded-md p-2 text-slate-400 transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

/** Password input with its own visibility state (or controlled via `visible`/`onToggle`). */
export function PasswordField({ visible, onToggle, controlLabel, ...props }) {
  const [localVisible, setLocalVisible] = useState(false);
  const isControlled = typeof visible === 'boolean';
  const show = isControlled ? visible : localVisible;
  const toggle = isControlled ? onToggle : () => setLocalVisible((v) => !v);

  return (
    <FormField
      {...props}
      type={show ? 'text' : 'password'}
      trailing={<PasswordToggle visible={show} onToggle={toggle} controlLabel={controlLabel} />}
    />
  );
}

/** Checkbox with label content (supports links) and optional error. */
export function CheckboxField({ name, checked, onChange, error, children }) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 ${
            error ? 'border-red-400' : ''
          }`}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-snug text-slate-600">
          {children}
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600">
          <CircleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/** Primary blue button with a yellow accent bar along the bottom edge. */
export function PrimaryButton({ children, loading = false, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
      <span className="absolute inset-x-0 bottom-0 h-1 bg-yellow-400" aria-hidden="true" />
    </button>
  );
}
