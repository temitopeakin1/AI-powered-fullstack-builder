import { type ForwardedRef, forwardRef, memo } from 'react';
import { classNames } from '~/utils/classNames';
import { IconButtonProps, IconSize } from '~/components/types/componentTypes';

export const IconButton = memo(
  forwardRef(
    (
      {
        icon,
        size = 'xl',
        className,
        iconClassName,
        disabledClassName,
        disabled = false,
        title,
        onClick,
        children,
      }: IconButtonProps,
      ref: ForwardedRef<HTMLButtonElement>,
    ) => {
      const iconPath = icon ? `/icons/${icon}.svg` : null;

      return (
        <button
          ref={ref}
          className={classNames(
            'flex items-center text-biela-elements-item-contentDefault bg-transparent enabled:hover:text-biela-elements-item-contentActive rounded-md p-1 enabled:hover:bg-biela-elements-item-backgroundActive disabled:cursor-not-allowed',
            {
              [classNames('opacity-30', disabledClassName)]: disabled,
            },
            className,
          )}
          title={title}
          disabled={disabled}
          onClick={(event) => {
            if (disabled) {
              return;
            }

            onClick?.(event);
          }}
        >
          {iconPath && (
            <img
              src={iconPath}
              alt={icon}
              className={classNames(getIconSize(size), iconClassName, {
                'mr-2': !!children,
              })}
              aria-hidden="true"
            />
          )}
          {children && <span className="text-biela-elements-textPrimary">{children}</span>}
        </button>
      );
    },
  ),
);

function getIconSize(size: IconSize) {
  if (size === 'sm') {
    return 'h-5 w-5';
  } else if (size === 'md') {
    return 'h-5 w-5';
  } else if (size === 'lg') {
    return 'h-6 w-6';
  } else if (size === 'xl') {
    return 'h-8 w-8';
  } else {
    return 'h-10 w-10';
  }
}
