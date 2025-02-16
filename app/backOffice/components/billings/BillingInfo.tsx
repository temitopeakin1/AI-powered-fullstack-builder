import { useState } from 'react';
import Select, {
  ActionMeta,
  components,
  DropdownIndicatorProps,
  GroupBase,
  MultiValue,
  OptionProps,
  SingleValue,
  SingleValueProps,
  StylesConfig,
} from 'react-select';

import ArrowDown from '~/assets/icons/arrowIcon.svg';
import { IOptions } from '~/backOffice/types/billings';

export default function BillingInfo() {
  const fields = [
    { id: 'address1', label: 'Address Line 1', type: 'text' },
    { id: 'address2', label: 'Address Line 2', type: 'text' },
    { id: 'city', label: 'City', type: 'text' },
    {
      id: 'country',
      label: 'Country',
      type: 'select',
      options: [
        { value: 'Romania', label: 'Romania' },
        { value: 'USA', label: 'USA' },
        { value: 'Canada', label: 'Canada' },
        { value: 'UK', label: 'UK' },
      ],
    },
    { id: 'company_name', label: 'Company Name (Optional)', type: 'text' },
    { id: 'company_registration_no', label: 'Company Registration Number (Optional)', type: 'text' },
  ];

  const [selectedCountry, setSelectedCountry] = useState<SingleValue<IOptions>>(null);

  const handleChange = (newValue: SingleValue<IOptions> | MultiValue<IOptions>, actionMeta: ActionMeta<IOptions>) => {
    setSelectedCountry(newValue as SingleValue<IOptions>);
  };

  const SingleValueComponent = ({
    data,
  }: SingleValueProps<{ value: string; label: string }, boolean, GroupBase<{ value: string; label: string }>>) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>{data.label}</span>
    </div>
  );

  const OptionComponent = (props: OptionProps<IOptions, false, GroupBase<IOptions>>) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 10,
          cursor: 'pointer',
        }}
      >
        <span>{data.label}</span>
      </div>
    );
  };

  const customStyles: StylesConfig<IOptions, false, GroupBase<IOptions>> = {
    control: (base) => ({
      ...base,
      borderColor: '#2E2E2E',
      borderRadius: '500px',
      boxShadow: 'none',
      fontSize: '14px',
      color: 'white',
      background: 'linear-gradient(180deg,#010101 57.32%,#161616 100%)',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: '41px',
      paddingTop: '6px',
      paddingRight: '12px',
      paddingBottom: '6px',
      paddingLeft: '15px',
      marginTop: '8px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'black',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      marginTop: 8,
      border: '1px solid #2E2E2E',
      width: '100%',
    }),
    singleValue: (base) => ({
      ...base,
      display: 'flex',
      alignItems: 'center',
      margin: '0',
      padding: '0',
      height: '100%',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    }),
    option: (base) => ({
      ...base,
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#cceeff',
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '0',
      margin: '0',
    }),
    clearIndicator: (base, props) => ({
      ...base,
      cursor: 'pointer',
      fontSize: '14px',
      padding: '2px 5px',
      color: props.isFocused ? '#00B5FF' : '#777',
    }),
  };

  const DropdownIndicator = (props: DropdownIndicatorProps<IOptions, false, GroupBase<IOptions>>) => {
    return (
      <components.DropdownIndicator {...props}>
        <img src={ArrowDown} alt="arrow icon" />
      </components.DropdownIndicator>
    );
  };

  return (
    <div className="w-full md:max-w-[422px]">
      <h1 className="text-white text-lg font-semibold font-inter mt-4">Billing Information</h1>
      <div className="w-full flex flex-col md:flex-row items-center justify-between mt-2">
        <div className="flex flex-col w-full mt-2 md:mt-4">
          {fields.map(({ id, label, type, options }) => (
            <div key={id} className="mb-4 grid grid-cols-1">
              <label htmlFor={id} className="text-[#777777] text-xs font-normal font-inter">
                {label}
              </label>
              {type === 'text' ? (
                <input
                  type="text"
                  id={id}
                  name={id}
                  placeholder=""
                  className="font-inter h-[41px] text-white bg-transparent border border-[#2E2E2E] mt-2 p-3 rounded-full focus:outline-none gap-[16px] bg-[linear-gradient(180deg,_#010101_57.32%,_#161616_100%)]"
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
                      placeholder=""
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
    </div>
  );
}
