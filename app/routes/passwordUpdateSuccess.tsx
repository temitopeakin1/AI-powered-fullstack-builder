import GreenLogo from '~/assets/icons/logo-green.svg';
import '../components/styles/signin.scss';
import { NavLink } from '@remix-run/react';
import React from 'react';
import CopyRighting from '~/components/common/copyRight';
import LeftArrow from '../assets/icons/fi-rr-arrow-left.svg';
import HistoryIcon from '../assets/icons/history.png';

export default function PasswordUpdateSuccess() {
  return (
    <div className="flex items-center flex-col justify-between h-screen signin-bg">
      <section className="flex flex-col items-center justify-center gap-[46px]">
        <NavLink to={'/'}>
          <img src={GreenLogo} className="w-[110px] mt-[60px] cursor-pointer" />
        </NavLink>
        <img className="w-[130px] mt-[60px] cursor-pointer" src={HistoryIcon} alt="" />
        <div className="flex flex-col justify-center md:w-full" style={{ gap: '32px', maxWidth: '855px' }}>
          <h1 className="title-login text-center success-pass" style={{ fontSize: '49px', lineHeight: '64px' }}>
            Password Updated Successfully
          </h1>
          <p className={'reset-pass'}>Your password has been reset. You can now log in with your new password.</p>
          <NavLink to={'/signin'}>
            <button className={'login-green-btn glass-button return-btn'}>
              <img src={LeftArrow} alt="" />
              Return to Login
            </button>
          </NavLink>
        </div>
      </section>
      <div className="mt-[30px]">
        <CopyRighting />
      </div>
    </div>
  );
}
