import React from 'react';

const EXAMPLE_PROMPTS = [
  { text: 'Start a Blog', color: '#86F49C' },
  { text: 'Build a Mobile App', color: '#F4F086' },
  { text: 'Create a Document Site', color: '#F086F4' },
  { text: 'Scaffold UI', color: '#86A7F4' },
  { text: 'Draft a Presentation', color: '#F48686' },
  { text: 'Create a Front-End Website', color: '#56A5FF' },
];

export function ExamplePrompts(sendMessage?: { (event: React.UIEvent, messageInput?: string): void | undefined }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: '1',
        justifyContent: 'center',
      }}
      id="examples"
      className="relative flex gap-9 w-full max-w-3xl mx-auto mt-10"
    >
      <div
        className="flex flex-wrap justify-center gap-2 max-w-[600px] max-sm:px-[20px]"
        style={{
          animation: '.25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards',
        }}
        onClick={(event: React.UIEvent) => {
          event.preventDefault();
        }}
      >
        {EXAMPLE_PROMPTS.map((examplePrompt, index: number) => {
          const words = examplePrompt.text.split(' ');
          const firstWord = words[0];
          const restWords = words.slice(1).join(' ');

          return (
            <button
              key={index}
              onClick={(event) => {
                sendMessage?.(event, examplePrompt.text);
              }}
              className="font-light border border-biela-elements-borderColor rounded-md bg-gray-50 hover:bg-gray-100 light:bg-[white] light:border-[#FFFFFF] dark:bg-gray-900 dark:hover:bg-gray-950 text-biela-elements-textSecondary hover:text-biela-elements-textPrimary px-[12px] py-[10px] text-[14px] transition-theme"
            >
              <span className="text-black dark:text-white light:text-[#2A2A2A]">{firstWord}</span>{' '}
              <span style={{ color: examplePrompt.color }}>{restWords}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
