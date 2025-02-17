import React, { useEffect, useState } from 'react';
import GreenLogo from '~/assets/icons/logo-green.svg';
import '../components/styles/signin.scss';
import { NavLink, useLocation, useNavigate } from '@remix-run/react';
import CopyRighting from '~/components/common/copyRight';
import GoogleIcon from '../assets/icons/google-login.svg';
import GitHub from '../assets/icons/fi-brands-github.svg';
import { useUser } from '~/ai/lib/context/userContext';
import { handleGitHubAuth, signUp } from '~/ai/lib/stores/user/user';
import { UserSignupContextType } from '~/types/user';
import InfoIcon from '~/assets/icons/infoIcon.svg';

function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<UserSignupContextType>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referral: '',
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const { isLoggedIn } = useUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      return;
    }

    setSuccess(`You're already logged in! Redirecting to home...`);

    setTimeout(() => {
      navigate('/');
    }, 2000);
  }, [navigate, isLoggedIn]);

  // If there is a ?referral=xxx in the URL, use that. Otherwise, try in localStorage.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlReferral = params.get('referral');

    if (urlReferral) {
      localStorage.setItem('referral', urlReferral);

      setFormData((prev) => ({
        ...prev,
        referral: urlReferral,
      }));

      return;
    }

    const storedReferral = localStorage.getItem('referral');

    if (storedReferral) {
      setFormData((prev) => ({
        ...prev,
        referral: storedReferral,
      }));
    }
  }, [location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await signUp(formData);

      if (!response.ok) {
        const errorData = (await response.json()) as Error;

        throw new Error(errorData.message || 'Registration failed');
      }

      const isSuccess = await response.json();

      if (isSuccess) {
        setSuccess('Email confirmation was sent. Please confirm your email and then Log in.');
      } else {
        setError('Registration failed (server returned false).');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex items-center flex-col justify-between h-screen signin-bg">
      <section className="flex flex-col items-center justify-center gap-[46px] w-[-webkit-fill-available]">
        <NavLink to={'/'}>
          <img alt="logo" src={GreenLogo} className="w-[110px] mt-[60px] cursor-pointer" />
        </NavLink>
        <div className=" form-border flex flex-col  justify-center p-[24px] lg:w-[448px]  md:w-full border border-[#2E2E2E]">
          <h1 className="title-login">Create An Account</h1>
          <p className="desc-login">Enter your credential to create an account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[12px]">
            <div className="input-container">
              <label htmlFor="username" className="input-label">
                Username <span>*</span>
              </label>
              <input
                type="text"
                id="outlined-basic"
                className="login-new-input"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={'Enter Your Username'}
                autoComplete="off"
              />
            </div>
            <div className="input-container">
              <label htmlFor="email" className="input-label">
                Email <span>*</span>
              </label>
              <input
                type="text"
                id="outlined-basic"
                className="login-new-input"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={'Enter Your Email'}
                autoComplete="off"
              />
            </div>
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

            <button type="submit" className="glass-button login-green-btn" disabled={isLoggedIn()}>
              Create An Account
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

            <div className="or-section">
              <div className="gradient-grey-left"></div>
              <span>OR</span>
              <div className="gradient-grey-right"></div>
            </div>

            <div className="flex-btn-login">
              <button
                type="button"
                className="w-full text-[18px] flex items-center justify-center font-[400] bg-[#fff] text-[black] google-login"
                disabled={isLoggedIn()}
              >
                <img alt={'google-login'} className="mr-[10px]" src={GoogleIcon} />
                Login With Google
              </button>
              <button
                type="button"
                className="w-full text-[18px] flex items-center justify-center font-[400] bg-[#fff] text-[black] git-login"
                onClick={handleGitHubAuth}
                disabled={isLoggedIn()}
              >
                <img alt={'github-login'} className="mr-[10px]" src={GitHub} />
                Login With GitHub
              </button>
            </div>

            <NavLink to="/signin" style={{ paddingTop: '9px' }}>
              <span className="create-account">Login</span>
            </NavLink>
          </form>
        </div>
      </section>

      <div className="mt-[30px]">
        <CopyRighting />
      </div>
    </div>
  );
}

export default SignUp;
