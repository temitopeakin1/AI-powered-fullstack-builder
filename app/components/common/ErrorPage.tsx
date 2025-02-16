import React from 'react';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

import AccessDeinedPage from '~/routes/Access-Deined-Page';
import LoadFailurePage from '~/routes/Load-Failure-Page';
import PageNotFound from '~/routes/Not-Found-Page';

import '../styles/font.scss';

export function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <PageNotFound />;
    }
    if (error.status === 403) {
      return <AccessDeinedPage />;
    }
    if (error.status === 500) {
      return <LoadFailurePage />;
    }
  }

  return <LoadFailurePage />;
}

export default ErrorPage;
