import { motion, type Variants } from 'framer-motion';
import React, { FC, UIEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { type ChatHistoryItem, chatId, db, deleteById, getAll, useChatHistory } from '~/ai/lib/persistence';
import { cubicEasingFn } from '~/utils/easings';
import { logger } from '~/utils/logger';
import { HistoryItem } from './HistoryItem';
import { binDates } from '~/utils/date-binning';
import { useSearchFilter } from '~/ai/lib/hooks/useSearchFilter';
import '../../components/styles/menu.scss';
import AnimationGif from '../../assets/icons/logo-animation.gif';
import ConfirmationDialog, {
  DialogConfirmationType,
  emptyConfirmationDialogHandler,
} from '~/ai/components/ConfirmationDialog';
import { ImportButtons } from './ImportButtons';

const menuVariants: Variants = {
  closed: {
    opacity: 0,
    visibility: 'hidden',
    left: '-150px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: 'visible',
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
};

type DialogContent = { type: DialogConfirmationType; item: ChatHistoryItem } | null;

const dateGradientStyle = {
  background: 'linear-gradient(90deg, #A598FE 0%, #63D9D7 8.65%, #84F2A0 16.48%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 500,
};

const darkDateStyle = {
  color: 'black',
  fontWeight: 500,
};

interface MenuProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  isStreaming: boolean;
}

export const Menu: FC<MenuProps> = ({ open, setOpen, isStreaming }) => {
  const { duplicateCurrentChat, importChat, exportChat, downloadProject } = useChatHistory();
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const theme = localStorage.getItem('biela_theme');
  const { filteredItems: filteredList, handleSearchChange } = useSearchFilter({
    items: list,
    searchFields: ['description'],
  });

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);
  const deleteItem = useCallback((event: UIEvent, item: ChatHistoryItem) => {
    event.preventDefault();

    if (db) {
      deleteById(db, item.id)
        .then(() => {
          loadEntries();

          if (chatId.get() === item.id) {
            // hard page navigation to clear the stores
            window.location.pathname = '/';
          }
        })
        .catch((error) => {
          toast.error('Failed to delete conversation');
          logger.error(error);
        });
    }
  }, []);
  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open, loadEntries]);

  const handleActionClick = (event: UIEvent, item: ChatHistoryItem, actionType: NonNullable<DialogContent>['type']) => {
    event.preventDefault();
    setDialogContent({ type: actionType, item });
  };

  const handleDuplicate = async (id: string) => {
    await duplicateCurrentChat(id);
    loadEntries();
  };

  const closeDialog = () => {
    setDialogContent(null);
  };

  return (
    <motion.div
      initial="closed"
      animate={open ? 'open' : 'closed'}
      variants={menuVariants}
      style={{ backgroundColor: '#000' }}
      className="flex flex-col fixed top-0 w-[350px] h-full light:bg-white border-r border-[#2E2E2E] z-50 shadow-xl"
      onMouseEnter={() => setOpen(true)} // Keep menu open on hover
      onMouseLeave={() => setOpen(false)} // Close menu when the mouse leaves
    >
      <div>
        <a href="/">
          <div className="left-menu-open cursor-pointer">
            {isStreaming ? (
              <div className="w-[190px]">
                <img className="w-[100%]" src={AnimationGif} alt="Logo" />
              </div>
            ) : (
              <>
                <img src="/icons/logo-biela.svg" alt="Logo" />
                <img src="/icons/text-logo.svg" alt="Text Logo" />
              </>
            )}
          </div>
        </a>
        <div className="flex-1 flex flex-col h-full w-full">
          <div className="p-4 select-none">
            <a
              href="/"
              className="glass-button flex font-light gap-2 items-center justify-center bg-[#86F49C] text-black hover:opacity-90 rounded-full p-2 transition-opacity mb-4"
            >
              <img src="/chat.svg" alt="AI" />
              <span>New Chat</span>
            </a>
            {ImportButtons(importChat)}
            <div className="relative w-full">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                  <g clipPath="url(#clip0_24197_3068)">
                    <path
                      d="M15.8045 15.3619L11.8252 11.3825C12.9096 10.0563 13.4428 8.36392 13.3144 6.65556C13.1861 4.94721 12.406 3.35354 11.1356 2.2042C9.86516 1.05486 8.20158 0.437783 6.48895 0.480604C4.77632 0.523425 3.14566 1.22287 1.93426 2.43426C0.72287 3.64566 0.0234252 5.27632 -0.019396 6.98895C-0.0622172 8.70158 0.554862 10.3652 1.7042 11.6356C2.85354 12.906 4.44721 13.6861 6.15556 13.8144C7.86392 13.9428 9.55625 13.4096 10.8825 12.3252L14.8619 16.3045C14.9876 16.426 15.156 16.4932 15.3308 16.4916C15.5056 16.4901 15.6728 16.42 15.7964 16.2964C15.92 16.1728 15.9901 16.0056 15.9916 15.8308C15.9932 15.656 15.926 15.4876 15.8045 15.3619ZM6.66652 12.4999C5.61169 12.4999 4.58054 12.1871 3.70348 11.601C2.82642 11.015 2.14283 10.182 1.73916 9.2075C1.3355 8.23296 1.22988 7.1606 1.43567 6.12604C1.64145 5.09147 2.14941 4.14117 2.89529 3.39529C3.64117 2.64941 4.59147 2.14145 5.62604 1.93567C6.6606 1.72988 7.73296 1.8355 8.7075 2.23916C9.68204 2.64283 10.515 3.32642 11.101 4.20348C11.6871 5.08054 11.9999 6.11169 11.9999 7.16652C11.9983 8.58052 11.4359 9.93615 10.436 10.936C9.43615 11.9359 8.08052 12.4983 6.66652 12.4999Z"
                      fill="#86F49C"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_24197_3068">
                      <rect width="16" height="16" fill="white" transform="translate(0 0.5)" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search"
                onChange={handleSearchChange}
                className="w-full font-light pl-10 pr-3 py-[12px] search-input-bg  border border-[#2E2E2E] rounded-full outline-none placeholder:text-[#D5D5D5] text-[#D5D5D5]"
              />
            </div>
          </div>
          <div className="overflow-auto pl-4 pr-5">
            {filteredList.length === 0 && (
              <div className="pl-2 ">{list.length === 0 ? 'No previous conversations' : 'No matches found'}</div>
            )}
            <div className="overflow-y-scroll h-[70vh]">
              {binDates(filteredList).map(({ category, items }) => (
                <div key={category} className="mt-4 first:mt-0 space-y-1">
                  <div className="history-item-lable sticky top-0 z-1  pl-2 pt-2 pb-1">
                    <div className="flex items-center gap-2">
                      <span style={theme == 'dark' ? dateGradientStyle : darkDateStyle}>{category}</span>
                      {/* <span className="">({items.length})</span> */}
                    </div>
                  </div>
                  {items.map((item) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      exportChat={(event) => handleActionClick(event, item, DialogConfirmationType.EXPORT)}
                      downloadProject={(event) => handleActionClick(event, item, DialogConfirmationType.DOWNLOAD)}
                      onDelete={(event) => handleActionClick(event, item, DialogConfirmationType.DELETE)}
                      onDuplicate={(event) => handleActionClick(event, item, DialogConfirmationType.DUPLICATE)}
                    />
                  ))}
                </div>
              ))}
            </div>
            <ConfirmationDialog
              isOpen={dialogContent !== null}
              type={dialogContent?.type ?? DialogConfirmationType.DELETE}
              description={dialogContent?.item.description ?? ''}
              onConfirm={(event) => {
                if (dialogContent) {
                  const handler = {
                    ...emptyConfirmationDialogHandler,
                    [DialogConfirmationType.DELETE]: () => deleteItem(event, dialogContent.item),
                    [DialogConfirmationType.DUPLICATE]: () => handleDuplicate(dialogContent.item.id),
                    [DialogConfirmationType.DOWNLOAD]: () => downloadProject(dialogContent.item.id),
                    [DialogConfirmationType.EXPORT]: () => exportChat(dialogContent.item.id),
                  };

                  handler[dialogContent.type]();
                }

                closeDialog();
              }}
              onCancel={closeDialog}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
