import { useNavigate } from '@remix-run/react';

const ListItem = ({ icon, title }: { icon: string; title: string }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const lowerTitle = title.toLowerCase();

    switch (lowerTitle) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'profile':
        navigate('/settings/profile');
        break;
      case 'billings': 
        navigate('/settings/billing'); 
        break;
      case 'referrals':
        navigate('/referrals');
        break;
      case 'help':
        navigate('/help');
        break;
      case 'log out':
        navigate('/logout');
        break;
      default:
        navigate(`/${lowerTitle}`);
    }
  };

  return (
    <li
      onClick={handleClick}
      className="border border-transparent px-2.5 py-2 cursor-pointer relative rounded-lg
                 hover:border-[rgb(37,35,35)] border-[transparent]  flex user-list-item items-center w-[206px] text-black dark:text-white"
    >
      <div className="border-container-list">
        <div className="light-border"></div>
      </div>
      <div className="flex gap-2">
        <img src={icon} alt={title} />
        <span className="ml-2 text-[14px] font-light">{title}</span>
      </div>
    </li>
  );
};

export default ListItem;
