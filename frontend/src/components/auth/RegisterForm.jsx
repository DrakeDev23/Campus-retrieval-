import React, { useState } from 'react';
import { ArrowRight, IdCard, Lock, Mail, User } from './icons';
import { CheckboxField, FormField, PasswordField, PrimaryButton } from './FormField';
import {
  validateConfirmPassword,
  validateEmail,
  validateNewPassword,
  validateRequired,
  validateStudentId,
} from './validation';

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  studentId: '',
  password: '',
  confirmPassword: '',
  terms: false,
};

const validators = {
  firstName: (v) => validateRequired(v.firstName, 'Enter your first name.'),
  lastName: (v) => validateRequired(v.lastName, 'Enter your last name.'),
  email: (v) => validateEmail(v.email),
  studentId: (v) => validateStudentId(v.studentId),
  password: (v) => validateNewPassword(v.password),
  confirmPassword: (v) => validateConfirmPassword(v.password, v.confirmPassword),
  terms: (v) => (v.terms ? '' : 'You must accept the terms to create an account.'),
};

export default function RegisterForm({ onSwitchMode }) {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const next = { ...values, [name]: type === 'checkbox' ? checked : value };
    setValues(next);
    setSuccess(false);

    setErrors((prev) => {
      const updated = { ...prev };
      // Only clear errors on edit; new errors appear on blur/submit.
      if (prev[name] && !validators[name](next)) updated[name] = '';
      // Keep confirm-password in sync when the password changes.
      if (name === 'password' && prev.confirmPassword && !validators.confirmPassword(next)) {
        updated.confirmPassword = '';
      }
      return updated;
    });
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
    // Frontend-only prototype: simulate a request, no account is created.
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 800);
  };

  const shared = { onChange: handleChange, onBlur: handleBlur };
  const toggle = { visible: showPasswords, onToggle: () => setShowPasswords((v) => !v) };

  return (
    <div>
      <header className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h2>
        <p className="mt-1.5 text-sm text-slate-500">Register with your university details to get started.</p>
      </header>

      {success && (
        <div role="status" className="mb-5 flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3 text-sm text-blue-900">
          <span>
            Prototype only: no account was created. In the full system, a verification link will be sent to{' '}
            <strong className="font-semibold">{values.email.trim()}</strong>.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <FormField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            placeholder="Jane"
            icon={User}
            value={values.firstName}
            error={errors.firstName}
            {...shared}
          />
          <FormField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            placeholder="Doe"
            value={values.lastName}
            error={errors.lastName}
            {...shared}
          />
        </div>

        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="yourname@gmail.com"
          icon={Mail}
          hint="Only @gmail.com addresses are accepted. Email verification will be added later."
          value={values.email}
          error={errors.email}
          {...shared}
        />

        <FormField
          label="Student ID number"
          name="studentId"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 20240123"
          icon={IdCard}
          value={values.studentId}
          error={errors.studentId}
          {...shared}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            icon={Lock}
            controlLabel="passwords"
            hint="8+ characters with a letter and a number."
            value={values.password}
            error={errors.password}
            {...toggle}
            {...shared}
          />
          <PasswordField
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter password"
            icon={Lock}
            controlLabel="passwords"
            value={values.confirmPassword}
            error={errors.confirmPassword}
            {...toggle}
            {...shared}
          />
        </div>

        <CheckboxField name="terms" checked={values.terms} onChange={handleChange} error={errors.terms}>
          I agree to the{' '}
          <a href="#terms" onClick={(e) => e.preventDefault()} className="font-medium text-blue-700 underline underline-offset-2">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="font-medium text-blue-700 underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </CheckboxField>

        <PrimaryButton loading={loading}>
          Create Account
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </PrimaryButton>
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="rounded font-semibold text-blue-700 underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Back to Sign In
        </button>
      </p>
    </div>
  );
}
