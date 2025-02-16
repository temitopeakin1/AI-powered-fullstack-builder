import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { confirmUserEmail } from '~/ai/lib/stores/user/user';

function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Confirming your email...');

  const BASE_URL = import.meta.env.CUSTOM_BACKEND_API;

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('Invalid confirmation link');
      return;
    }

    confirmUserEmail(token)
      .then((data) => {
        if (data) {
          // setMessage("Your email has been confirmed! Redirecting to login...");

          // Redirect to /
          setTimeout(() => {
            navigate('/');
          }, 0);
        } else {
          setMessage('Failed to confirm email. Try again or contact support.');
        }
      })
      .catch((err) => {
        navigate('/');
        setMessage(err.message);
      });
  }, [searchParams, navigate, BASE_URL]);

  return <div>{message}</div>;
}

export default ConfirmEmail;
