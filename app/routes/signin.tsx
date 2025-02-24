import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from '@remix-run/react';
import GreenLogo from '~/assets/icons/logo-green.svg';
import '../components/styles/signin.scss';
import CopyRighting from '~/components/common/copyRight';
import GoogleLogin from '../assets/icons/google-login.svg';
import GitHubIcon from '../assets/icons/fi-brands-github.svg';
import { useUser } from '~/ai/lib/context/userContext';
import { handleGitHubAuth, handleGoogleAuth } from '~/ai/lib/stores/user/user';
import { UserLoginContextType } from '~/types/user';
import InfoIcon from '~/assets/icons/infoIcon.svg';
import { UserStore } from '~/ai/lib/stores/user/userStore';

function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirectUrl'); // e.g. "https://dashboard.mywebsite.com/signin"

  const { login, isLoggedIn, setGoogleState } = useUser();
  const userStore = UserStore.getInstance();
  const { getRefreshToken } = userStore;

  const [formData, setFormData] = useState<UserLoginContextType>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Helper to redirect user based on the redirectUrl param or default logic
  const redirectAfterLogin = () => {
    if (redirectUrl) {
      const newUrl = new URL(redirectUrl);
      const refreshToken = getRefreshToken() as string;
      newUrl.searchParams.append('refreshToken', refreshToken);
      window.location.href = newUrl.toString();
    } else {
      const chatId = localStorage.getItem('chatId');
      navigate(chatId ? `/chat/${chatId}` : '/');
    }
  };

  // If user is already logged in, redirect accordingly
  useEffect(() => {
    if (!isLoggedIn()) {
      return;
    }

    setSuccess(
      redirectUrl ? `You're already logged in! Redirecting...` : `You're already logged in! Redirecting to home...`,
    );

    redirectAfterLogin();
  }, [navigate, isLoggedIn, redirectUrl]);

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

    try {
      const user = await login(formData);

      if (isLoggedIn()) {
        setSuccess(`You have successfully logged in! Redirecting...`);
        localStorage.setItem('sessionUser', JSON.stringify(user));
        setTimeout(redirectAfterLogin, 100);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const preHandleGoogleAuth = () => {
    const state = crypto.randomUUID().toString();
    setGoogleState(state);
    handleGoogleAuth(state);
  };

  return (
    <div className="flex items-center flex-col justify-between h-screen signin-bg">
      <section className="flex flex-col items-center justify-center gap-[46px] w-[-webkit-fill-available]">
        <NavLink to={'/'}>
          <img src={GreenLogo} alt="logo" className="w-[110px] mt-[60px] cursor-pointer" />
        </NavLink>
        <div className="form-border flex flex-col justify-center p-[24px] md:w-full border border-[#2E2E2E]">
          <h1 className="title-login">Login To Your Account</h1>
          <p className="desc-login">Enter your information below to get started</p>

          {/* FORM */}
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
            <button type="submit" className="glass-button login-green-btn" disabled={isLoggedIn()}>
              Login To Your Account
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

            <NavLink to="/forget-password">
              <div className="py-[9px] flex items-center justify-center">
                <span className="forgot-pass">Forgot Password?</span>
              </div>
            </NavLink>
            <div className="or-section">
              <div className="gradient-grey-left"></div>
              <span>OR</span>
              <div className="gradient-grey-right"></div>
            </div>
            <div className="flex-btn-login">
              <button
                type="button"
                className="w-full text-[18px] flex items-center justify-center font-[400] bg-[#fff] text-[black] google-login"
                onClick={preHandleGoogleAuth}
                disabled={isLoggedIn()}
              >
                <img className="mr-[10px]" src={GoogleLogin} alt={'google-login'} />
                Login With Google
              </button>
              <button
                type="button"
                className="w-full text-[18px] flex items-center justify-center font-[400] bg-[#fff] text-[black] git-login"
                onClick={handleGitHubAuth}
                disabled={isLoggedIn()}
              >
                <img alt={'github-login'} className="mr-[10px]" src={GitHubIcon} />
                Login With GitHub
              </button>
            </div>
            <NavLink to="/signup" style={{ paddingTop: '9px' }}>
              <span className="create-account">Create An Account</span>
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

export default SignIn;
