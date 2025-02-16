import { useParams } from '@remix-run/react';
import { classNames } from '~/utils/classNames';
import { type ChatHistoryItem } from '~/ai/lib/persistence';
import WithTooltip from '~/ai/components/Tooltip';
import { useEditChatDescription } from '~/ai/lib/hooks';
import { useState } from 'react';
import ChatItemDot from '~/assets/icons/chatItemDot';
import BlurEffect from '~/assets/icons/blurEffect.svg';
import '../../components/styles/menu.scss';
import renameIcon from '~/assets/icons/rename.svg';
import exportIcon from '~/assets/icons/export.svg';
import downloadIcon from '~/assets/icons/download-Icon.svg';
import duplicateIcon from '~/assets/icons/duplicate.svg';
import deleteIcon from '~/assets/icons/delete.svg';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onDuplicate?: (event: React.UIEvent) => void;
  exportChat?: (event: React.UIEvent) => void;
  downloadProject?: (event: React.UIEvent) => void;
}

export function HistoryItem({ item, onDelete, onDuplicate, exportChat, downloadProject }: HistoryItemProps) {
  const { id: urlId } = useParams();
  const isActiveChat = urlId === item.urlId;
  const [showActions, setShowActions] = useState(false);
  const [itemHover, setItemHover] = useState(false);

  const theme = localStorage.getItem('biela_theme');
  const { editing, handleChange, handleBlur, handleSubmit, handleKeyDown, currentDescription, toggleEditMode } =
    useEditChatDescription({
      initialDescription: item.description,
      customChatId: item.id,
      syncWithGlobalStore: isActiveChat,
    });

  const actions = (
    <div className="dark:bg-[black] light:bg-[white] rounded-md">
      <div className="border bg-liner-gradient w-[144px] border-[#2E2E2E] rounded-md flex flex-col gap[16px] items-center justify-center p-[24px] text-biela-elements-textSecondary transition-opacity">
        <ChatActionButton toolTipContent="Export" icon={exportIcon} onClick={exportChat} />
        <ChatActionButton toolTipContent="Download" icon={downloadIcon} onClick={downloadProject} />
        {onDuplicate && <ChatActionButton toolTipContent="Duplicate" icon={duplicateIcon} onClick={onDuplicate} />}
        <ChatActionButton toolTipContent="Rename" icon={renameIcon} onClick={toggleEditMode} />
        <ChatActionButton
          toolTipContent="Delete"
          icon={deleteIcon}
          className="[&&]:hover:text-biela-elements-button-danger-text"
          onClick={onDelete}
        />
      </div>
    </div>
  );

  const renderDescriptionForm = (
    <form onSubmit={handleSubmit} className="flex-1 flex items-center">
      <input
        type="text"
        className="flex-1 bg-biela-elements-background-depth-1 text-biela-elements-textPrimary rounded px-2 mr-2"
        autoFocus
        value={currentDescription}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <button
        type="submit"
        className="i-ph:check scale-110 hover:text-biela-elements-item-contentAccent"
        onMouseDown={handleSubmit}
      />
    </form>
  );

  return (
    <div
      className="relative"
      onMouseLeave={(e) => {
        if (showActions) {
          e.currentTarget.style.backgroundImage = '';
          setShowActions(false);
        }
      }}
    >
      <div className="position-relative">
        <div
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundImage = `url(${BlurEffect}), linear-gradient(to right, rgba(255, 255, 255, 0.111), rgba(255, 255, 255, 0.05)) `;
            e.currentTarget.style.backgroundRepeat = 'no-repeat';
            e.currentTarget.style.backgroundPosition = 'top center';
            e.stopPropagation();
            setShowActions(true);
            setItemHover(true);
          }}
          onMouseLeave={(e) => {
            setItemHover(false);
            e.currentTarget.style.backgroundImage = '';
            setShowActions(false);
          }}
          style={{
            border: showActions ? '1px solid rgb(37, 35, 35)' : '',
            color: showActions && theme == 'dark' ? 'white' : '',
            backgroundImage:
              showActions && theme == 'dark'
                ? `url(${BlurEffect}), linear-gradient(to right, rgba(255, 255, 255, 0.111), rgba(255, 255, 255, 0.05)) no-repeat`
                : 'none',
          }}
          className={classNames(
            `${showActions ? 'light:bg-[#F8F9FF]' : ''}
      history-item group light:hover-border-[#E9E9E9] light:hover:bg-[#F8F9FF]  rounded-md text-biela-elements-textSecondary dark:hover:text-[white] flex justify-between items-center  p-[10px]`,
            '',
            {
              '[&&]:text-biela-elements-textPrimary bg-biela-elements-background-depth-3': isActiveChat,
            },
          )}
        >
          <div
            className={`border-container top-0 zi-1 display-none h-[20px] w-[90%] absolute left-[5%]`}
            onMouseEnter={(e) => {
              e.currentTarget.style.display = 'block';
            }}
            style={{ display: showActions || itemHover ? 'block' : 'none' }}
          >
            <div className="rounded-[10px] h-[1px] border-top-green"></div>
          </div>
          {editing ? (
            renderDescriptionForm
          ) : (
            <a href={`/chat/${item.urlId}`} className="flex w-full relative truncate block">
              <p
                style={{
                  maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                }}
                className="w-[260px] font-light text-left  block mask-[linear-gradient(to_right,_black_80%,_transparent_100%)]"
              >
                {currentDescription}
              </p>
              <div
                className={classNames(
                  'absolute right-0 z-1 top-0 bottom-0  from-biela-elements-background-depth-2 group-hover:from-biela-elements-background-depth-3 box-content pl-3 to-transparent w-10 flex justify-end group-hover:w-22 group-hover:from-99%',
                  { 'from-biela-elements-background-depth-3 w-10 ': isActiveChat },
                )}
              >
                <WithTooltip
                  tooltip={actions}
                  arrowStyle={{ fill: 'transparent' }}
                  tooltipStyle={{ background: 'transparent' }}
                  position="bottom"
                >
                  <div className={`flex items-center ${showActions ? 'visible' : ' invisible '} group-hover:visible`}>
                    <ChatItemDot fill="#86F49C" />
                  </div>
                </WithTooltip>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const ChatActionButton = ({
  toolTipContent,
  icon,
  className,
  onClick,
}: {
  toolTipContent: string;
  icon: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  btnTitle?: string;
}) => {
  return (
    <div
      onClick={onClick}
      className={` flex gap-[16px] w-full cursor-pointer ${
        toolTipContent === 'Delete' ? 'text-biela-elements-button-danger-text flex gap-[16px] w-full' : ''
      }`}
    >
      <img src={icon} alt={icon} />
      <p className={`${toolTipContent === 'Delete' ? 'text-[#FF5656]' : 'text-[#D5D5D5]'}`}>{toolTipContent}</p>
    </div>
  );
};
