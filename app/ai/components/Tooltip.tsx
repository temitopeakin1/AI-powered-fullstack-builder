import * as Tooltip from '@radix-ui/react-tooltip';
import { type ForwardedRef, forwardRef, type ReactElement } from 'react';

interface TooltipProps {
  tooltip: React.ReactNode;
  children: ReactElement;
  sideOffset?: number;
  className?: string;
  arrowClassName?: string;
  tooltipStyle?: React.CSSProperties;
  arrowStyle?: React.CSSProperties;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
  delay?: number;
}

const WithTooltip = forwardRef(
  (
    {
      tooltip,
      children,
      sideOffset = 5,
      className = '',
      arrowClassName = '',
      tooltipStyle = {},
      arrowStyle = {},
      position = 'top',
      maxWidth = 250,
      delay = 0,
    }: TooltipProps,
    _ref: ForwardedRef<HTMLElement>,
  ) => {
    return (
      <Tooltip.Root delayDuration={delay}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={position}
            className={`
              z-[2000]
              px-2.5
              py-1.5
              max-h-[300px]
              select-none
              rounded-md
              bg-biela-elements-background-depth-3
              text-biela-elements-textPrimary
              text-sm
              leading-tight
              shadow-lg
              animate-in
              fade-in-0
              zoom-in-95
              data-[state=closed]:animate-out
              data-[state=closed]:fade-out-0
              data-[state=closed]:zoom-out-95
              ${className}
            `}
            sideOffset={sideOffset}
            style={{
              maxWidth,
              ...tooltipStyle,
            }}
          >
            <div className="break-words">{tooltip}</div>
            <Tooltip.Arrow
              className={`
                fill-biela-elements-background-depth-3
                ${arrowClassName}
              `}
              style={arrowStyle}
              width={12}
              height={6}
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  },
);

export default WithTooltip;
