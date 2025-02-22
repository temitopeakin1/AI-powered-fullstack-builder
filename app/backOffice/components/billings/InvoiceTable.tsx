import { Invoice } from '~/backOffice/types/billings';

const invoices: Invoice[] = [
  {
    id: '1',
    date: 'December 4, 2025',
    description: 'Monthly Payment',
    seats: 5,
    status: 'Pending',
    invoice: 'View Invoice',
  },
  {
    id: '2',
    date: 'December 4, 2025',
    description: 'Monthly Payment',
    seats: 6,
    status: 'Paid',
    invoice: 'View Invoice',
  },
  {
    id: '3',
    date: 'December 4, 2025',
    description: 'Monthly Payment',
    seats: 5,
    status: 'Paid',
    invoice: 'View Invoice',
  },
  {
    id: '4',
    date: 'December 4, 2025',
    description: 'Monthly Payment',
    seats: 5,
    status: 'Paid',
    invoice: 'View Invoice',
  },
  {
    id: '5',
    date: 'December 4, 2025',
    description: 'Monthly Payment',
    seats: 5,
    status: 'Paid',
    invoice: 'View Invoice',
  },
  {
    id: '6',
    date: 'December 4, 2025',
    description: 'Monthly Payment',
    seats: 5,
    status: 'Paid',
    invoice: 'View Invoice',
  },
  {
    id: '6',
    date: 'December 4, 2025',
    description: 'Monthly Payment',
    seats: 5,
    status: 'Paid',
    invoice: 'View Invoice',
  },
  {
    id: '6',
    date: 'December 4, 2025',
    description: 'Monthly Payment',
    seats: 5,
    status: 'Paid',
    invoice: 'View Invoice',
  },
  {
    id: '6',
    date: 'December 4, 2025',
    description: 'Monthly Payment',
    seats: 5,
    status: 'Paid',
    invoice: 'View Invoice',
  },
];

export function InvoiceTable() {
  return (
    <div className="w-full overflow-x-auto mb-8 md:mb-24">
      <table className="w-full min-w-[800px] text-sm text-left border-collapse">
        <thead className="text-xs text-[#777777]">
          <tr>
            <th scope="col" className="py-4">
              Date
            </th>
            <th scope="col" className="py-4">
              Description
            </th>
            <th scope="col" className="py-4">
              Seats Invoiced
            </th>
            <th scope="col" className="py-4">
              Status
            </th>
            <th scope="col" className="py-4">
              Invoice
            </th>
          </tr>
        </thead>
        <tbody className="border-b-1 border-[#2C2C2C]">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className=" border-t border-[#2C2C2C] text-sm text-[#777777]">
              <td className="py-4 text-white">{invoice.date}</td>
              <td className="py-5  text-white">{invoice.description}</td>
              <td className="py-5 text-white">{invoice.seats}</td>
              <td className="py-5">
                <span
                  className={`px-2 py-1 text-sm ${
                    invoice.status === 'Paid'
                      ? 'text-[#86F49C]'
                      : invoice.status === 'Pending'
                        ? 'text-yellow-300'
                        : 'text-red-300'
                  }`}
                >
                  {invoice.status}
                </span>
              </td>
              <td className="py-4 text-white">{invoice.invoice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
