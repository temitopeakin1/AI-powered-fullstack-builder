import React from 'react';

const WindowIcon = ({ width = 18, height = 18, fill = '#D5D5D5', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 18 18" fill="none" {...props}>
    <g clipPath="url(#clip0_24197_3149)">
      <path
        d="M14.25 1.5H3.75C1.68225 1.5 0 3.18225 0 5.25V12.75C0 14.8177 1.68225 16.5 3.75 16.5H14.25C16.3177 16.5 18 14.8177 18 12.75V5.25C18 3.18225 16.3177 1.5 14.25 1.5ZM3.75 3H14.25C15.4905 3 16.5 4.0095 16.5 5.25H1.5C1.5 4.0095 2.5095 3 3.75 3ZM1.5 12.75V6.75H5.25V15H3.75C2.5095 15 1.5 13.9905 1.5 12.75ZM14.25 15H6.75V6.75H16.5V12.75C16.5 13.9905 15.4905 15 14.25 15Z"
        fill={fill}
      />
    </g>
    <defs>
      <clipPath id="clip0_24197_3149">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default WindowIcon;
