import '~/ai/styles/LoadingAnimation.css';
import SettingUpProject from '~/assets/icons/loading-animation/setting-up-project.svg';
import UploadinImages from '~/assets/icons/loading-animation/uploading-images.svg';
import CreatingUser from '~/assets/icons/loading-animation/creating-user.svg';
import Github from '~/assets/icons/loading-animation/github.svg';
import AiChat from '~/assets/icons/loading-animation/ai-chat.svg';
import Deploy from '~/assets/icons/loading-animation/deploy.svg';
import { useState, useEffect } from 'react';

export default function LoadingAnimation() {
  const messages = [
    { img: SettingUpProject, text: 'Setting up the project' },
    { img: CreatingUser, text: 'Creating the user' },
    { img: UploadinImages, text: 'Uploading the images' },
    { img: Github, text: 'Connect at the source via GitHub' },
    { img: AiChat, text: 'Chat with Ai in the side bar' },
    { img: Deploy, text: 'Deploy when you are ready' },
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prevIndex) => (prevIndex + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center justify-center relative w-[140px] h-[140px]">
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="70" r="54" fill="url(#paint0_linear_28199_909)" fill-opacity="0.8" />
          <path
            id="piller1"
            d="M45 82.297C45 82.1561 45.143 82.059 45.2744 82.1101C45.95 82.3731 47.7308 83.0156 49 83.0156C50.2692 83.0156 52.05 82.3731 52.7256 82.1101C52.857 82.059 53 82.1561 53 82.297V94.803C53 94.9118 52.9118 95 52.803 95H45.197C45.0882 95 45 94.9118 45 94.803V82.297Z"
            fill="#28FF7A"
          />
          <path
            id="piller2"
            d="M59 69.297C59 69.1561 59.143 69.059 59.2744 69.1101C59.95 69.3731 61.7308 70.0156 63 70.0156C64.2692 70.0156 66.05 69.3731 66.7256 69.1101C66.857 69.059 67 69.1561 67 69.297V94.803C67 94.9118 66.9118 95 66.803 95H59.197C59.0882 95 59 94.9118 59 94.803V69.297Z"
            fill="#28FF7A"
          />
          <path
            id="piller3"
            d="M73 57.2941C73 57.1539 73.1415 57.0569 73.2726 57.1066C73.9468 57.3624 75.7297 57.9896 77 57.9896C78.2703 57.9896 80.0532 57.3624 80.7274 57.1066C80.8585 57.0569 81 57.1539 81 57.2941V94.803C81 94.9118 80.9118 95 80.803 95H73.197C73.0882 95 73 94.9118 73 94.803V57.2941Z"
            fill="#28FF7A"
          />
          <path
            id="piller4"
            d="M87 44.2948C87 44.1544 87.1419 44.0574 87.2731 44.1075C87.9476 44.365 89.73 44.9961 91 44.9961C92.27 44.9961 94.0524 44.365 94.7269 44.1075C94.8581 44.0574 95 44.1544 95 44.2948V94.803C95 94.9118 94.9118 95 94.803 95H87.197C87.0882 95 87 94.9118 87 94.803V44.2948Z"
            fill="#28FF7A"
          />
          <circle id="ball" cx="49" cy="79" r="4" fill="#28FF7A" />
          <g id="spinningCircleGroup">
            <circle
              id="spinningCircle"
              cx="70"
              cy="70"
              r="68.25"
              stroke="url(#paint1_linear_28199_909)"
              stroke-width="2.5"
            />
            <circle cx="70" cy="70" r="68.25" stroke="white" stroke-opacity="0.05" stroke-width="2.5" />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_28199_909"
              x1="64.8571"
              y1="124"
              x2="64.8571"
              y2="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-opacity="0.06" />
              <stop offset="1" stop-color="#1F1F1F" />
            </linearGradient>
            <linearGradient id="paint1_linear_28199_909" x1="70" y1="3" x2="70" y2="49" gradientUnits="userSpaceOnUse">
              <stop stop-color="#86F49C" />
              <stop offset="1" stop-opacity="0.08" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col items-center gap-4 overflow-hidden h-[20px]">
        <div className="flex items-center justify-center gap-2">
          <img src={messages[currentMessage].img} alt="" />
          <p>{messages[currentMessage].text}</p>
        </div>
      </div>
    </div>
  );
}
