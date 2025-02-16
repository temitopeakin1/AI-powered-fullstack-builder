import { backendApiFetch } from '~/ai/lib/backend-api';

const FE_BASE_URL = import.meta.env.CUSTOM_BASE_URL;

export async function getDefaultReferral() {
  const path = `/referrals/default`;

  const referralRes = await backendApiFetch(path, {
    method: 'GET',
  });

  const referral = await referralRes.json();

  const referralUrl = `${FE_BASE_URL}?referral=${referral.code}`;

  return referralUrl;
}
