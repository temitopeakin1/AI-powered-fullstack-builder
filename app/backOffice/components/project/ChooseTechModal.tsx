import CloseButton from '~/components/common/closeButton';
import Arrow from '~/assets/icons/curvedArrow.svg';
import React, { useState, useEffect, useRef } from 'react';

import AngularIcon from '~/assets/icons/tech/angular.svg';
import FirebaseIcon from '~/assets/icons/tech/firebase.svg';
import MongoDBIcon from '~/assets/icons/tech/mongodb.svg';
import ReactIcon from '~/assets/icons/tech/react.svg';
import SvelteIcon from '~/assets/icons/tech/svelte.svg';
import VueIcon from '~/assets/icons/tech/vuejs.svg';
import RedisIcon from '~/assets/icons/tech/redis.svg';
import SqlIcon from '~/assets/icons/tech/sqlite.svg';

const techList = [
  {
    id: 1,
    name: 'React',
    img: ReactIcon,
    description:
      'A JavaScript library for building user interfaces. modern and simple way to create interactive web pages that automatically respond to user actions',
  },
  { id: 2, name: 'Vue', img: VueIcon, description: 'The Progressive JavaScript Framework.' },
  { id: 3, name: 'Angular', img: AngularIcon, description: 'One framework. Mobile & desktop.' },
  { id: 4, name: 'Svelte', img: SvelteIcon, description: 'Cybernetically enhanced web apps.' },
  {
    id: 5,
    name: 'MongoDb',
    img: MongoDBIcon,
    description: "A document-oriented NoSQL database used for high volume data storage and retrieval's.",
  },
  {
    id: 6,
    name: 'Firebase',
    img: FirebaseIcon,
    description: 'A platform developed by Google for creating mobile and web applications.',
  },
  { id: 7, name: 'Redis', img: RedisIcon, description: '' },
  {
    id: 8,
    name: 'SQLite',
    img: SqlIcon,
    description: 'A software library that provides a relational database management system.',
  },
];

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div className="relative overflow-hidden p-3 rounded-[8px] border border-[rgba(255,255,255,0.19)] bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.05)_0%,_rgba(31,_31,_31,_0.80)_100%)] backdrop-[blur(25px)] mb-8">
    <div className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 mt-2 w-[220px] h-[8px] bg-[linear-gradient(180deg,#28FF7A_50.04%,#030404_140.18%)] filter blur-[10px] rounded-full" />
    {children}
  </div>
);

const TechButton = ({
  tech,
  onClick,
}: {
  tech: { id: number; name: string; img: string; description: string };
  onClick: () => void;
}) => (
  <div
    className="w-[80px] h-[80px] rounded-[8.127px] border border-[rgba(0,0,0,0.06)] bg-[linear-gradient(0deg,_rgba(0,0,0,0.05)_0%,_rgba(31,31,31,_0.80)_100%)] shadow-[inset_0px_-2px_4px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center cursor-pointer"
    onClick={onClick}
  >
    <img src={tech.img} alt={tech.name} className="w-8 h-8 mb-1" />
    <p className="text-white text-xs">{tech.name}</p>
  </div>
);

const TechSection = ({
  title,
  techs,
  onButtonClick,
}: {
  title: string;
  techs: { id: number; name: string; img: string; description: string }[];
  onButtonClick: (tech: { id: number; name: string; img: string; description: string }) => void;
}) => (
  <div className="flex flex-col items-center">
    <p className="text-[#d5d5d5] text-center text-xs font-normal">{title}</p>
    <div className="relative overflow-hidden py-4 px-3 rounded-[8px] border border-[rgba(255,255,255,0.19)] bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.05)_0%,_rgba(31,_31,_31,_0.80)_100%)] backdrop-[blur(25px)] mt-3">
      <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 mt-2 w-[100px] h-[8px] bg-[linear-gradient(180deg,#28FF7A_50.04%,#030404_140.18%)] filter blur-[10px] rounded-full" />
      <div className="grid grid-cols-2 gap-2">
        {techs.map((tech) => (
          <TechButton key={tech.id} tech={tech} onClick={() => onButtonClick(tech)} />
        ))}
      </div>
    </div>
  </div>
);

export default function ChooseTechModal({ closeModal }: { closeModal: () => void }) {
  const [selectedTech, setSelectedTech] = useState<{
    id: number;
    name: string;
    img: string;
    description: string;
  } | null>(null);
  const infoBoxRef = useRef<HTMLDivElement>(null);

  const handleButtonClick = (tech: { id: number; name: string; img: string; description: string }) => {
    setSelectedTech(tech);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (infoBoxRef.current && !infoBoxRef.current.contains(event.target as Node)) {
      setSelectedTech(null);
    }
  };

  useEffect(() => {
    if (selectedTech) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedTech]);

  return (
    <div className="fixed w-[840px] inset-0 flex items-center justify-center z-50" style={{ left: '-193px' }}>
      <div className="w-[840px] bg-black bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.048)_0%,_rgba(31,_31,_31,_0.8)_100%)] border border-[#2E2E2E] border-image-slice-1 backdrop-[blur(50px)] rounded-[8px] py-3 md:py-6 px-4 relative flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <span className="font-inter text-lg text-white font-medium leading-relaxed">Choose the right technology</span>
          <CloseButton closeModal={closeModal} />
        </div>
        <InfoBox>
          <img className="mb-4" />
          <p className="text-[#777] text-base font-normal">
            Node.js is a tool that helps developers build the backend (the behind-the-scenes part) of websites and apps
            using JavaScript. It&rsquo;s fast, efficient, and great for handling many users at once, making it perfect
            for chat apps, online stores, and real-time services.
          </p>
        </InfoBox>
        <div className="flex justify-center items-center mb-13">
          <img src={Arrow} className="w-[187px]" style={{ transform: 'translateY(50%)' }} />
          <div className="relative overflow-hidden py-4 px-3 max-w-[243px] rounded-[8px] border border-[rgba(255,255,255,0.19)] bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.05)_0%,_rgba(31,_31,_31,_0.80)_100%)] backdrop-[blur(25px)] flex flex-col items-center">
            <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 mt-2 w-[100px] h-[8px] bg-[linear-gradient(180deg,#28FF7A_50.04%,#030404_140.18%)] filter blur-[10px] rounded-full" />
            <img className="mb-4" />
            <p className="text-[#d5d5d5] text-center text-sm font-normal">
              A system that lets you create the invisible part of your website, processing data and responding to user
              requests
            </p>
          </div>
          <img src={Arrow} className="w-[187px]" style={{ transform: 'scaleX(-1) translateY(50%)' }} />
        </div>
        <div className="flex justify-between items-center">
          <TechSection title="Works for frontend with" techs={techList.slice(0, 4)} onButtonClick={handleButtonClick} />
          {selectedTech && (
            <div
              ref={infoBoxRef}
              className="relative overflow-hidden w-[100%] max-w-[369px] h-max py-4 px-3 rounded-[8px] border border-[rgba(255,255,255,0.19)] bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.05)_0%,_rgba(31,_31,_31,_0.80)_100%)] backdrop-[blur(25px)] mx-6"
            >
              <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 mt-2 w-[100px] h-[8px] bg-[linear-gradient(180deg,#28FF7A_50.04%,#030404_140.18%)] filter blur-[10px] rounded-full" />
              <div className="flex items-center mb-2">
                <img src={selectedTech.img} alt={selectedTech.name} className="w-8 h-8 mr-2" />
                <p className="text-white text-lg font-medium">{selectedTech.name}</p>
              </div>
              <p className="text-[#777] text-sm font-normal">{selectedTech.description}</p>
            </div>
          )}
          <TechSection title="Works for database with" techs={techList.slice(4, 8)} onButtonClick={handleButtonClick} />
        </div>
      </div>
    </div>
  );
}
