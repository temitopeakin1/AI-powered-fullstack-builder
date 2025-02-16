import { NavLink, useLocation } from '@remix-run/react';
import '../../styles/settings-nav.scss';
import React from 'react';
import save from '/icons/save.svg';

const navItems = [
  { name: 'Billing', path: '/settings/billing' },
  { name: 'Profile', path: '/settings/profile' },
];

export function SettingsNav() {
  const location = useLocation();
  const isProfilePage = location.pathname === '/settings/profile';
  return (
    <nav className="flex flex-row gap-16 ml-[28px]">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) => `
            relative pb-8 text-sm font-inter
            ${isActive ? 'text-[#86F49C]' : 'text-white'}
            hover:text-[#86F49C] transition-colors
          `}
        >
          {({ isActive }) => (
            <div className=" ">
              {item.name}
              {isActive && <div className="absolute bottom-0 nav-line  w-full h-[1px] bg-[#86F49C]" />}
            </div>
          )}
        </NavLink>
      ))}
      {isProfilePage && (
        <button className="hidden md:flex items-center ml-auto glass-button  h-[41px] text-[#010101] text-sm bg-[#86F49C] py-[12px] px-[24px] justify-center rounded-full gap-[8px] whitespace-nowrap">
          <img src={save} alt="add" className="w-[16px] h-[16px]" />
          Save Changes
        </button>
      )}
    </nav>
  );
}
