import {getRequestConfig} from 'next-intl/server';
import { NextRequest} from 'next/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import {cookies, headers} from 'next/headers';
 
export default getRequestConfig(async ({}) => {
  const headerList = await headers();
  const acceptLanguageHeader = headerList.get('accept-language');
  //console.log('Accept-Language Header:', acceptLanguageHeader);
  const acceptLanguages = acceptLanguageHeader ? acceptLanguageHeader.split(',').map(lang => lang.trim()) : [];
  console.log('Parsed Accept-Language:', acceptLanguages);
  const store = await cookies();
  const locale = store.get('NEXT_LOCALE')?.value || acceptLanguages[0].split('-')[0] || 'en'; 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});