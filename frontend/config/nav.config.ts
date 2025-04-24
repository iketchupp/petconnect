import { Heart, Home, LucideIcon, MessageSquare, PawPrint, User } from 'lucide-react';

type NavTemplateConfig = {
  main: {
    title: string;
    href: string;
    authorized?: boolean;
  }[];
  sidebar: {
    [key: string]: {
      title: string;
      href: string;
      icon?: LucideIcon;
      items?: {
        title: string;
        href: string;
      }[];
    }[];
  };
};

export const navConfig = {
  main: [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Pets',
      href: '/pets',
    },
    {
      title: 'Shelters',
      href: '/shelters',
    },
  ],
  sidebar: {
    // /user
    main: [
      {
        title: 'Profile',
        href: '/',
        icon: User,
      },
    ],
    pages: [
      {
        title: 'My Pets',
        href: '/pets',
        icon: PawPrint,
      },
      {
        title: 'My Shelters',
        href: '/shelters',
        icon: Home,
      },
      {
        title: 'Favorites',
        href: '/favorites',
        icon: Heart,
      },
      {
        title: 'Messages',
        href: '/messages',
        icon: MessageSquare,
      },
    ],
  },
} satisfies NavTemplateConfig;
