import { useActionData } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/common/Header/Header';
import { BaseChat } from '~/ai/components/BaseChat';
import { GitUrlImport } from '~/backOffice/components/GitUrlImport.client';

export const meta: MetaFunction = () => {
  return [{ title: 'biela' }, { name: 'description', content: 'Talk with biela, an AI assistant from TeachMeCode' }];
};

export async function loader(args: LoaderFunctionArgs) {
  return json({ url: args.params.url, title: args.params.title });
}

export async function action(args: ActionFunctionArgs) {
  try {
    const formData = await args.request.formData();

    const url = formData.get('url');
    const title = formData.get('title');

    if (!url) {
      return json({ error: 'Missing required field: url' }, { status: 400 });
    }
    return json({ url, title });
  } catch (error) {
    console.error('Error during form handling:', error);
    return json({ error: 'Error parsing form data' }, { status: 400 });
  }
}

export default function Index() {
  const actionData = useActionData<{ url: string; title: string }>();

  return (
    <div className="flex flex-col h-full w-full bg-biela-elements-background-depth-1">
      <Header />
      <ClientOnly fallback={<BaseChat />}>
        {() =>
          actionData ? <GitUrlImport url={actionData.url} title={actionData.title} /> : <GitUrlImport url="" title="" />
        }
      </ClientOnly>
    </div>
  );
}
