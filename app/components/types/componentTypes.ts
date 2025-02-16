import React, { ReactNode, UIEvent } from 'react';

export interface ActionCardProps {
  projectsCount: number;
  onCreateProjectClick: () => void;
  onProjectUpload: () => void;
}

export interface HeaderProps {
  handleSendMessage?: (event: UIEvent, messageInput?: string) => void;
  isStreaming?: boolean;
  handleStop?: () => void;
  isDashboardPage?: boolean;
  isSettingsPage?: boolean;
}

export type ListItemType = {
  title: string;
  icon: string;
};

export interface ButtonProps {
  active?: boolean;
  disabled?: boolean;
  children?: any;
  onClick?: VoidFunction;
}

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export interface CloseButtonProps {
  closeModal: () => void;
}

export interface ErrorPageProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  children?: React.ReactNode;
}

export interface BaseIconButtonProps {
  size?: IconSize;
  className?: string;
  iconClassName?: string;
  disabledClassName?: string;
  title?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export type IconSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type IconButtonProps = {
  icon?: string;
  children?: ReactNode;
} & BaseIconButtonProps;
