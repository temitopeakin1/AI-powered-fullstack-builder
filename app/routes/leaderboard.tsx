import { useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/common/Header/Header';
import LeaderTable from '~/components/leaderTable';
import { Switch } from '~/components/switch';
import { classNames } from '~/utils/classNames';

type LeaderTableHeaderProps = {
  title: string;
  options: string[];
};

const LeaderTableHeader = ({ title, options }: LeaderTableHeaderProps) => {
  const [selected, setSelected] = useState(options[0]);

  const handleChange = (option: string) => {
    setSelected(option);
  };

  return (
    <div className="flex justify-between gap-6 items-center">
      <h1 className="text-biela-elements-textPrimary text-lg font-medium">{title}</h1>
      <Switch
        options={options}
        onChange={handleChange}
        selected={selected}
        renderOption={(option) => <p>{option}</p>}
      />
    </div>
  );
};

type LeaderTableRowProps = {
  avatar: string;
  name: string;
  points: number;
  rowNumber: number;
  medal?: string | React.ReactNode;
  isSticky?: boolean;
};

const DATA = [
  {
    name: 'John Doe 2',
    points: 100,
    rank: 1,
    avatar: '/images/user.png',
    medal: '/medals/first.svg',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
    medal: '/medals/second.svg',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
    medal: '/medals/third.svg',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
  {
    name: 'Jane Doe 2',
    points: 90,
    rank: 2,
    avatar: '/images/user.png',
  },
];

const LeaderTableRow = ({ avatar, name, points, rowNumber, medal, isSticky }: LeaderTableRowProps) => {
  return (
    <div
      className={classNames(
        'flex flex-row justify-between gap-12 items-center odd:bg-[#0F0F0F] even:bg-black px-4 py-2',
      )}
    >
      <p className="text-biela-elements-textSecondary">{rowNumber}.</p>
      <div className="flex flex-row items-center gap-4 justify-start flex-1">
        <img src={avatar} alt={`${name}-avatar`} className="w-8 h-8 rounded-full" />
        <p className="text-biela-elements-textSecondary">{name}</p>
        {typeof medal === 'string' ? <img src={medal} alt="medal" className="w-8 h-8" /> : medal}
      </div>
      <p className="text-[#86F49C]">{points}</p>
    </div>
  );
};

const Leaderboard = () => {
  return (
    <div className="w-full min-h-screen bg-black">
      <ClientOnly>
        {() => (
          <Header
            handleSendMessage={(e, messageInput) => console.log('Message sent:', messageInput)}
            isStreaming={false}
            handleStop={() => console.log('Stream stopped')}
            isSettingsPage={true}
          />
        )}
      </ClientOnly>

      <div className="p-5 md:p-10 xl:w-[1169px] 2xl:w-[1489px]  mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeaderTable
            title="Leaderboard"
            data={[
              {
                name: 'John Doe 2',
                points: 100,
                rank: 1,
                avatar: '/images/user.png',
                medal: '/medals/first.svg',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
                medal: '/medals/second.svg',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
                medal: '/medals/third.svg',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
              {
                name: 'Jane Doe 2',
                points: 90,
                rank: 2,
                avatar: '/images/user.png',
              },
            ]}
            renderRow={(item) => (
              <LeaderTableRow
                avatar={item.data.avatar}
                name={item.data.name}
                points={item.data.points}
                rowNumber={item.index + 1}
                medal={item.data.medal}
              />
            )}
            renderHeader={() => <LeaderTableHeader title="Leaderboard" options={['Points', 'Rank']} />}
          />
          <LeaderTable
            title="Leaderboard"
            data={DATA}
            renderRow={(item) => (
              <LeaderTableRow
                avatar={item.data.avatar}
                name={item.data.name}
                points={item.data.points}
                rowNumber={item.index + 1}
                medal={item.data.medal}
              />
            )}
            renderHeader={() => <LeaderTableHeader title="Leaderboard" options={['Points', 'Rank']} />}
          />
          <LeaderTable
            title="Leaderboard"
            data={DATA}
            renderRow={(item) => (
              <LeaderTableRow
                avatar={item.data.avatar}
                name={item.data.name}
                points={item.data.points}
                rowNumber={item.index + 1}
                medal={item.data.medal}
              />
            )}
            renderHeader={() => <LeaderTableHeader title="Leaderboard" options={['Points', 'Rank']} />}
          />
          <LeaderTable
            title="Leaderboard"
            data={DATA}
            renderRow={(item) => (
              <LeaderTableRow
                avatar={item.data.avatar}
                name={item.data.name}
                points={item.data.points}
                rowNumber={item.index + 1}
                medal={item.data.medal}
              />
            )}
            renderHeader={() => <LeaderTableHeader title="Leaderboard" options={['Points', 'Rank']} />}
          />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
