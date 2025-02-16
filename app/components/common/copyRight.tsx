import { Copyright } from 'lucide-react';
import React from 'react';

interface CopyRightingProps {
  vertical?: boolean;
}

const CopyRighting: React.FC<CopyRightingProps> = ({ vertical = false }) => {
  return (
    <div
      style={{ zIndex: '1' }}
      className={`flex items-center justify-center text-[12px] max-sm:px-[20px] ${vertical ? '' : 'mt-[34px]'} mb-[16px]`}
    >
      <div className={`pb-[15px] flex gap-0 text-[white] copyright-teachme ${vertical ? 'flex-row' : 'flex-col'}`}>
        <div className="flex items-start justify-center">
          <div className="mr-[1px]"></div>
          <p
            className="text-center"
            style={{
              display: 'flex',
              textWrap: 'nowrap',
              gap: '2px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Copyright size={14} className="p-0" />
            2025{' '}
            <span className="border border-b-[#86F49C] text-[#86F49C] border-t-none border-r-none border-l-none">
              <a href="https://biela.dev/" target="_blank">
                {' '}
                Biela.dev.{' '}
              </a>
            </span>{' '}
            Powered by
            <span style={{ display: 'flex', textWrap: 'nowrap' }}>
              <span
                style={{ display: 'flex', textWrap: 'nowrap' }}
                className="border border-b-[#86F49C] text-[#86F49C] border-t-none border-r-none border-l-none"
              >
                <a href="https://teachmecode.ae/" target="_blank">
                  {' '}
                  TeachMeCode Institute (TMC).
                </a>
              </span>
              <svg fill="none" height="12" viewBox="0 0 24 25" width="12" xmlns="http://www.w3.org/2000/svg">
                <path
                  clip-rule="evenodd"
                  d="m12 3.0271c-5.10863 0-9.25 4.14137-9.25 9.25 0 5.1086 4.14137 9.25 9.25 9.25 5.1086 0 9.25-4.1414 9.25-9.25 0-5.10863-4.1414-9.25-9.25-9.25zm-10.75 9.25c0-5.93706 4.81294-10.75 10.75-10.75 5.9371 0 10.75 4.81294 10.75 10.75 0 5.9371-4.8129 10.75-10.75 10.75-5.93706 0-10.75-4.8129-10.75-10.75zm12.8429-2.80846c.0087.00693.0172.01373.0255.0204.0135.01079.0266.02205.0393.03375l1.3423 1.23511 1.3423-1.23511c.0127-.0117.0258-.02296.0393-.03375.0083-.00667.0168-.01348.0255-.02041.1171-.09386.262-.21.3955-.28818.1349-.07901.4973-.2636.9089-.06578.4116.19783.4939.59617.5165.75086.0223.15307.0221.33877.022.48887v.0326 5.3901c0 .4142-.3358.75-.75.75s-.75-.3358-.75-.75v-4.5911l-1.2422 1.143c-.287.2641-.7286.2641-1.0156 0l-1.2422-1.143v4.5911c0 .4142-.3358.75-.75.75s-.75-.3358-.75-.75v-5.3901c0-.0106 0-.0215 0-.0326-.0001-.1501-.0003-.3358.022-.48887.0226-.15469.1049-.55303.5165-.75086.4116-.19782.774-.01323.9089.06578.1335.07818.2784.19432.3955.28819zm-8.8429.30846c0-.41421.33579-.75.75-.75h5c.4142 0 .75.33579.75.75 0 .4142-.3358.75-.75.75h-1.75v5.25c0 .4142-.33579.75-.75.75s-.75-.3358-.75-.75v-5.25h-1.75c-.41421 0-.75-.3358-.75-.75z"
                  fill="#86F49C"
                  fill-rule="evenodd"
                />
              </svg>
            </span>{' '}
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CopyRighting;
