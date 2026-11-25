import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, IdCard, Lock } from './icons';
import { CheckboxField, FormField, PasswordField, PrimaryButton } from './FormField';
import { validateLoginPassword, validateLoginStudentId } from './validation';

const INITIAL = { studentId: '', password: '', remember: false };

export default function LoginForm({ onSwitchMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isClerkEnabled } = useAuth();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validators = {
    studentId: (v) => validateLoginStudentId(v.studentId),
    password: (v) => validateLoginPassword(v.password),
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const next = { ...values, [name]: type === 'checkbox' ? checked : value };
    setValues(next);
    setSuccess(false);
    if (errors[name] && validators[name] && !validators[name](next)) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (validators[name]) setErrors((prev) => ({ ...prev, [name]: validators[name](values) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = Object.fromEntries(Object.entries(validators).map(([k, fn]) => [k, fn(values)]));
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      e.currentTarget.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login({ studentId: values.studentId });
      setLoading(false);
      setSuccess(true);
      const destination = location.state?.from || '/dashboard';
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 700);
    }, 600);
  };

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
        <p className="mt-1.5 text-sm text-slate-500">Sign in with your university account to continue.</p>
      </header>

      {success && (
        <div role="status" className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-900">
          <span>Signed in successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField
          label="Student ID Number"
          name="studentId"
          type="text"
          inputMode="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Enter your Student ID Number"
          hint="Use your official university Student ID number to sign in."
          icon={IdCard}
          value={values.studentId}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.studentId}
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={Lock}
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <CheckboxField name="remember" checked={values.remember} onChange={handleChange}>
            Remember me
          </CheckboxField>
          <a
            href="#forgot-password"
            onClick={(e) => e.preventDefault()}
            className="rounded text-sm font-medium text-blue-700 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Forgot password?
          </a>
        </div>

        <PrimaryButton loading={loading}>
          Sign In
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </PrimaryButton>
      </form>

      {!isClerkEnabled && (
        <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600">
          <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Demo Accounts (Any Password):
          </p>
          <div className="space-y-1 text-[11px]">
            <p>
              &bull; <strong className="text-slate-900">Student:</strong> ID{' '}
              <button
                type="button"
                onClick={() => setValues((v) => ({ ...v, studentId: '2024-08912' }))}
                className="font-mono text-blue-700 underline hover:text-blue-900 cursor-pointer"
              >
                2024-08912
              </button>{' '}
              (Jane G. Doe)
            </p>
            <p>
              &bull; <strong className="text-slate-900">Administrator:</strong> ID{' '}
              <button
                type="button"
                onClick={() => setValues((v) => ({ ...v, studentId: 'admin' }))}
                className="font-mono text-amber-700 underline hover:text-amber-900 cursor-pointer"
              >
                admin
              </button>{' '}
              (Officer R. Santos)
            </p>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-slate-600">
        New to Campus Retrieval?{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="rounded font-semibold text-blue-700 underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Create an account
        </button>
      </p>
    </div>
  );
}
