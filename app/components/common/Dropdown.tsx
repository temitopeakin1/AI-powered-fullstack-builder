import React, { useEffect, useRef, useState } from 'react';
import ArrowDown from '~/assets/icons/arrowIcon.svg';
import SearchIcon from '~/assets/icons/searchIcon.svg';

export interface DropdownItems {
  label: string;
  value: string | number;
  icon?: string;
}

interface IBasicDropdown<T> {
  value?: T | string;
  items: DropdownItems[];
  disabled: boolean;
  onSelect: (arg: T | DropdownItems) => void;
  label?: string;
  placeholder?: string;
}

export type DropdownData = string | DropdownItems;

export default function Dropdown<T extends DropdownData>({
  value,
  items,
  disabled,
  onSelect,
  label,
  placeholder = 'Select an option',
}: IBasicDropdown<T>) {
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [selection, setSelection] = useState<DropdownData | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number>(0);

  useEffect(() => {
    setSelection(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (parentRef.current && parentRef.current.contains(event.target as Node)) {
        return;
      }

      setExpanded(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleSelect(item: T | DropdownItems, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setSelection(item);
    onSelect(item);
    setExpanded(false);
  }

  const filteredItems = items.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    if (parentRef.current) {
      setDropdownWidth(parentRef.current.offsetWidth);
    }
  }, [isExpanded, items]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (parentRef.current) {
        setDropdownWidth(parentRef.current.offsetWidth);
      }
    });

    if (parentRef.current) {
      observer.observe(parentRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      setExpanded((prev) => !prev);
    }
  };

  const handleSearchClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div ref={parentRef} className={'relative w-full'} onClick={(e) => e.stopPropagation()}>
      {label && (
        <label className={'text-[12px] text-[#BBB]'} style={{ fontFamily: 'Inter' }}>
          {label}
        </label>
      )}
      <div
        className={`flex items-center justify-between max-h-[40px] w-full rounded-[8px] p-[12px] mt-[4px] cursor-pointer`}
        style={{
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(31, 31, 31, 0.80) 51.22%)',
          border: '1px solid rgba(255, 255, 255, 0.19)',
        }}
        onClick={handleToggle}
      >
        {(typeof selection === 'string' && selection) ||
        (typeof selection === 'object' && (selection as { value: string | number }).value) ? (
          typeof selection === 'string' ? (
            <div>{selection}</div>
          ) : (
            <div className="flex items-center gap-[8px]">
              {selection.icon && <img src={selection.icon} alt={selection.label} width={16} height={16} />}
              <span className="text-[14px] font-[Inter] text-white uppercase">{selection.label}</span>
            </div>
          )
        ) : (
          <span className="text-[#BBB] text-[14px] font-[Inter]">{placeholder}</span>
        )}
        <img src={ArrowDown} alt="arrow icon" className={isExpanded ? 'rotate-180' : ''} />
      </div>
      {isExpanded && (
        <div
          ref={dropdownRef}
          // TODO: update scroll design
          className={`${filteredItems.length > 3 ? 'overflow-y-scroll' : ''} z-max max-h-[200px] absolute top-[100%] left-0 mt-[8px] p-[12px] opacity-100 visible border border-[#394142] rounded-[8px]`}
          style={{
            width: `${dropdownWidth}px`,
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(31, 31, 31, 0.80) 51.22%)',
            backdropFilter: 'blur(25px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {items?.length > 5 ? (
            <div>
              <label>
                <div className={'relative flex items-center w-full px-[8px]'}>
                  <img src={SearchIcon} alt={'search'} className={'absolute'} />
                  <input
                    className={'pl-[2rem] border-[2px] border-[#394142] w-full rounded-[8px]'}
                    style={{ color: 'black' }}
                    placeholder={'Search'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={handleSearchClick}
                  />
                </div>
              </label>
            </div>
          ) : null}
          <div className={'flex flex-col gap-[8px] pt-[16px] px-[8px] pb-[8px]'}>
            {!!filteredItems?.length ? (
              filteredItems.map((item) => (
                <div
                  key={item.value}
                  className={`flex gap-[8px] p-[8px] cursor-pointer rounded-[8px] ${(selection as { value: string | number }).value === item.value ? 'border border-[#86F49C]' : ''}`}
                  onClick={(e: React.MouseEvent) => handleSelect(item, e)}
                >
                  {item.icon && <img src={item.icon} alt={item.label} width={16} height={16} />}
                  <span className={'text-[14px] font-[Inter] uppercase text-white'}>{item.label}</span>
                </div>
              ))
            ) : (
              <div>{searchTerm ? 'No match' : 'Not Available'}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
