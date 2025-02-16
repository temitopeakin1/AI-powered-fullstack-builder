import { useSearchParams } from '@remix-run/react';
import { generateId, type Message } from 'ai';
import ignore from 'ignore';
import { useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/ai/components/BaseChat';
import { Chat } from '~/ai/components/Chat.client';
import { useGit } from '~/ai/lib/hooks/useGit';
import { useChatHistory } from '~/ai/lib/persistence';
import { createCommandsMessage, detectProjectCommands } from '~/utils/projectCommands';
import { toast } from 'react-toastify';
import { GitUrlImportProps } from '~/backOffice/types/boCommon';
import { LoadingOverlay } from '~/ai/components/LoadingOverlay';

const IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  '.github/**',
  '.vscode/**',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.png',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '.cache/**',
  '.vscode/**',
  '.idea/**',
  '**/*.log',
  '**/.DS_Store',
  '**/npm-debug.log*',
  '**/yarn-debug.log*',
  '**/yarn-error.log*',
  '**/*lock.json',
  '**/*lock.yaml',
];

export function GitUrlImport({ url, title }: GitUrlImportProps) {
  const [searchParams] = useSearchParams();
  const { ready: historyReady, importChat } = useChatHistory();
  const { ready: gitReady, gitClone } = useGit();
  const [imported, setImported] = useState(false);
  const [loading, setLoading] = useState(true);

  const importRepo = async (repoUrl?: string, title?: string) => {
    if (!gitReady && !historyReady) {
      return;
    }

    if (repoUrl) {
      const ig = ignore().add(IGNORE_PATTERNS);

      try {
        const { data } = await gitClone(repoUrl);

        if (importChat) {
          const filePaths = Object.keys(data).filter((filePath) => !ig.ignores(filePath));
          const textDecoder = new TextDecoder('utf-8');

          const fileContents = filePaths
            .map((filePath) => {
              const { data: content, encoding } = data[filePath];
              return {
                path: filePath,
                content:
                  encoding === 'utf8' ? content : content instanceof Uint8Array ? textDecoder.decode(content) : '',
              };
            })
            .filter((f) => f.content);

          const commands = await detectProjectCommands(fileContents);
          const commandsMessage = createCommandsMessage(commands);

          const filesMessage: Message = {
            role: 'assistant',
            content: `Setting up your new template, this might take a few moments.
<bielaArtifact id="imported-files" title="Importing template" type="bundled">
${fileContents
  .map(
    (file) =>
      `<bielaAction type="file" filePath="${file.path}">
${file.content}
</bielaAction>`,
  )
  .join('\n')}
</bielaArtifact>`,
            id: generateId(),
            createdAt: new Date(),
          };

          const messages = [filesMessage];

          if (commandsMessage) {
            messages.push(commandsMessage);
          }

          await importChat(
            title
              ? `${title}`
              : `${repoUrl.split('/').slice(-1)[0].replace('.git', '')}-${Math.random().toString(36).substring(2, 8)}`,
            messages,
          );
        }
      } catch (error) {
        console.error('Error during import:', error);
        toast.error('Failed to import repository');
        setLoading(false);
        window.location.href = '/';

        return;
      }
    }
  };

  useEffect(() => {
    const repUrl: string = searchParams.get('url') || url;
    const repTitle: string = searchParams.get('title') || title;

    if (!historyReady || !gitReady || imported) {
      return;
    }

    if (!repUrl) {
      window.location.href = '/';
      return;
    }

    importRepo(repUrl, repTitle).catch((error) => {
      console.error('Error importing repo:', error);
      toast.error('Failed to import repository');
      setLoading(false);
      window.location.href = '/';
    });
    setImported(true);
  }, [searchParams, url, title, historyReady, gitReady, imported]);

  return (
    <ClientOnly fallback={<BaseChat />}>
      {() => (
        <>
          <Chat />
          {loading && <LoadingOverlay message="Please wait while we load your project..." />}
        </>
      )}
    </ClientOnly>
  );
}
