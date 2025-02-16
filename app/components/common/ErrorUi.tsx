import React from 'react';
import { NavLink } from '@remix-run/react';
import styles from '../../ai/styles/BaseChat.module.scss';

import Logo from '~/assets/icons/logo-green-error-page.svg';
import '../styles/font.scss';
import { classNames } from '~/utils/classNames';
import ErrorPageIcon from '../../assets/icons/Error-page-background.png';
import ArrowLeftIcon from '../../assets/icons/arrow-left-go-icon.svg';
import { ErrorPageProps } from '~/components/types/componentTypes';

const ErrorUi: React.FC<ErrorPageProps> = ({ title, description, buttonText, buttonLink, children }) => {
  return (
    <div
      className="w-full h-screen min-h-screen bg-black bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${ErrorPageIcon})` }}
    >
      <header className="p-[48px]">
        <img src={Logo} className="" alt="Logo" />
      </header>
      <div className="flex flex-col items-center justify-center mt-[100px]">
        <div className="p-[48px] lg:w-[682px] flex flex-col items-center gap-[32px] justify-center text-center">
          {children}
          <p className={classNames(styles.RextonFont, 'text-[#ffffff] text-[49px] font-[500]')}>{title}</p>
          <p className={classNames(styles.RextonFont, 'text-[#f5f5f5] text-[20px] font-[400]')}>{description}</p>
          <NavLink to={buttonLink}>
            <button className="glass-button cursor-pointer shadow-sm ring-2 ring-[#86F49C] flex w-[136px] gap-2 items-center justify-center text-[black] py-[12px] px-[24px] bg-[#86F49C] rounded-full">
              <img src={ArrowLeftIcon} alt="arrow" />
              {buttonText}
            </button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
export default ErrorUi;
