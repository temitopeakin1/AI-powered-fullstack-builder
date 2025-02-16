import { useStore } from '@nanostores/react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import WithTooltip from '~/ai/components/Tooltip';
import { useEditChatDescription } from '~/ai/lib/hooks';
import { description as descriptionStore } from '~/ai/lib/persistence/index';

export function ChatDescription() {
  const initialDescription = useStore(descriptionStore)!;

  const { editing, handleChange, handleBlur, handleSubmit, handleKeyDown, currentDescription, toggleEditMode } =
    useEditChatDescription({
      initialDescription,
      syncWithGlobalStore: true,
    });

  if (!initialDescription) {
    // doing this to prevent showing edit button until chat description is set
    return null;
  }

  return (
    <div
      className="flex items-center max-lg:justify-between justify-start"
      style={{ zIndex: '20', position: 'relative', fontWeight: '300', fontSize: '14px' }}
    >
      {editing ? (
        <form onSubmit={handleSubmit} className="flex items-center justify-center max-lg:justify-start max-lg:w-full">
          <input
            type="text"
            className="bg-biela-elements-background-depth-1 max-lg:flex-1 lg:w-[300px] text-biela-elements-textPrimary rounded px-2 mr-2 w-fit  min-w-[100px] max-w-full whitespace-nowrap overflow-ellipsis sm:justify-center"
            autoFocus
            value={currentDescription}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <TooltipProvider>
            <WithTooltip tooltip="Save title">
              <div className="flex justify-between items-center p-2 rounded-md bg-biela-elements-item-backgroundAccent">
                <button
                  type="submit"
                  className="i-ph:check-bold scale-110 hover:text-biela-elements-item-contentAccent"
                  onMouseDown={handleSubmit}
                />
              </div>
            </WithTooltip>
          </TooltipProvider>
        </form>
      ) : (
        <>
          <span className={'current-description'}>{currentDescription}</span>
          <TooltipProvider>
            <WithTooltip tooltip="Rename chat">
              <div className="flex justify-between items-center p-2 rounded-md bg-biela-elements-item-backgroundAccent ml-2">
                <button
                  type="button"
                  className="i-ph:pencil-fill scale-110 hover:text-biela-elements-item-contentAccent"
                  onClick={(event) => {
                    event.preventDefault();
                    toggleEditMode();
                  }}
                />
              </div>
            </WithTooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
