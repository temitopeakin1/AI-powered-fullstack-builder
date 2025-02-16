import { useEffect, useRef, useState } from 'react';
import CodingIcon from '../../../assets/icons/coding.png';
import GitHubIcon from '../../../assets/icons/github.svg';
import KebabIcon from '../../../assets/icons/kebab.svg';
import ArrowIcon from '../../../assets/icons/arrow.svg';
import DownloadIcon from '../../../assets/icons/download.svg';
import TrashIcon from '../../../assets/icons/trash.svg';
import { ProjectItemProps } from '~/backOffice/types/project';

export default function ProjectItem({ category, title, createdAt, tools }: ProjectItemProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const kebabMenuRef = useRef<HTMLButtonElement>(null);
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        kebabMenuRef.current &&
        !kebabMenuRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mb-4 md:mb-8 mt-4 md:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
      <div className="flex flex-col space-y-2">
        <div className="w-fit inline-block px-4 py-2 font-inter text-xs bg-[#181818] rounded-full font-light text-[#FFFFFF] mb-.8 md:mb-1.5">
          {category}
        </div>
        <span className="font-light text-sm font-inter">{title}</span>
        <span className="text-xs text-[#777777]">{new Date(createdAt).toLocaleDateString()}</span>
      </div>

      <div className="hidden lg:flex flex-col items-start ml-16 md:ml-36 mt-4 md:mt-8  ">
        <div className="flex flex-wrap gap-1 items-start">
          {tools.map((tool, index) => (
            <span key={index} className="text-sm text-[#FFFFFF] px-1 py-2">
              {tool}
              {index < tools.length - 1 && ','}
            </span>
          ))}
        </div>
        <h3 className="text-xs text-[#777777] ml-1">Tools</h3>
      </div>

      <div className="flex justify-end items-center ml-2 pt-2 mt-6 gap-4">
        <div className="relative group lg:hidden">
          <div className="text-white hover:text-gray-400" rel="noopener noreferrer">
            <img src={CodingIcon} alt="GitHub" className="invert" style={{ width: '20px' }} />
          </div>
          <div className=" absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-4 w-32 text-center z-10">
            <div className="flex justify-center flex-wrap gap-1">
              {tools.map((tool, index) => (
                <span key={index} className="text-sm">
                  {tool}
                  {index < tools.length - 1 && ','}
                </span>
              ))}
            </div>
            <h3 className="text-xs text-gray-400 mt-1">Tools</h3>
          </div>
        </div>

        <a href="#" className="text-white hover:text-gray-400" target="_blank" rel="noopener noreferrer">
          <img src={GitHubIcon} alt="github" />
        </a>

        <div className="relative inline-block">
          <button
            onClick={toggleDropdown}
            ref={kebabMenuRef}
            className="inline-flex justify-center  mt-1 bg-transparent "
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <img src={KebabIcon} alt="Menu" />
          </button>

          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="w-[215px] h-[131px] absolute left-8 -mt-6 bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.048)_0%,_rgba(31,_31,_31,_0.8)_100%)] border border-[#2E2E2E] border-image-slice-1 backdrop-[blur(50px)] rounded-md flex items-center justify-center cursor-pointer"
            >
              <div className="px-2 py-2">
                <button className="text-[#D5D5D5] bg-transparent text-sm flex items-center w-full px-2 py-2 text-sm">
                  <img src={ArrowIcon} alt="arrow" className="mr-4" />
                  Open Project
                </button>
                <button className="text-[#D5D5D5] bg-transparent text-sm flex items-center w-full px-2 py-2 text-sm">
                  <img src={DownloadIcon} alt="download" className="mr-4" />
                  Download Project
                </button>
                <button className="text-[#D5D5D5] bg-transparent text-sm flex items-center w-full px-2 py-2 text-sm">
                  <img src={TrashIcon} alt="trash-icon" className="mr-4" />
                  Delete Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-3 mt-2 md:mt-4 border-t border-[#333333]"></div>
    </div>
  );
}
