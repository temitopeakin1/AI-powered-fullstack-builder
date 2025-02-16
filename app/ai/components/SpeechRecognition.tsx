import { IconButton } from '~/components/common/IconButton';
import { classNames } from '~/utils/classNames';
import React from 'react';
import MicrophoneIcon from '~/assets/icons/voiceIcon';
import WithTooltip from '~/ai/components/Tooltip';

export const SpeechRecognitionButton = ({
  isListening,
  onStart,
  onStop,
  disabled,
}: {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
}) => {
  return (
    <IconButton
      title={isListening ? 'Stop listening' : 'Start speech recognition'}
      disabled={disabled}
      className={classNames('transition-all micro-on', {
        'text-biela-elements-item-contentAccent': isListening,
      })}
      onClick={isListening ? onStop : onStart}
    >
      {isListening ? (
        <>
          <WithTooltip tooltip="Close Microphone">
            <div className="light:hidden">
              <MicrophoneIcon />
            </div>
          </WithTooltip>
          <WithTooltip tooltip="Close Microphone">
            <div className="dark:hidden">
              <MicrophoneIcon fill="black" />
            </div>
          </WithTooltip>
        </>
      ) : (
        <WithTooltip tooltip="Open Microphone">
          <div className="i-ph:microphone-slash text-xl text-biela-elements-item-contentAccent micro-on" />
        </WithTooltip>
      )}
    </IconButton>
  );
};
