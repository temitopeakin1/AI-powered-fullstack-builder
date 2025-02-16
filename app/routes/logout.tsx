import { useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { useUser } from '~/ai/lib/context/userContext';

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useUser();

  useEffect(() => {
    logout().then();
    navigate('/');
  }, [navigate]);

  return null;
}
