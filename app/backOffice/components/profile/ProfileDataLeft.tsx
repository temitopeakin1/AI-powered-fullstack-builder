import React, { useState } from 'react';
import BillingInfo from '~/backOffice/components/billings/BillingInfo';
import { ProfileDataLeftProps } from '~/backOffice/types/profile';
import Select, { components } from 'react-select';

const fields = [
  {
    id: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Charles',
  },
  {
    id: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Xavier',
  },
];

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'transparent',
    border: '1px solid #2E2E2E',
    borderRadius: '9999px',
    padding: '2px 8px',
    color: 'white',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#777777',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#010101',
    color: 'white',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#161616' : '#010101',
    color: 'white',
  }),
};

const SingleValueComponent = (props) => <components.SingleValue {...props} />;

const OptionComponent = (props) => <components.Option {...props} />;

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <img src="/dropdown-icon.svg" alt="Dropdown" className="w-4 h-4" />
  </components.DropdownIndicator>
);

export default function ProfileDataLeft({
  firstName = 'Charles',
  lastName = 'Xavier',
  title = 'Programmer And Coder',
}: ProfileDataLeftProps) {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
  };

  return (
    <div className="w-full flex flex-col gap-4 mt-4 md:mt-2 items-start mb-8 md:mb-24">
      <div className="flex w-full justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#BEDDFF] rounded-full overflow-hidden">
            <img src="/profileImage.svg" alt="Profile" className="w-[51px] h-[51px]" />
          </div>
          <div>
            <h2 className="text-white text-base md:text-lg font-medium font-inter tracking-wider pb-2">
              {firstName} {lastName}
            </h2>
            <p className="text-[#777777] text-xs md:text-xs font-inter tracking-wide">{title}</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:max-w-[422px]  border-t border-[#2C2C2C] mt-4"></div>

      <h1 className="text-white text-lg font-semibold font-inter mt-4">User Information</h1>
      <div className="w-full flex flex-col md:flex-row items-center justify-between mt-2">
        <div className="flex flex-col w-full mt-2 md:mt-4 lg:max-w-[422px]">
          {fields.map(({ id, label, type, placeholder, options }) => (
            <div key={id} className="mb-4 grid grid-cols-1">
              <label htmlFor={id} className="text-[#777777] text-xs font-normal font-inter">
                {label}
              </label>
              {type === 'text' ? (
                <input
                  type="text"
                  id={id}
                  name={id}
                  placeholder={placeholder}
                  className="font-inter h-[41px]  bg-transparent border border-[#2E2E2E] mt-2 p-3 rounded-full focus:outline-none gap-[16px] bg-[linear-gradient(180deg,_#010101_57.32%,_#161616_100%)]"
                />
              ) : (
                options && (
                  <div>
                    <Select
                      id={id}
                      name={id}
                      options={options}
                      components={{
                        SingleValue: SingleValueComponent,
                        Option: OptionComponent,
                        IndicatorSeparator: null,
                        DropdownIndicator,
                      }}
                      styles={customStyles}
                      placeholder={placeholder}
                      onChange={handleChange}
                      value={selectedCountry}
                    />
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:max-w-[422px] border-t border-[#2C2C2C] mt-4"></div>
      <BillingInfo />
    </div>
  );
}
