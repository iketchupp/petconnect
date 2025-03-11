import { ThemeSwitcher } from '@/components/theme-switcher';

import { HeaderBackground } from './background';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';

export function Header() {
  return (
    <header className="stick top-0 z-50 w-full">
      <div className="flex h-12 items-center justify-between p-4">
        <MainNav />
        <UserNav />

        <HeaderBackground />
      </div>
    </header>
  );
}
