import { Link } from '@remix-run/react';
import '../styles/action-card.scss';
import { ActionCardProps } from '~/components/types/componentTypes';

export default function ActionCard({ projectsCount, onCreateProjectClick, onProjectUpload }: ActionCardProps) {
  const cards = [
    {
      title: projectsCount.toString(),
      subtitle: 'Project created',
      iconSrc: '/count.svg',
      iconAlt: 'project',
      bgColor: '#86F49C',
    },
    {
      title: 'Create a new chat',
      subtitle: 'Give a subtitle',
      iconSrc: '/chat.svg',
      iconAlt: 'chat',
      bgColor: '#86F49C',
      link: '/',
    },
    {
      title: 'Upload Project',
      subtitle: 'Give a subtitle',
      iconSrc: 'icons/upload.svg',
      iconAlt: 'upload-project',
      bgColor: '#86F49C',
      onClick: onProjectUpload,
    },
    {
      title: 'New project',
      subtitle: 'Give a subtitle',
      iconSrc: '/plus.svg',
      iconAlt: 'project',
      bgColor: '#86F49C',
      onClick: onCreateProjectClick,
    },
  ];

  return (
    <div className="w-full h-[96px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 md-mt-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="relative h-20 lg:h-24 bg-[linear-gradient(90deg,_rgba(255,255,255,0.1)_0%,_rgba(255,255,255,0.1)_100%)] border border-[#2E2E2E] border-image-slice-1 backdrop-[blur(50px)] rounded-md text-white flex items-center justify-center cursor-pointer hover-effect"
        >
          {card.link ? (
            <Link to={card.link} className="w-full h-full flex items-center justify-center">
              <div className="flex flex-row items-center justify-start gap-[20px] w-full">
                <div className="bg-[#86F49C] rounded-full p-2 ml-[16px]">
                  <img src={card.iconSrc} alt={card.iconAlt} className="w-[18px] h-[17.25px]" />
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-base text-sm lg:text-md font-semibold pb-1">{card.title}</span>
                  <h3 className="text-xs text-[#777777] ">{card.subtitle}</h3>
                </div>
              </div>
            </Link>
          ) : (
            <div
              onClick={() => {
                card.onClick?.();
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <div className="flex flex-row items-center justify-start gap-[20px] w-full">
                <div className="bg-[#86F49C] rounded-full p-2 ml-[16px]">
                  <img src={card.iconSrc} alt={card.iconAlt} className="w-[18px] h-[17.25px]" />
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-base font-semibold pb-1">{card.title}</span>
                  <h3 className="text-xs text-[#777777] ">{card.subtitle}</h3>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
