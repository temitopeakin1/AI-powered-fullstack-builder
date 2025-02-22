import { NavLink } from '@remix-run/react';
import BTCIcon from '~/assets/icons/bitcoin-icon.svg';
import ETHIcon from '~/assets/icons/etherium-icon.svg';
import USDTIcon from '~/assets/icons/usdt-icon.svg';
import GreenLogo from '~/assets/icons/logo-green.svg';
import React, { useState } from 'react';
import '../../../components/styles/signin.scss';
import Dropdown from '~/components/common/Dropdown';
import Input from '~/components/common/Input';
import QRCode from 'react-qr-code';
import RoundedCorner from '~/assets/icons/roundedCorner.svg';
import { backendApiFetch } from '~/ai/lib/backend-api';

export default function TokensPage() {
  const [walletData, setWalletData] = useState<{
    address: string;
    currency: string;
    processingFee: number;
  }>();

  const currencies = [
    {
      label: 'BTC',
      value: 'BTC',
      icon: BTCIcon,
    },
    {
      label: 'ETH',
      value: 'ETH',
      icon: ETHIcon,
    },
    {
      label: 'USDT',
      value: 'USDT',
      icon: USDTIcon,
    },
  ];

  const [currency, setCurrency] = useState<{ label: string; value: string; icon: string }>({
    label: '',
    value: '',
    icon: '',
  });

  async function createWallet(request: { currency: string }) {
    try {
      const response = await backendApiFetch(`/payments/create-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create wallet');
      }

      const data = (await response.json()) as { address: string; currency: string; processingFee: number };
      setWalletData(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={` flex items-center flex-col justify-between h-screen signin-bg `}>
      <section className="flex flex-col items-center justify-center gap-[46px] ">
        <NavLink to={'/'}>
          <img src={GreenLogo} className="w-[110px] mt-[60px] cursor-pointer" alt={'logo'} />
        </NavLink>
        <div className="bg-gradient-to-t from-[rgba(31,31,31,0.80)] to-[rgba(0,0,0,0.05)] rounded-[8px] backdrop-blur-[25px] flex flex-col justify-center p-[24px] border border-[#2E2E2E] max-w-[553px]">
          <h1 className="title-login">GET MORE TOKENS</h1>
          <p className="desc-login">Deposit using your favorite currency and unlock more tokens.</p>
          <form onSubmit={() => {}} className="flex flex-col gap-[12px]">
            <Dropdown
              value={currency}
              items={currencies}
              disabled={false}
              onSelect={(selected) => {
                if (selected) {
                  const newCurrency = {
                    label: selected.label,
                    value: selected.value.toString(),
                    icon: String(selected.icon),
                  };
                  setCurrency(newCurrency);
                  createWallet({ currency: newCurrency.value });
                }
              }}
              label={'Select Currency'}
            />
            {walletData ? <Input label={'Deposit Address'} value={walletData?.address} copyValue disabled /> : <></>}
            <div
              className="border rounded-[8px] p-[12px] flex items-start gap-[16px] text-[12px] mb-[16px] mt-[12px]"
              style={{
                background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(31, 31, 31, 0.80) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.19)',
              }}
            >
              <span className="i-ph:warning text-[24px] text-[#86F49C] flex-shrink-0 h-full"></span>
              <div>
                <span className="text-[12px] text-[#FBFBFB] font-[Inter] items-center h-full break-words font-light">
                  Please note: A deposit
                  <span className="text-[#86F49C]"> fee of {walletData?.processingFee ?? 1}% may apply</span>, depending
                  on the currency you choose to deposit.
                </span>
              </div>
            </div>
            {walletData ? (
              <div className={'w-full flex h-[214px] justify-center items-center '}>
                <div className={'h-full relative flex flex-col justify-between'}>
                  <img src={RoundedCorner} alt={''} width={19} height={19} className={'flex'} />
                  <img src={RoundedCorner} alt={''} width={19} height={19} className={'flex rotate-270 '} />
                </div>
                <div className={'max-h-[180px] max-w-[180px] rounded-[8px] border border-[#86F49C] bg-white'}>
                  <QRCode
                    height={'13rem'}
                    value={walletData?.address || ''}
                    bgColor="#FFF"
                    className={'w-full h-full p-[12px]'}
                  />
                </div>
                <div className={'h-full relative flex flex-col justify-between'}>
                  <img src={RoundedCorner} alt={''} width={19} height={19} className={'flex rotate-90'} />
                  <img src={RoundedCorner} alt={''} width={19} height={19} className={'flex rotate-180 '} />
                </div>
              </div>
            ) : (
              <></>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
