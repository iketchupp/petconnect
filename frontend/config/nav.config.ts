export type NavConfig = {
  main: {
    title: string;
    href: string;
    authorized?: boolean;
  }[];
};

export const navConfig: NavConfig = {
  main: [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Pets',
      href: '/pets',
    },
  ],
};
