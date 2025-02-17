import React, { useState } from 'react';
import GreenLogo from '~/assets/icons/logo-green.svg';
import '../components/styles/signin.scss';
import { NavLink, useNavigate, useSearchParams } from '@remix-run/react';
import { confirmPassword } from '~/ai/lib/stores/user/user';
import CopyRighting from '~/components/common/copyRight';
import InfoIcon from '~/assets/icons/infoIcon.svg';


interface FormData {
  password: string;
  confirmPassword: string;
}

export default function ConfirmPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({ password: '', confirmPassword: '' });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  if (!token) {
    setError('Invalid confirmation link');

    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    // Validate password length and format
    if (!validatePassword(formData.password)) {
      setError(
        'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
      );
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');

      return;
    }

    try {
      await confirmPassword({ token, password: formData.password });

      setSuccess('Password updated successfully!');
      setTimeout(() => {
        navigate('/PasswordUpdateSuccess');
      }, 1000);
    } catch (err) {
      setError((err as { message: string }).message || 'Something went wrong');
    }
  };

  return (
    <div className="flex items-center flex-col justify-between h-screen signin-bg">
      <section className="flex flex-col items-center justify-center gap-[46px]">
        <NavLink to={'/'}>
          <img src={GreenLogo} className="w-[110px] mt-[60px] cursor-pointer" />
        </NavLink>
        <div className="form-border flex flex-col justify-center p-[24px] md:w-full border border-[#2E2E2E]">
          <h1 className="title-login">Create New Password</h1>
          <p className="desc-login">Enter your new password and confirm it to secure your account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">
            <div className="input-container">
              <label htmlFor="password" className="input-label">
                Password <span>*</span>
              </label>
              <input
                type="password"
                id="outlined-basic"
                className="login-new-input"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={'Enter Your Password'}
                autoComplete="off"
              />
            </div>
            <div className="input-container">
              <label htmlFor="password" className="input-label">
                Confirm Password <span>*</span>
              </label>
              <input
                type="password"
                id="outlined-basic"
                className="login-new-input"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={'Confirm Your Password'}
                autoComplete="off"
              />
            </div>

            <div className="desc-login" style={{ paddingBottom: '0' }}>
              Your password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a
              number, and a special character.
            </div>
            <button type="submit" className="glass-button login-green-btn">
              Update Password
            </button>

            {/* Display error or success messages here */}
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
        </div>
      </section>
      <div className="mt-[30px]">
        <CopyRighting />
      </div>
    </div>
  );
}
