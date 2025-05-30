import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
					<SidebarTrigger />
					<h1 className='text-lg font-semibold'>Admin Panel</h1>
				</header>
				<div className='flex-1 p-4'>{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
