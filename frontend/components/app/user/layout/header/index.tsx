import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { MessageNotifications } from '@/components/app/user/messages/notifications';

export function UserHeader() {
  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>
      <div className="ml-auto flex items-center pr-4">
        <MessageNotifications />
      </div>
    </header>
  );
}
