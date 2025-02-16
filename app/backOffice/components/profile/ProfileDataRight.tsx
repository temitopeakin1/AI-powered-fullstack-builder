import React from 'react';
import { Form } from '@remix-run/react';
import { useState } from 'react';
import { Checkbox } from '~/components/common/Checkbox';
import { ProfileDataRightProps } from '~/backOffice/types/profile';
import plus from '/icons/plus.svg';
import flag from '/flag.svg';
import envelope from '/icons/envelope.svg';

export default function ProfileDataRight({
  url = 'www.charlesxavier.com',
  email = 'charles.xavier@example.com',
  phone = '+40 700 200 400',
  isEmailConfirmed = false,
  country = 'Roamnia',
  onCheckChange,
}: ProfileDataRightProps) {
  const [isChecked, setIsChecked] = useState(isEmailConfirmed);

  const handleCheckChange = (checked: boolean) => {
    setIsChecked(checked);
    onCheckChange?.(checked);
  };

  return (
    <div className="w-full flex flex-col gap-4 mt-4 md:mt-2 items-start mb-8 md:mb-24">
      <h1 className="text-white text-lg font-semibold font-inter mt-4">Location</h1>
      <div className="w-full max-w-[292px] md:flex flex-col md:flex-row items-center justify-between mt-2">
        <div className="flex-1">
          <p className="text-[#777777] text-xs font-normal font-inter">Country</p>
          <div className="w-full max-w-[292px] flex items-center gap-4 mt-2">
            <img src={flag} alt="flag" className="w-6 h-6" />
            <p className="text-white text-sm font-inter font-light">{country}</p>
          </div>
        </div>
      </div>
      <div className="w-full border-t border-[#2C2C2C] mt-4"></div>
      <h2 className="text-white text-lg font-medium font-inter mt-2 pb-2">Site</h2>
      <p className="text-[#777777] text-xs md:text-xs font-normal font-inter tracking-wide">Website URL</p>
      <p className="text-[#86F49C] text-sm font-normal font-inter underline underline-offset-2 -mt-1 md:-mt-2">{url}</p>
      <div className="w-full border-t border-[#2C2C2C] mt-4"></div>

      {/* PHONE NUMBERS */}
      <div className="w-full">
        <h2 className="text-white text-lg font-medium font-inter mt-4">Phone Numbers</h2>
        <p className="text-[#777777] text-xs md:text-xs font-normal font-inter tracking-wide">
          Preferred phone number will be used for login and notification
        </p>
        <div className="w-full flex justify-between items-center gap-4 mt-4 pt-4">
          <div>
            <h2 className="text-[#777777] text-xs font-medium font-inter">Phone</h2>
            <p className="text-white text-sm font-inter font-light mt-1 ">{phone}</p>
          </div>
          <div className="flex flex-col ">
            <p className="text-[#777777] text-xs font-medium font-inter">Confirmed</p>
            <p className={`text-sm text-center font-inter mt-1 ${isChecked ? 'text-[#FFFFFF]' : 'text-[#FFFFFF]'}`}>
              {isChecked ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-[#777777] text-xs font-medium font-inter mt-1">Confirmed</p>
            <div className="flex items-center mt-1">
              <Checkbox checked={isChecked} onChange={handleCheckChange} />
            </div>
          </div>
        </div>

        <div className="w-full flex justify-between items-center gap-4 mt-4 border-t border-[#2C2C2C] pt-4">
          <div>
            <h2 className="text-biela-elements-textTertiary text-xs font-medium font-inter">Phone</h2>
            <p className="text-white text-sm font-inter font-light mt-1">{phone}</p>
          </div>
          <div className="flex flex-col ">
            <p className="text-[#777777] text-xs font-medium font-inter">Confirmed</p>
            <p className={`text-sm text-center font-inter mt-1 ${isChecked ? 'text-[#FFFFFF]' : 'text-[#FFFFFF]'}`}>
              {isChecked ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-[#777777] text-xs font-medium font-inter mt-2">Confirmed</p>
            <div className="flex items-center mt-1">
              <Checkbox checked={isChecked} onChange={handleCheckChange} />
            </div>
          </div>
        </div>

        <div className="w-full flex justify-between items-center gap-4 mt-4 border-t border-[#2C2C2C] pt-4">
          <div className="flex flex-row flex-wrap gap-4 mt-2">
            <Form className="relative md:w-full flex-1">
              <div className="flex justify-center items-center">
                <img src={flag} alt="msg" className="absolute left-4 top-1/2 transform -translate-y-1/2" />
                <div className="absolute left-12 top-2.5">+40</div>
              </div>
              <input
                type="text"
                name="title"
                placeholder="New phone number"
                className="font-inter w-full sm:w-[380px] h-[41px] text-white bg-transparent border border-[#2E2E2E] bg-[linear-gradient(180deg,_#010101_57.32%,_#161616_100%)] py-3 pr-3 pl-24 rounded-full focus:outline-none gap-[16px]"
                style={{
                  WebkitWidth: '-webkit-fill-available',
                  width: 'fill-available',
                }}
              />
            </Form>
            <button className="glass-button w-full sm:w-[101px] h-[41px] text-[#010101] text-sm bg-[#86F49C] pt-[12px] pr-[24px] pb-[12px] pl-[24px] flex items-center justify-center rounded-full gap-[8px]">
              <img src={plus} alt="add" className="w-3 h-3 invert" />
              Add
            </button>
          </div>
        </div>
      </div>
      <div className="w-full border-t border-[#2C2C2C] mt-4"></div>

      {/* EMAILS  */}
      <div className="w-full">
        <h2 className="text-white text-lg font-medium font-inter mt-4">Emails</h2>
        <p className="text-[#777777] text-xs md:text-xs font-normal font-inter tracking-wide">
          Preferred email will be used for login and notification
        </p>
        <div className="w-full flex justify-between items-center gap-4 mt-4 pt-4">
          <div>
            <h2 className="text-[#777777] text-xs font-medium font-inter">Email</h2>
            <p className="text-white text-sm font-inter font-light mt-1 truncate w-20 md:w-full">{email}</p>
          </div>
          <div className="flex flex-col ">
            <p className="text-[#777777] text-xs font-medium font-inter">Confirmed</p>
            <p className={`text-sm text-center font-inter mt-1 ${isChecked ? 'text-[#FFFFFF]' : 'text-[#FFFFFF]'}`}>
              {isChecked ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="flex  items-center justify-center">
            <p className="text-[#777777] text-xs font-medium font-inter mt-1">Confirmed</p>
            <div className="flex items-center mt-1">
              <Checkbox checked={isChecked} onChange={handleCheckChange} />
            </div>
          </div>
        </div>

        <div className="w-full flex justify-between items-center gap-4 mt-4 border-t border-[#2C2C2C] pt-4">
          <div>
            <h2 className="text-biela-elements-textTertiary text-xs font-medium font-inter">Email</h2>
            <p className="text-white text-sm font-inter font-light mt-1 truncate w-20 md:w-full">{email}</p>
          </div>
          <div className="flex flex-col ">
            <p className="text-[#777777] text-xs font-medium font-inter">Confirmed</p>
            <p className={`text-sm text-center font-inter mt-1 ${isChecked ? 'text-[#FFFFFF]' : 'text-[#FFFFFF]'}`}>
              {isChecked ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-[#777777] text-xs font-medium font-inter mt-2">Confirmed</p>
            <div className="flex items-center mt-1">
              <Checkbox checked={isChecked} onChange={handleCheckChange} />
            </div>
          </div>
        </div>

        <div className="w-full flex justify-between items-center gap-4 mt-4 border-t border-[#2C2C2C] pt-4">
          <div className="flex flex-row flex-wrap gap-4 mt-2">
            <Form className="relative flex-1">
              <img src={envelope} alt="msg" className="absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                name="title"
                placeholder="New email"
                className="font-inter w-full sm:w-[380px] h-[41px] text-white bg-transparent border border-[#2E2E2E] bg-[linear-gradient(180deg,_#010101_57.32%,_#161616_100%)] pt-[12px] pr-[48px] pb-[12px] pl-[48px] rounded-full focus:outline-none gap-[16px]"
                style={{
                  WebkitWidth: '-webkit-fill-available',
                  width: 'fill-available',
                }}
              />
            </Form>
            <button className="glass-button w-full sm:w-[101px] h-[41px] text-[#010101] text-sm bg-[#86F49C] pt-[12px] pr-[24px] pb-[12px] pl-[24px] flex items-center justify-center rounded-full gap-[8px]">
              <img src={plus} alt="add" className="w-3 h-3 invert" />
              Add
            </button>
          </div>
        </div>
      </div>
      <div className="w-full border-t border-[#2C2C2C] mt-4"></div>

      <div className="text-biela-elements-textPrimary text-lg mt-2">Account Deletion</div>
      <p className="text-biela-elements-textTertiary text-xs font-normal font-inter tracking-wide -mt-2">
        In case of deletition you’ll remove all your projects and personal data. Also you’ll lose control of projects in
        your organizations.
      </p>
      <button className="text-[#777777] text-sm bg-transparent border border-[#2E2E2E] py-[12px] px-[24px] flex items-center justify-center rounded-full mt-1.5 md:mt-3">
        Delete Account
      </button>
    </div>
  );
}
