'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import AdminLayout from '@/components/layout/admin-layout';
import { Toaster } from '@/components/ui/sonner';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<AdminLayout>
				{children}
				<Toaster />
			</AdminLayout>
			<ReactQueryDevtools initialIsOpen={true} />
		</QueryClientProvider>
	);
}
