import type { ReactNode } from 'react';

export interface BillingCardProps {
  title: string;
  description: string;
  children?: ReactNode;
  editable?: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  description: string;
  seats: number;
  status: 'Paid' | 'Pending' | 'Unsuccessful';
  invoice: string;
}

export type IOptions = {
  label: string;
  value: string;
};
