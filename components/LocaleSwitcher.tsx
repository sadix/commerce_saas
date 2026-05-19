'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
//import styles from './LocaleSwitcher.module.css';
//import {cookies} from 'next/headers';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = async (newLocale: string) => {
    //const store = await cookies();
    //store.set('NEXT_LOCALE', newLocale, { maxAge: 60 * 60 * 24 * 365, path: '/' });
    document.cookie = `NEXT_LOCALE=${newLocale}; max-age=31536000; path=/`;
    router.refresh(); // Refresh the page to apply the new locale
   
  };

  return (
    <select
      className=""
      value={locale}
      onChange={e => switchLocale(e.target.value)}>
      <option value="en">EN</option>
      <option value="fr">FR</option>
    </select>
  );
}