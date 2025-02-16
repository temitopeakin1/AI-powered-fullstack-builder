import { BillingCard } from './BillingCard';

export function BillingCards() {
  return (
    <div className=" grid grid-cols-1 md:grid-cols-3 gap-6 font-inter mt-8 md:mt-16">
      <BillingCard title="Next invoice issue date" description="January 4, 2025" />
      <BillingCard title="Invoice Total" description="$50.00" />
      <BillingCard title="Billing email" description="charlesxavier@gmail.com" editable />
    </div>
  );
}
