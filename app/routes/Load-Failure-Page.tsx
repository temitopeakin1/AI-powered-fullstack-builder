import React from 'react';
import FailureImage from '~/assets/icons/fail_load.png';
import ErrorUi from '~/components/common/ErrorUi';

const LoadFailurePage: React.FC = () => {
  return (
    <ErrorUi
      title="Application Load Failure"
      description="We encountered an error when trying to load your application and your page could not be served. "
      buttonText="Go back"
      buttonLink="/"
      children={<img src={FailureImage} style={{ lineHeight: 'normal' }} />}
    />
  );
};

export default LoadFailurePage;
