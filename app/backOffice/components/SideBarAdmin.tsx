import HomeIcon from '~/assets/icons/home1.svg';
import RocketIcon from '~/assets/icons/rocket_launch.svg';
import UserGearIcon from '~/assets/icons/user_gear.svg';
import CrownIcon from '~/assets/icons/crown.svg';
import MegaphoneIcon from '~/assets/icons/megaphone.svg';
import ShieldIcon from '~/assets/icons/shield.svg';
import GraphCurveIcon from '~/assets/icons/graphcurve.svg';
import BellIcon from '~/assets/icons/bells.svg';
import FileExplorerIcon from '~/assets/icons/fileexplorer.svg';


const SideBar = [ 
    { image: HomeIcon, text: "Home",},
    { image: RocketIcon, text: "Project Management",},
    { image: UserGearIcon, text: "User Management",},
    { image: CrownIcon, text: "Subscription Management",},
    { image: MegaphoneIcon, text: "Affiliate Program",},
    { image: ShieldIcon, text: "Security & Logs",},
    { image: GraphCurveIcon, text: "Performance Monitoring",},
    { image: BellIcon, text: "Notifications System",},
    { image: FileExplorerIcon, text: "Reports & Data Exports" },
    
  ];
  
  export function SideBarAdmin() { 
    return (
      <div className="w-[294px] h-[1172px] flex flex-col items-start p-[24px] border-r border-r-[#2C2C2C]  bg-black">
      <div className="mb-[48px]">
      <img src ="/app/assets/icons/logotest.svg"></img>
      </div>
        {SideBar.map((item, index) => ( 
          <div
            key={index}
            className="text-white flex p-[14px]  inline-flex items-center gap-[10px] self-stretch rounded-[8px]
            text-white text-sm font-light font-['Inter'] hover:bg-gray-900"     
          >
            <img src={item.image} alt={item.text} className="w-[16px] h-[16px]" />
            <h1>{item.text}</h1>
          </div>
        ))}
      </div>
    );
  }
  