import React from 'react';
import ErrorUi from '~/components/common/ErrorUi';

const AccessDeinedPage: React.FC = () => {
  return (
    <ErrorUi
      title="Access Denied"
      description="You don’t have permission to access this page."
      buttonText="Go back"
      buttonLink="/"
      children={<p className="Rexton-Font text-[#83F2A1] font-[500] text-[100px]">403</p>}
    />
  );
};

export default AccessDeinedPage;
