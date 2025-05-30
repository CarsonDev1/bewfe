'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	LayoutDashboard,
	FileText,
	FolderTree,
	Tag,
	Users,
	Settings,
	BarChart3,
	Image,
	User,
	LogOut,
	ChevronUp,
} from 'lucide-react';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarHeader,
	SidebarFooter,
} from '@/components/ui/sidebar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMe } from '@/services/auth-service';

const sidebarItems = [
	{
		title: 'Trang chủ',
		href: '/admin',
		icon: LayoutDashboard,
	},
	{
		title: 'Bài viết',
		href: '/admin/posts',
		icon: FileText,
	},
	{
		title: 'Danh mục',
		href: '/admin/categories',
		icon: FolderTree,
	},
	{
		title: 'Thẻ',
		href: '/admin/tags',
		icon: Tag,
	},
	{
		title: 'Người dùng',
		href: '/admin/users',
		icon: Users,
	},
	{
		title: 'Thư viện',
		href: '/admin/media',
		icon: Image,
	},
	{
		title: 'Thống kê',
		href: '/admin/analytics',
		icon: BarChart3,
	},
	{
		title: 'Cài đặt',
		href: '/admin/settings',
		icon: Settings,
	},
];

interface UserDropdownProps {
	user: {
		displayName: string;
		email: string;
		firstName: string;
		lastName: string;
		avatar?: string;
	};
	onLogout: () => void;
}

function UserDropdown({ user, onLogout }: UserDropdownProps) {
	// Tạo initials từ firstName và lastName
	const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarMenuButton
					size='lg'
					className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
				>
					<Avatar className='h-8 w-8 rounded-lg'>
						<AvatarImage src={user?.avatar} alt={user?.displayName || 'User'} className='rounded-lg' />
						<AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
					</Avatar>
					<div className='grid flex-1 text-left text-sm leading-tight'>
						<span className='truncate font-semibold'>{user.displayName}</span>
						<span className='truncate text-xs'>{user.email}</span>
					</div>
					<ChevronUp className='ml-auto size-4' />
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
				side='bottom'
				align='end'
				sideOffset={4}
			>
				<DropdownMenuItem asChild>
					<Link href='/admin/profile' className='cursor-pointer'>
						<User className='mr-2 h-4 w-4' />
						Hồ sơ
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href='/admin/account' className='cursor-pointer'>
						<Settings className='mr-2 h-4 w-4' />
						Cài đặt tài khoản
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onLogout} className='cursor-pointer text-red-600 focus:text-red-600'>
					<LogOut className='mr-2 h-4 w-4' />
					Đăng xuất
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function AppSidebar() {
	const pathname = usePathname();
	const router = useRouter();

	const {
		data: user,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['me'],
		queryFn: getMe,
		retry: (failureCount, error: any) => {
			if (error?.response?.status === 401) {
				return false;
			}
			return failureCount < 3;
		},
		staleTime: 5 * 60 * 1000, // 5 phút
		gcTime: 10 * 60 * 1000, // 10 phút (thay cho cacheTime trong v5)
	});

	const handleLogout = () => {
		// Xóa tokens
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');

		// Hiện toast
		toast.success('Đăng xuất thành công');

		// Redirect về login
		router.push('/login');
	};

	// Nếu có lỗi 401, redirect về login
	if (isError && error?.response?.status === 401) {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		router.push('/login');
		return null;
	}

	return (
		<Sidebar>
			<SidebarHeader>
				<h2 className='text-lg font-semibold'>Quản trị diễn đàn</h2>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{sidebarItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild isActive={pathname === item.href}>
										<Link href={item.href}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						{isLoading ? (
							<SidebarMenuButton disabled>
								<div className='h-8 w-8 rounded-lg bg-gray-200 animate-pulse' />
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<div className='h-4 bg-gray-200 rounded animate-pulse mb-1' />
									<div className='h-3 bg-gray-200 rounded animate-pulse w-3/4' />
								</div>
							</SidebarMenuButton>
						) : user ? (
							<UserDropdown user={user} onLogout={handleLogout} />
						) : (
							<SidebarMenuButton asChild>
								<Link href='/login'>
									<User />
									<span>Đăng nhập</span>
								</Link>
							</SidebarMenuButton>
						)}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
