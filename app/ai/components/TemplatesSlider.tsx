import { ChevronRight, LockKeyholeOpen, ChevronLeft } from 'lucide-react';
import { useRef, useState } from 'react';

const TemplatesSlider = () => {
  const slideRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);
  const templates = [
    { id: 1, image: '/image-2.png', title: 'Fix Webs', subtitle: 'website Templates' },
    { id: 2, image: '/image-3.png', title: 'Online Learning App', subtitle: 'Mobile App' },
    { id: 3, image: '/image-2.png', title: 'Fix Webs', subtitle: 'website Templates' },
    { id: 4, image: '/image-2.png', title: 'Fix Webs', subtitle: 'website Templates' },
    { id: 5, image: '/image-2.png', title: 'Fix Webs', subtitle: 'website Templates' },
    { id: 6, image: '/image-2.png', title: 'Fix Webs', subtitle: 'website Templates' },
  ];
  const slideLeft = () => {
    if (slideRef.current) {
      // Get the first child element (assuming all slides have the same width)
      const slideWidth = slideRef.current.children[0]?.offsetWidth || 0;

      slideRef.current.scrollBy({
        left: -slideWidth, // Move left by one slide width
        behavior: 'smooth',
      });
    }
  };

  const slideRight = () => {
    if (slideRef.current) {
      // Get the first child element (assuming all slides have the same width)
      const slideWidth = slideRef.current.children[0]?.offsetWidth || 0;

      slideRef.current.scrollBy({
        left: slideWidth, // Move right by one slide width
        behavior: 'smooth',
      });
    }
  };
  return (
    <div className=" relative z-50 flex items-center gap-12 mt-10 flex-col  mx-auto text-[#fff] ovrflow-hiden">
      <h2 className="uppercase text-center text-[16px] md:text-[24px] font-[500] not-italic leading-[54px] font-[Rexton Regular]">
        made with passion by biela
      </h2>
      {/* Slider Here */}
      <div
        onMouseEnter={() => setShowArrows(true)}
        onMouseLeave={() => setShowArrows(false)}
        className="relative w-full max-w-[90vw] md:max-w-[95vw] lg:max-w-[1140px] h-[450px]  overflow-hidden"
      >
        <div
          ref={slideRef}
          className="relative flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[29px]  overflow-x-scroll overflow-y-hidden scroll-smooth no-scrollbar"
        >
          {templates.map((temp, index) => (
            <>
              <div
                key={temp.id}
                className={`relative flex flex-col items-start justify-center gap-6  min-w-[290px] md:min-w-[320px] lg:min-w-[394px] h-[394px] roundeed-lg group `}
              >
                {/* Image Holder Start Here */}
                <div className="flex items-center justify-center rounded-lg bg-[#171717]  aspect-[209/157]">
                  <img src={temp.image} alt="template-one" className="h-full w-full object-cover rounded-lg" />
                </div>
                <div className="flex items-start flex-col gap-2">
                  <h3 className="text-[18px] leading-8 not-italic font-medium font-[Inter] ">{temp.title}</h3>
                  <p className="text-[14px] font-[300] not-italic font-[Inter] leading-normal">{temp.subtitle}</p>
                </div>

                {/* Hover and overlay here */}
                <div className="absolute inset-0 bg-black bg-opacity-70  opacity-0 group-hover:opacity-100 rounded-md transition-all duration-300 flex items-center justify-center">
                  <div className="flex items-center justify-center gap-3 absolute bottom-[-100px] cursor-pointer text-white transition-all duration-400 group-hover:bottom-28 w-full px-2">
                    <div className="relative backdrop-blur-[25px] flex items-center justify-between py-3 px-4 gap-4 rounded-md w-full">
                      <div className="absolute inset-0 z-[-10] rounded-md p-[1px] bg-gradient-to-r from-[#86F49C] to-[rgba(31, 31, 31, 0.80)] before:content-[''] before:absolute before:inset-[1px] before:bg-[#1f1f1f] before:rounded-md" />
                      <p className="text-center text-sm font-normal">Unlock Code in Biela</p>
                      <LockKeyholeOpen className="size-[18px]" />
                    </div>
                  </div>
                </div>
              </div>
              {/* The First Template */}
            </>
          ))}
        </div>
        {/* Show Arrows */}
        {showArrows && (
          <>
            <button
              // onClick={slideLeft}
              onClick={slideLeft}
              className="absolute top-40 -translate-y-1/2 left-0 md:left-0 z-50 flex items-center justify-center size-12 rounded-full bg-black hover:bg-black/70 text-gray-50  z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              // onClick={slideRight}
              onClick={slideRight}
              className="absolute top-40 -translate-y-1/2 right-0 md:right-0 flex items-center justify-center size-12 rounded-full bg-black hover:bg-black/70 text-gray-50  z-10"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
      <div
        className="flex py-3 px-6 w-[200px] justify-center items-center gap-4 rounded-full border border-[rgba(255,255,255,0.19)] 
                bg-[linear-gradient(0deg,rgba(0,0,0,0.05)_0%,rgba(31,31,31,0.80)_100%)] 
                backdrop-blur-[25px]"
      >
        <p>view All</p>
        <ChevronRight className="w-[18px] h-[18px] aspect-[1/1] text-white" />
      </div>
    </div>
  );
};

export default TemplatesSlider;
