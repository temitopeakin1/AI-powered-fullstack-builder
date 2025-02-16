import { SettingsTitleProps } from '~/backOffice/types/settings';

export function SettingsTitle({ children }: SettingsTitleProps) {
  return <h1 className="custom text-3xl font-medium text-white uppercase mb-2 ">{children}</h1>;
}
