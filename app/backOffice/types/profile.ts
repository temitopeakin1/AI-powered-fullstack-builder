export interface ProfileDataRightProps {
  url?: string;
  email?: string;
  isChecked?: boolean;
  isEmailConfirmed?: boolean;
  country?: string;
  isGithubConnected?: boolean;
  onCheckChange?: (checked: boolean) => void;
  onOpenModal?: () => void;
}

export interface ProfileDataLeftProps {
  firstName?: string;
  lastName?: string;
  title?: string;
  bio?: string;
  country?: string;
}
