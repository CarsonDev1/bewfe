'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Search,
	Plus,
	Users,
	UserCheck,
	Shield,
	Crown,
	Ban,
	Eye,
	Edit,
	MoreVertical,
	Calendar,
	Mail,
	Globe,
	FileText,
	Grid,
	List,
	Filter,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getUsers, GetUsersParams } from '@/services/user-service';

const UsersPage = () => {
	// Filter states
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [publicFilter, setPublicFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<'createdAt' | 'postCount' | 'followerCount' | 'username'>('createdAt');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	const limit = 12;

	// Build query parameters
	const queryParams: GetUsersParams = {
		page: currentPage,
		limit,
		...(searchTerm && { search: searchTerm }),
		...(roleFilter !== 'all' && { role: roleFilter as 'user' | 'moderator' | 'admin' }),
		...(statusFilter !== 'all' && { status: statusFilter as 'active' | 'inactive' | 'banned' }),
		...(publicFilter !== 'all' && { isPublic: publicFilter === 'public' }),
		sortBy,
		sortOrder,
	};

	// Fetch users
	const {
		data: usersData,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ['users', queryParams],
		queryFn: () => getUsers(queryParams),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const users = usersData?.data || [];
	const pagination = usersData?.pagination;

	// Handle search
	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1); // Reset to first page
	};

	// Handle filter changes
	const handleRoleFilter = (value: string) => {
		setRoleFilter(value);
		setCurrentPage(1);
	};

	const handleStatusFilter = (value: string) => {
		setStatusFilter(value);
		setCurrentPage(1);
	};

	const handlePublicFilter = (value: string) => {
		setPublicFilter(value);
		setCurrentPage(1);
	};

	const handleSort = (field: 'createdAt' | 'postCount' | 'followerCount' | 'username') => {
		if (sortBy === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(field);
			setSortOrder('desc');
		}
		setCurrentPage(1);
	};

	// Get role badge
	const getRoleBadge = (role: string) => {
		const variants = {
			admin: { color: 'bg-red-500 text-white', text: 'Admin', icon: <Crown className='w-3 h-3' /> },
			moderator: { color: 'bg-blue-500 text-white', text: 'Moderator', icon: <Shield className='w-3 h-3' /> },
			user: { color: 'bg-gray-500 text-white', text: 'User', icon: <Users className='w-3 h-3' /> },
		};

		const config = variants[role as keyof typeof variants] || variants.user;

		return (
			<Badge className={`${config.color} text-xs font-medium flex items-center gap-1`}>
				{config.icon}
				{config.text}
			</Badge>
		);
	};

	// Get status badge
	const getStatusBadge = (status: string) => {
		const variants = {
			active: { color: 'bg-green-500 text-white', text: 'Hoạt động', icon: '🟢' },
			inactive: { color: 'bg-yellow-500 text-white', text: 'Không hoạt động', icon: '🟡' },
			banned: { color: 'bg-red-500 text-white', text: 'Bị cấm', icon: '🔴' },
		};

		const config = variants[status as keyof typeof variants] || variants.active;

		return (
			<Badge className={`${config.color} text-xs font-medium`}>
				<span className='mr-1'>{config.icon}</span>
				{config.text}
			</Badge>
		);
	};

	// Get user initials for avatar fallback
	const getUserInitials = (user: any) => {
		if (user.displayName) {
			return user.displayName
				.split(' ')
				.map((n: string) => n[0])
				.join('')
				.toUpperCase();
		}
		if (user.firstName && user.lastName) {
			return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
		}
		return user.username?.slice(0, 2).toUpperCase() || 'U';
	};

	// Loading state
	if (isLoading) {
		return (
			<div className=' p-6'>
				<div className='w-full mx-auto'>
					<div className='flex justify-center items-center py-24'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6'></div>
							<p className='text-slate-600 text-xl font-semibold'>Đang tải danh sách người dùng...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<div className=' p-6'>
				<div className='w-full mx-auto'>
					<div className='flex justify-center items-center py-24'>
						<Card className='max-w-md w-full'>
							<CardContent className='p-8 text-center'>
								<div className='text-red-500 mb-4'>
									<Users className='w-16 h-16 mx-auto' />
								</div>
								<h2 className='text-2xl font-bold text-slate-900 mb-3'>Có lỗi xảy ra</h2>
								<p className='text-slate-600 mb-6'>Không thể tải danh sách người dùng.</p>
								<Button onClick={() => refetch()}>Thử lại</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className='w-full mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex items-center justify-between mb-6'>
						<div>
							<h1 className='text-4xl font-black text-slate-900 mb-2'>Quản lý người dùng</h1>
							<p className='text-slate-600 text-lg'>Xem và quản lý tất cả người dùng trong hệ thống</p>
						</div>
						<Button className='bg-gradient-to-r from-blue-600 to-indigo-600'>
							<Plus className='mr-2 h-4 w-4' />
							Thêm người dùng
						</Button>
					</div>

					{/* Stats Cards */}
					{pagination && (
						<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='p-2 bg-blue-100 rounded-lg'>
											<Users className='h-5 w-5 text-blue-600' />
										</div>
										<div>
											<p className='text-sm text-slate-600'>Tổng người dùng</p>
											<p className='text-2xl font-bold'>{pagination.total}</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='p-2 bg-green-100 rounded-lg'>
											<UserCheck className='h-5 w-5 text-green-600' />
										</div>
										<div>
											<p className='text-sm text-slate-600'>Đang hoạt động</p>
											<p className='text-2xl font-bold'>
												{users.filter((user) => user.status === 'active').length}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='p-2 bg-red-100 rounded-lg'>
											<Crown className='h-5 w-5 text-red-600' />
										</div>
										<div>
											<p className='text-sm text-slate-600'>Quản trị viên</p>
											<p className='text-2xl font-bold'>
												{users.filter((user) => user.role === 'admin').length}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='p-2 bg-purple-100 rounded-lg'>
											<Globe className='h-5 w-5 text-purple-600' />
										</div>
										<div>
											<p className='text-sm text-slate-600'>Profile công khai</p>
											<p className='text-2xl font-bold'>
												{users.filter((user) => user.isPublic).length}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</div>

				{/* Filters and Search */}
				<Card className='mb-6'>
					<CardContent className='p-6'>
						<div className='flex flex-col lg:flex-row gap-4'>
							{/* Search */}
							<div className='flex-1'>
								<div className='relative'>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
									<Input
										placeholder='Tìm kiếm người dùng...'
										value={searchTerm}
										onChange={(e) => handleSearch(e.target.value)}
										className='pl-10'
									/>
								</div>
							</div>

							{/* Filters */}
							<div className='flex gap-2'>
								{/* Role Filter */}
								<Select value={roleFilter} onValueChange={handleRoleFilter}>
									<SelectTrigger className='w-32'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>Tất cả vai trò</SelectItem>
										<SelectItem value='admin'>Admin</SelectItem>
										<SelectItem value='moderator'>Moderator</SelectItem>
										<SelectItem value='user'>User</SelectItem>
									</SelectContent>
								</Select>

								{/* Status Filter */}
								<Select value={statusFilter} onValueChange={handleStatusFilter}>
									<SelectTrigger className='w-40'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>Tất cả trạng thái</SelectItem>
										<SelectItem value='active'>Hoạt động</SelectItem>
										<SelectItem value='inactive'>Không hoạt động</SelectItem>
										<SelectItem value='banned'>Bị cấm</SelectItem>
									</SelectContent>
								</Select>

								{/* Public Filter */}
								<Select value={publicFilter} onValueChange={handlePublicFilter}>
									<SelectTrigger className='w-32'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>Tất cả</SelectItem>
										<SelectItem value='public'>Công khai</SelectItem>
										<SelectItem value='private'>Riêng tư</SelectItem>
									</SelectContent>
								</Select>

								{/* Sort */}
								<Select
									value={`${sortBy}-${sortOrder}`}
									onValueChange={(value) => {
										const [field, order] = value.split('-');
										setSortBy(field as 'createdAt' | 'postCount' | 'followerCount' | 'username');
										setSortOrder(order as 'asc' | 'desc');
									}}
								>
									<SelectTrigger className='w-48'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='createdAt-desc'>Mới nhất</SelectItem>
										<SelectItem value='createdAt-asc'>Cũ nhất</SelectItem>
										<SelectItem value='username-asc'>Tên A-Z</SelectItem>
										<SelectItem value='username-desc'>Tên Z-A</SelectItem>
										<SelectItem value='postCount-desc'>Nhiều bài viết nhất</SelectItem>
										<SelectItem value='followerCount-desc'>Nhiều follower nhất</SelectItem>
									</SelectContent>
								</Select>

								{/* View Mode */}
								<div className='flex border rounded-lg'>
									<Button
										variant={viewMode === 'grid' ? 'default' : 'ghost'}
										size='sm'
										onClick={() => setViewMode('grid')}
									>
										<Grid className='h-4 w-4' />
									</Button>
									<Button
										variant={viewMode === 'list' ? 'default' : 'ghost'}
										size='sm'
										onClick={() => setViewMode('list')}
									>
										<List className='h-4 w-4' />
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Users Grid/List */}
				{users.length === 0 ? (
					<Card className='text-center py-12'>
						<CardContent>
							<Users className='w-16 h-16 mx-auto text-slate-300 mb-4' />
							<h3 className='text-xl font-semibold text-slate-900 mb-2'>Không tìm thấy người dùng</h3>
							<p className='text-slate-600 mb-6'>
								{searchTerm
									? 'Không có người dùng phù hợp với tìm kiếm'
									: 'Chưa có người dùng nào trong hệ thống'}
							</p>
						</CardContent>
					</Card>
				) : (
					<div
						className={
							viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'
						}
					>
						{users.map((user) => (
							<Card key={user.id} className='group hover:shadow-lg transition-all duration-200'>
								{viewMode === 'grid' ? (
									/* Grid View */
									<CardContent className='p-6'>
										<div className='flex items-start gap-4 mb-4'>
											<Avatar className='w-12 h-12'>
												<AvatarImage
													src={user.avatar}
													alt={user.displayName || user.username}
												/>
												<AvatarFallback>{getUserInitials(user)}</AvatarFallback>
											</Avatar>
											<div className='flex-1 min-w-0'>
												<h3 className='font-semibold text-lg text-slate-900 truncate'>
													{user.displayName || user.username}
												</h3>
												<p className='text-slate-600 text-sm truncate'>@{user.username}</p>
												<p className='text-slate-500 text-xs truncate'>{user.email}</p>
											</div>
										</div>

										<div className='flex items-center gap-2 mb-4'>
											{getRoleBadge(user.role)}
											{getStatusBadge(user.status)}
											{user.isPublic && (
												<Badge variant='outline' className='text-xs'>
													<Globe className='w-3 h-3 mr-1' />
													Công khai
												</Badge>
											)}
										</div>

										{user.bio && (
											<p className='text-slate-600 text-sm mb-4 line-clamp-2'>{user.bio}</p>
										)}

										<div className='grid grid-cols-2 gap-4 text-center mb-4'>
											<div>
												<p className='text-lg font-bold text-slate-900'>
													{user.postCount || 0}
												</p>
												<p className='text-xs text-slate-500'>Bài viết</p>
											</div>
											<div>
												<p className='text-lg font-bold text-slate-900'>
													{user.followerCount || 0}
												</p>
												<p className='text-xs text-slate-500'>Followers</p>
											</div>
										</div>

										<div className='flex items-center justify-between'>
											<div className='text-xs text-slate-500'>
												Tham gia:{' '}
												{format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
											</div>
											<div className='flex gap-2'>
												<Button size='sm' variant='outline'>
													<Eye className='w-4 h-4' />
												</Button>
												<Button size='sm'>
													<Edit className='w-4 h-4' />
												</Button>
											</div>
										</div>
									</CardContent>
								) : (
									/* List View */
									<CardContent className='p-4'>
										<div className='flex items-center gap-4'>
											<Avatar className='w-16 h-16'>
												<AvatarImage
													src={user.avatar}
													alt={user.displayName || user.username}
												/>
												<AvatarFallback>{getUserInitials(user)}</AvatarFallback>
											</Avatar>
											<div className='flex-1 min-w-0'>
												<div className='flex items-start justify-between mb-2'>
													<div>
														<h3 className='font-semibold text-lg text-slate-900'>
															{user.displayName || user.username}
														</h3>
														<p className='text-slate-600 text-sm'>@{user.username}</p>
														<p className='text-slate-500 text-xs'>{user.email}</p>
													</div>
													<div className='flex items-center gap-2'>
														{getRoleBadge(user.role)}
														{getStatusBadge(user.status)}
													</div>
												</div>
												{user.bio && (
													<p className='text-slate-600 text-sm mb-2 line-clamp-1'>
														{user.bio}
													</p>
												)}
												<div className='flex items-center justify-between'>
													<div className='flex items-center gap-4 text-sm text-slate-500'>
														<span>{user.postCount || 0} bài viết</span>
														<span>{user.followerCount || 0} followers</span>
														<span>
															Tham gia{' '}
															{format(new Date(user.createdAt), 'dd/MM/yyyy', {
																locale: vi,
															})}
														</span>
													</div>
													<div className='flex gap-2'>
														<Button size='sm' variant='outline'>
															<Eye className='w-4 h-4' />
														</Button>
														<Button size='sm'>
															<Edit className='w-4 h-4' />
														</Button>
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								)}
							</Card>
						))}
					</div>
				)}

				{/* Pagination */}
				{pagination && pagination.pages > 1 && (
					<div className='flex justify-center items-center gap-2 mt-8'>
						<Button
							variant='outline'
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
						>
							Trước
						</Button>

						{Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
							const page = i + 1;
							return (
								<Button
									key={page}
									variant={currentPage === page ? 'default' : 'outline'}
									onClick={() => setCurrentPage(page)}
								>
									{page}
								</Button>
							);
						})}

						<Button
							variant='outline'
							onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
							disabled={currentPage === pagination.pages}
						>
							Tiếp
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default UsersPage;
