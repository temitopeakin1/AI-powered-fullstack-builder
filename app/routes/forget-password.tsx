import React, { useState } from 'react';
import GreenLogo from '~/assets/icons/logo-green.svg';
import { NavLink } from '@remix-run/react';
import '../components/styles/signin.scss';
import { forgetPassword } from '~/ai/lib/stores/user/user';
import CopyRighting from '~/components/common/copyRight';
import InfoIcon from '~/assets/icons/infoIcon.svg';

interface FormData {
  email: string;
  code: string;
}

function ForgetPassword() {
  const [formData, setFormData] = useState<FormData>({ email: '', code: '' });
  const [step, setStep] = useState<'emailInput' | 'codeSentOnEmail' | 'emailNotFound'>('emailInput');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Email validation function
  const validateEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const res = await forgetPassword({ email: formData.email });

      if (!res.ok) {
        const errorData = (await res.json()) as { message: string };

        if (errorData.message === 'Email not found') {
          setStep('emailNotFound'); // Switch to "Email Not Found" step

          return;
        }

        throw new Error(errorData.message || 'Failed to send code.');
      }

      setSuccess('Code sent successfully.');
      setStep('codeSentOnEmail'); // Move to the next step
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const openMailApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Opens up the mail app. Please test it and let me know if we should keep it.
    window.location.href = `mailto:`;
  };

  return (
    <div className="flex items-center flex-col justify-between h-screen signin-bg">
      <section className="flex flex-col items-center justify-center gap-[46px]">
        <NavLink to={'/'}>
          <img src={GreenLogo} className="w-[110px] mt-[60px] cursor-pointer" />
        </NavLink>
        <div className="form-border flex flex-col justify-center p-[24px] md:w-full border border-[#2E2E2E] mt-24">
          <h1 className="title-login">
            {step === 'emailNotFound'
              ? 'Email Not Found'
              : step === 'codeSentOnEmail'
                ? 'Check your email'
                : 'Forgot Password?'}
          </h1>
          <p className="desc-login">
            {step === 'emailNotFound'
              ? 'The email you entered is not registered with us. Please check and try again or sign up for a new account.'
              : step === 'codeSentOnEmail'
                ? 'You received an email that contains the Password Reset link.'
                : "Enter your email address below, and we'll send you a code to reset your password."}
          </p>

          {/* FORM */}
          <form onSubmit={step === 'emailInput' ? handleEmailSubmit : openMailApp} className="flex flex-col gap-[15px]">
            {step === 'emailInput' || step === 'emailNotFound' ? (
              <div className="input-container">
                <label htmlFor="email" className="input-label">
                  Email <span>*</span>
                </label>
                <input
                  type="text"
                  id="email"
                  className={`login-new-input ${step === 'emailNotFound' ? 'input-error' : ''}`}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Your Email"
                />
              </div>
            ) : null}

            {step === 'emailNotFound' ? (
              <NavLink to="/login" className="glass-button login-green-btn text-center">
                Back to Login
              </NavLink>
            ) : (
              <button type="submit" className="glass-button login-green-btn">
                {
                  step === 'emailInput' ? 'Get Code' : 'Open Mail' // codeSentOnEmail step
                }
              </button>
            )}

            {/* Display error or success messages */}
            {error && (
              <div className="flex items-start rounded-lg p-3 bg-[rgba(134,244,156,0.07)]">
                <img src={InfoIcon} alt="Information icon" className="mr-[12px]" />
                <p className="error-signin !mt-0 !text-[13px] font-light leading-[15px]">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-start rounded-lg p-3 bg-[rgba(134,244,156,0.07)]">
                <img src={InfoIcon} alt="Information icon" className="mr-[12px]" />
                <p className="success-signin !mt-0 !text-white !text-[13px] font-light leading-[15px]">{success}</p>
              </div>
            )}
          </form>

          {step === 'emailNotFound' && (
            <NavLink to="/signup" className="text-center text-[#86F49C] underline mt-4">
              Create an Account
            </NavLink>
          )}
        </div>
      </section>
      <div className="mt-[30px]">
        <CopyRighting />
      </div>
    </div>
  );
}

export default ForgetPassword;
