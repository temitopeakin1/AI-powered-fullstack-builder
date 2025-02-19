import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import {OAuthCallbackClient} from "~/components/supabase/OAuthCallback.client";
import { ClientOnly } from 'remix-utils/client-only';
import {BaseChat} from "~/ai/components/BaseChat";
import {GitUrlImport} from "~/backOffice/components/GitUrlImport.client";


export async function loader(args: LoaderFunctionArgs) {
  return json({ id: args.params.id });
}

export default function CallbackRoute() {


  return  <ClientOnly fallback={<BaseChat />}>
    {() =>
      <OAuthCallbackClient />
    }
  </ClientOnly>
}
