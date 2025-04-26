import { MessageNotifications } from '@/components/app/user/messages/notifications';
import { ThemeSwitcher } from '@/components/theme-switcher';

import { HeaderBackground } from './background';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { UserMenu } from './user-menu';

export function Header() {
  return (
    <header className="stick top-0 z-50 w-full">
      <div className="flex h-12 items-center justify-between p-4">
        <MainNav />
        <MobileNav />

        <div className="flex items-center gap-2">
          <MessageNotifications />
          <UserMenu />
        </div>

        <HeaderBackground />
      </div>
    </header>
  );
}
