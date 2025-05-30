'use client';

import { Bell, Menu, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLogout } from '@/hooks/api';
import { useRouter } from 'next/navigation';

interface HeaderProps {
	onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
	const logout = useLogout();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await logout.mutateAsync();
			router.push('/login');
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='container flex h-14 items-center'>
				<Button variant='ghost' size='icon' className='mr-2 md:hidden' onClick={onMenuClick}>
					<Menu className='h-4 w-4' />
				</Button>

				<div className='flex flex-1 items-center space-x-2'>
					<div className='w-full flex-1 md:w-auto md:flex-none'>
						<div className='relative'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
							<Input
								type='search'
								placeholder='Search...'
								className='w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]'
							/>
						</div>
					</div>
				</div>

				<div className='flex items-center space-x-2'>
					<Button variant='ghost' size='icon'>
						<Bell className='h-4 w-4' />
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' className='relative h-8 w-8 rounded-full'>
								<Avatar className='h-8 w-8'>
									<AvatarImage src='/avatars/01.png' alt='Avatar' />
									<AvatarFallback>AD</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='w-56' align='end' forceMount>
							<DropdownMenuLabel className='font-normal'>
								<div className='flex flex-col space-y-1'>
									<p className='text-sm font-medium leading-none'>Admin</p>
									<p className='text-xs leading-none text-muted-foreground'>admin@example.com</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<User className='mr-2 h-4 w-4' />
								<span>Profile</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>
								<LogOut className='mr-2 h-4 w-4' />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
