import React, { useEffect, useState } from 'react';
import GreenLogo from '~/assets/icons/logo-green.svg';
import '../components/styles/signin.scss';
import { NavLink, useNavigate } from '@remix-run/react';
import CopyRighting from '~/components/common/copyRight';
import GoogleLogin from '../assets/icons/google-login.svg';
import GitHubIcon from '../assets/icons/fi-brands-github.svg';
import { useUser } from '~/ai/lib/context/userContext';
import { handleGitHubAuth, handleGoogleAuth } from '~/ai/lib/stores/user/user';
import { UserLoginContextType } from '~/types/user';

function SignIn() {
  const navigate = useNavigate();
  const { login, isLoggedIn, setGoogleState } = useUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      return;
    }

    setSuccess(`You're already logged in! Redirecting to home...`);

    setTimeout(() => {
      // navigate('/');
      const chatId = localStorage.getItem('chatId');
      navigate(chatId ? `/chat/${chatId}` : '/');
    }, 2000);
  }, [navigate, isLoggedIn]);

  const [formData, setFormData] = useState<UserLoginContextType>({
    username: '',
    password: '',
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

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
        setSuccess(`You have successfully logged in! Redirecting to home...`);

        localStorage.setItem('sessionUser', JSON.stringify(user));

        setTimeout(() => {
          const chatId = localStorage.getItem('chatId');
          navigate(chatId ? `/chat/${chatId}` : '/');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const preHandleGoogleAuth = () => {
    const state = crypto.randomUUID().toString();
    setGoogleState(state);

    handleGoogleAuth(state);
  }

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
            {error && <p className={'error-signin'}>{error}</p>}
            {success && <p className={'success-signin'}>{success}</p>}
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
                disabled={isLoggedIn()}>
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
