'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	Search,
	Plus,
	Eye,
	Edit,
	Trash2,
	Calendar,
	User,
	FileText,
	Filter,
	Star,
	Pin,
	MoreVertical,
	Grid,
	List,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getMyPosts, GetPostsParams } from '@/services/posts-service';

const MyPostPage = () => {
	// Filter states
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<'createdAt' | 'publishedAt' | 'title'>('createdAt');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [showFilters, setShowFilters] = useState(false);

	const limit = 12;

	// Build query parameters
	const queryParams: GetPostsParams = {
		page: currentPage,
		limit,
		...(searchTerm && { search: searchTerm }),
		...(statusFilter !== 'all' && { status: statusFilter as 'draft' | 'published' | 'archived' }),
		sortBy,
		sortOrder,
	};

	// Fetch my posts
	const {
		data: postsData,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ['my-posts', queryParams],
		queryFn: () => getMyPosts(queryParams),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const posts = postsData?.data || [];
	const pagination = postsData?.pagination;

	// Handle search
	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1); // Reset to first page
	};

	// Handle filter changes
	const handleStatusFilter = (value: string) => {
		setStatusFilter(value);
		setCurrentPage(1);
	};

	const handleSort = (field: 'createdAt' | 'publishedAt' | 'title') => {
		if (sortBy === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(field);
			setSortOrder('desc');
		}
		setCurrentPage(1);
	};

	// Get status badge
	const getStatusBadge = (status: string) => {
		const variants = {
			published: { color: 'bg-green-500 text-white', text: 'Đã xuất bản', icon: '🟢' },
			draft: { color: 'bg-yellow-500 text-white', text: 'Bản nháp', icon: '📝' },
			archived: { color: 'bg-red-500 text-white', text: 'Đã lưu trữ', icon: '📦' },
		};

		const config = variants[status as keyof typeof variants] || variants.draft;

		return (
			<Badge className={`${config.color} text-xs font-medium`}>
				<span className='mr-1'>{config.icon}</span>
				{config.text}
			</Badge>
		);
	};

	// Loading state
	if (isLoading) {
		return (
			<div className='min-h-screen  p-6'>
				<div className='w-full mx-auto'>
					<div className='flex justify-center items-center py-24'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6'></div>
							<p className='text-slate-600 text-xl font-semibold'>Đang tải bài viết của bạn...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<div className='min-h-screen  p-6'>
				<div className='w-full mx-auto'>
					<div className='flex justify-center items-center py-24'>
						<Card className='max-w-md w-full'>
							<CardContent className='p-8 text-center'>
								<div className='text-red-500 mb-4'>
									<FileText className='w-16 h-16 mx-auto' />
								</div>
								<h2 className='text-2xl font-bold text-slate-900 mb-3'>Có lỗi xảy ra</h2>
								<p className='text-slate-600 mb-6'>Không thể tải danh sách bài viết của bạn.</p>
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
			<div className='w-full mx-auto p-6'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex items-center justify-between mb-6'>
						<div>
							<h1 className='text-4xl font-black text-slate-900 mb-2'>Bài viết của tôi</h1>
							<p className='text-slate-600 text-lg'>Quản lý và theo dõi tất cả bài viết bạn đã tạo</p>
						</div>
						<Button asChild className='bg-gradient-to-r from-blue-600 to-indigo-600'>
							<Link href='/admin/posts/create'>
								<Plus className='mr-2 h-4 w-4' />
								Tạo bài viết mới
							</Link>
						</Button>
					</div>

					{/* Stats Cards */}
					{pagination && (
						<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='p-2 bg-blue-100 rounded-lg'>
											<FileText className='h-5 w-5 text-blue-600' />
										</div>
										<div>
											<p className='text-sm text-slate-600'>Tổng bài viết</p>
											<p className='text-2xl font-bold'>{pagination.total}</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='p-2 bg-green-100 rounded-lg'>
											<Eye className='h-5 w-5 text-green-600' />
										</div>
										<div>
											<p className='text-sm text-slate-600'>Đã xuất bản</p>
											<p className='text-2xl font-bold'>
												{posts.filter((post) => post.status === 'published').length}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='p-2 bg-yellow-100 rounded-lg'>
											<Edit className='h-5 w-5 text-yellow-600' />
										</div>
										<div>
											<p className='text-sm text-slate-600'>Bản nháp</p>
											<p className='text-2xl font-bold'>
												{posts.filter((post) => post.status === 'draft').length}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='p-2 bg-purple-100 rounded-lg'>
											<Star className='h-5 w-5 text-purple-600' />
										</div>
										<div>
											<p className='text-sm text-slate-600'>Nổi bật</p>
											<p className='text-2xl font-bold'>
												{posts.filter((post) => post.isFeatured).length}
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
										placeholder='Tìm kiếm bài viết...'
										value={searchTerm}
										onChange={(e) => handleSearch(e.target.value)}
										className='pl-10'
									/>
								</div>
							</div>

							{/* Filters */}
							<div className='flex gap-2'>
								<Select value={statusFilter} onValueChange={handleStatusFilter}>
									<SelectTrigger className='w-40'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>Tất cả trạng thái</SelectItem>
										<SelectItem value='published'>Đã xuất bản</SelectItem>
										<SelectItem value='draft'>Bản nháp</SelectItem>
										<SelectItem value='archived'>Đã lưu trữ</SelectItem>
									</SelectContent>
								</Select>

								{/* Sort */}
								<Select
									value={`${sortBy}-${sortOrder}`}
									onValueChange={(value) => {
										const [field, order] = value.split('-');
										setSortBy(field as 'createdAt' | 'publishedAt' | 'title');
										setSortOrder(order as 'asc' | 'desc');
									}}
								>
									<SelectTrigger className='w-48'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='createdAt-desc'>Mới nhất</SelectItem>
										<SelectItem value='createdAt-asc'>Cũ nhất</SelectItem>
										<SelectItem value='title-asc'>Tên A-Z</SelectItem>
										<SelectItem value='title-desc'>Tên Z-A</SelectItem>
										<SelectItem value='publishedAt-desc'>Xuất bản mới nhất</SelectItem>
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

				{/* Posts Grid/List */}
				{posts.length === 0 ? (
					<Card className='text-center py-12'>
						<CardContent>
							<FileText className='w-16 h-16 mx-auto text-slate-300 mb-4' />
							<h3 className='text-xl font-semibold text-slate-900 mb-2'>Chưa có bài viết nào</h3>
							<p className='text-slate-600 mb-6'>
								{searchTerm
									? 'Không tìm thấy bài viết phù hợp'
									: 'Bắt đầu tạo bài viết đầu tiên của bạn'}
							</p>
							<Button asChild>
								<Link href='/admin/posts/create'>
									<Plus className='mr-2 h-4 w-4' />
									Tạo bài viết mới
								</Link>
							</Button>
						</CardContent>
					</Card>
				) : (
					<div
						className={
							viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'
						}
					>
						{posts.map((post) => (
							<Card key={post.id} className='group hover:shadow-lg transition-all duration-200'>
								{viewMode === 'grid' ? (
									<>
										{/* Grid View */}
										{post.featuredImage && (
											<div className='relative h-48 overflow-hidden rounded-t-lg'>
												<Image
													src={post.featuredImage}
													alt={post.title}
													fill
													className='object-cover group-hover:scale-105 transition-transform duration-200'
												/>
												<div className='absolute top-3 right-3 flex gap-2'>
													{post.isFeatured && (
														<Badge className='bg-yellow-500 text-white'>
															<Star className='w-3 h-3 mr-1' />
															Nổi bật
														</Badge>
													)}
													{post.isSticky && (
														<Badge className='bg-red-500 text-white'>
															<Pin className='w-3 h-3 mr-1' />
															Ghim
														</Badge>
													)}
												</div>
											</div>
										)}
										<CardContent className='p-4'>
											<div className='flex items-start justify-between mb-3'>
												{getStatusBadge(post.status)}
												<div className='text-xs text-slate-500'>
													{format(new Date(post.createdAt), 'dd/MM/yyyy', { locale: vi })}
												</div>
											</div>
											<h3 className='font-semibold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors'>
												{post.title}
											</h3>
											{post.excerpt && (
												<p className='text-slate-600 text-sm mb-4 line-clamp-3'>
													{post.excerpt}
												</p>
											)}
											<div className='flex items-center justify-between'>
												<div className='flex gap-2'>
													<Button size='sm' variant='outline' asChild>
														<Link href={`/admin/posts/${post.slug}`}>
															<Eye className='w-4 h-4 mr-1' />
															Xem
														</Link>
													</Button>
													<Button size='sm' asChild>
														<Link href={`/admin/posts/${post.slug}/edit`}>
															<Edit className='w-4 h-4 mr-1' />
															Sửa
														</Link>
													</Button>
												</div>
											</div>
										</CardContent>
									</>
								) : (
									/* List View */
									<CardContent className='p-4'>
										<div className='flex items-center gap-4'>
											{post.featuredImage && (
												<div className='relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0'>
													<Image
														src={post.featuredImage}
														alt={post.title}
														fill
														className='object-cover'
													/>
												</div>
											)}
											<div className='flex-1 min-w-0'>
												<div className='flex items-start justify-between mb-2'>
													<h3 className='font-semibold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors'>
														{post.title}
													</h3>
													<div className='flex items-center gap-2 ml-4'>
														{getStatusBadge(post.status)}
														{post.isFeatured && (
															<Star className='w-4 h-4 text-yellow-500' />
														)}
														{post.isSticky && <Pin className='w-4 h-4 text-red-500' />}
													</div>
												</div>
												{post.excerpt && (
													<p className='text-slate-600 text-sm mb-2 line-clamp-2'>
														{post.excerpt}
													</p>
												)}
												<div className='flex items-center justify-between'>
													<div className='text-xs text-slate-500'>
														Tạo:{' '}
														{format(new Date(post.createdAt), 'dd/MM/yyyy HH:mm', {
															locale: vi,
														})}
													</div>
													<div className='flex gap-2'>
														<Button size='sm' variant='outline' asChild>
															<Link href={`/admin/posts/${post.slug}`}>
																<Eye className='w-4 h-4' />
															</Link>
														</Button>
														<Button size='sm' asChild>
															<Link href={`/admin/posts/${post.slug}/edit`}>
																<Edit className='w-4 h-4' />
															</Link>
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

export default MyPostPage;
