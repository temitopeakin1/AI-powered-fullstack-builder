import React from 'react';

const FiSrCheck = ({ width = '16', height = '17', color = 'white' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_27397_4612)">
        <path
          d="M0.205671 10.4605L3.25834 13.5132C4.11676 14.3713 5.50826 14.3713 6.36669 13.5132L15.7943 4.08555C16.0755 3.79446 16.0674 3.33059 15.7763 3.04945C15.4923 2.77518 15.0421 2.77518 14.7582 3.04945L5.33058 12.4771C5.04443 12.7631 4.5806 12.7631 4.29448 12.4771L1.24181 9.42442C0.950711 9.14328 0.486843 9.15135 0.205705 9.44245C-0.0685627 9.7264 -0.0685627 10.1766 0.205671 10.4605Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_27397_4612">
          <rect width="16" height="16" fill="white" transform="translate(0 0.5)" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default FiSrCheck;
