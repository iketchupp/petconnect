import Image from 'next/image';

import { siteConfig } from '@/config/site.config';

export const Icons = {
  logo: (props) => <Image src="/favicon-96x96.png" alt={siteConfig.name} {...props} />,
};
