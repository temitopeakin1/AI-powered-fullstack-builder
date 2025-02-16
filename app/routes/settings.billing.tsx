import { BillingCards } from '~/backOffice/components/billings/BillingCards';
import { InvoiceTable } from '~/backOffice/components/billings/InvoiceTable';

export default function SettingsBilling() {
  return (
    <div className="w-full">
      <BillingCards />
      <div className="flex flex-col mt-6 w-full">
        <span className="text-lg font-medium pb-1 text-[#FFFFFF]">Recent Invoice</span>
        <h3 className="text-xs text-[#777777] pt-2">Here will be your recent invoice</h3>
        <div className="mt-4 md:mt-8">
          <InvoiceTable />
        </div>
      </div>
    </div>
  );
}
