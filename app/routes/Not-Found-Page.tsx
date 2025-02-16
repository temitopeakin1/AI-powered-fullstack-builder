import React from 'react';
import ErrorUi from '~/components/common/ErrorUi';

const PageNotFound: React.FC = () => {
  return (
    <ErrorUi
      title="Page Not Found"
      description="Sorry, the page you’re looking for doesn’t exist. It might have been moved, deleted, or never existed in the first place."
      buttonText="Go back"
      buttonLink="/"
      children={<p className="Rexton-Font text-[#83F2A1] font-[500] text-[100px]">404</p>}
    />
  );
};

export default PageNotFound;
