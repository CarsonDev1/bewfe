'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Plus,
	Search,
	MoreHorizontal,
	Edit,
	Trash2,
	Eye,
	Filter,
	Calendar,
	User,
	Hash,
	TrendingUp,
	MessageCircle,
	Heart,
	Star,
	Pin,
	Sparkles,
	BarChart3,
	Loader2,
} from 'lucide-react';
import { usePosts, useDeletePost } from '@/hooks/api';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { deletePost } from '@/services/posts-service';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function PostsPage() {
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<any>('');
	const queryClient = useQueryClient();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [postToDelete, setPostToDelete] = useState<string | null>(null);

	const { data: postsData, isLoading } = usePosts({
		page,
		limit: 10,
		search: search || undefined,
		status: status || undefined,
	});

	const openDeleteDialog = (postId: string) => {
		setPostToDelete(postId);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (postToDelete) {
			try {
				await deletePostMutation.mutateAsync(postToDelete);
			} catch (error) {
				console.error('Error deleting post:', error);
			} finally {
				setDeleteDialogOpen(false);
				setPostToDelete(null);
			}
		}
	};

	const cancelDelete = () => {
		setDeleteDialogOpen(false);
		setPostToDelete(null);
	};

	const deletePostMutation = useMutation({
		mutationFn: deletePost,
		onSuccess: () => {
			toast.success('Xóa bài viết thành công!');
			// Invalidate queries để refetch data
			queryClient.invalidateQueries({ queryKey: ['posts'] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài viết');
		},
	});

	const getStatusBadge = (status: string) => {
		const variants = {
			published: {
				variant: 'default' as const,
				color: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-200 border-0',
				text: 'Đã xuất bản',
				icon: '🟢',
			},
			draft: {
				variant: 'secondary' as const,
				color: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-200 border-0',
				text: 'Bản nháp',
				icon: '📝',
			},
			archived: {
				variant: 'outline' as const,
				color: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-red-200 border-0',
				text: 'Đã lưu trữ',
				icon: '📦',
			},
		};

		const config = variants[status as keyof typeof variants] || variants.draft;

		return (
			<Badge variant={config.variant} className={`${config.color} font-semibold px-3 py-1 text-xs tracking-wide`}>
				<span className='mr-1'>{config.icon}</span>
				{config.text}
			</Badge>
		);
	};

	const truncateText = (text: string, maxLength: number = 60) => {
		if (!text) return '';
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	};

	return (
		<div className='relative p-6'>
			<div className='relative z-10 space-y-8 w-full mx-auto'>
				{/* Enhanced Header */}
				<div className='flex items-center justify-between'>
					<div className='space-y-4'>
						<div className='flex items-center gap-4'>
							<div className='p-3 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg'>
								<Hash className='h-8 w-8 text-white' />
							</div>
							<div>
								<h1 className='text-5xl font-black leading-tight'>Quản lý bài viết</h1>
								<p className='text-slate-600 mt-2 text-lg font-medium'>
									Tạo, chỉnh sửa và quản lý bài viết diễn đàn với giao diện hiện đại
								</p>
							</div>
						</div>
					</div>
					<Button
						asChild
						className='bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 shadow-2xl hover:shadow-purple-300/50 transition-all duration-300 px-8 py-4 rounded-2xl text-base font-semibold border-0 transform hover:scale-105'
					>
						<Link href='/admin/posts/new'>
							<Plus className='mr-3 h-5 w-5' />
							<Sparkles className='mr-2 h-4 w-4' />
							Tạo bài viết mới
						</Link>
					</Button>
				</div>

				{/* Enhanced Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					<Card className='border-0 hover:shadow-blue-200/50 transition-all duration-300 transform hover:-translate-y-1 group'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-6'>
								<div className='p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl group-hover:shadow-blue-300/50 transition-all duration-300 transform group-hover:scale-110'>
									<Hash className='h-8 w-8 text-white' />
								</div>
								<div>
									<p className='text-sm font-bold text-slate-600 uppercase tracking-widest mb-1'>
										Tổng bài viết
									</p>
									<p className='text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent'>
										{postsData?.pagination.total || 0}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='border-0 hover:shadow-green-200/50 transition-all duration-300 transform hover:-translate-y-1 group'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-6'>
								<div className='p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl group-hover:shadow-green-300/50 transition-all duration-300 transform group-hover:scale-110'>
									<TrendingUp className='h-8 w-8 text-white' />
								</div>
								<div>
									<p className='text-sm font-bold text-slate-600 uppercase tracking-widest mb-1'>
										Đã xuất bản
									</p>
									<p className='text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent'>
										{postsData?.data.filter((post: any) => post.status === 'published').length || 0}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='border-0 hover:shadow-amber-200/50 transition-all duration-300 transform hover:-translate-y-1 group'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-6'>
								<div className='p-4 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-xl group-hover:shadow-yellow-300/50 transition-all duration-300 transform group-hover:scale-110'>
									<Edit className='h-8 w-8 text-white' />
								</div>
								<div>
									<p className='text-sm font-bold text-slate-600 uppercase tracking-widest mb-1'>
										Bản nháp
									</p>
									<p className='text-4xl font-black bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent'>
										{postsData?.data.filter((post: any) => post.status === 'draft').length || 0}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='border-0 hover:shadow-purple-200/50 transition-all duration-300 transform hover:-translate-y-1 group'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-6'>
								<div className='p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl group-hover:shadow-purple-300/50 transition-all duration-300 transform group-hover:scale-110'>
									<BarChart3 className='h-8 w-8 text-white' />
								</div>
								<div>
									<p className='text-sm font-bold text-slate-600 uppercase tracking-widest mb-1'>
										Tổng lượt xem
									</p>
									<p className='text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent'>
										{postsData?.data.reduce(
											(sum: any, post: any) => sum + (post.viewCount || 0),
											0
										) || 0}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Enhanced Posts Table Card */}
				<Card className='border-0 shadow-none'>
					<CardHeader className='border-b-0 p-4'>
						<div className='flex items-center gap-6'>
							<div className='relative flex-1'>
								<Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400' />
								<Input
									placeholder='Tìm kiếm bài viết theo tiêu đề...'
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className='h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 rounded-2xl text-base font-medium bg-white/80 backdrop-blur-sm shadow-lg'
								/>
							</div>
							<Button
								variant='outline'
								className='h-14 px-8 border-2 border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 rounded-2xl font-semibold text-base shadow-lg transform hover:scale-105 transition-all duration-200'
							>
								<Filter className='mr-3 h-5 w-5' />
								Lọc bài viết
							</Button>
						</div>
					</CardHeader>

					<CardContent className='p-0 border-slate-200 border rounded-md'>
						{isLoading ? (
							<div className='flex justify-center py-24'>
								<div className='text-center'>
									<div className='relative'>
										<div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6 shadow-lg'></div>
										<div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-600/20 blur-xl'></div>
									</div>
									<p className='text-slate-600 text-xl font-semibold'>Đang tải bài viết...</p>
									<p className='text-slate-400 text-sm mt-2'>Vui lòng chờ trong giây lát</p>
								</div>
							</div>
						) : postsData?.data && postsData.data.length > 0 ? (
							<div className='overflow-x-auto'>
								<Table className='rounded-md'>
									<TableHeader className='bg-gradient-to-r from-slate-50 to-blue-50/50'>
										<TableRow className='hover:bg-slate-50/80 border-b-2 border-slate-100'>
											<TableHead className='font-bold text-slate-700 py-6 text-base'>
												Chi tiết bài viết
											</TableHead>
											<TableHead className='font-bold text-slate-700 text-base'>
												Tác giả
											</TableHead>
											<TableHead className='font-bold text-slate-700 text-base'>
												Danh mục
											</TableHead>
											<TableHead className='font-bold text-slate-700 text-base'>
												Trạng thái
											</TableHead>
											<TableHead className='font-bold text-slate-700 text-base'>
												Tương tác
											</TableHead>
											<TableHead className='font-bold text-slate-700 text-base'>
												Ngày tạo
											</TableHead>
											<TableHead className='text-end font-bold text-slate-700 text-base'>
												Thao tác
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{postsData.data.map((post: any) => (
											<TableRow
												key={post.id}
												className='hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 border-b border-slate-100 group'
											>
												<TableCell className='py-6 w-[30%]'>
													<div className='flex items-start gap-6'>
														{/* Enhanced Featured Image */}
														{post.featuredImage && (
															<div className='relative group-hover:scale-105 transition-transform duration-300'>
																<img
																	src={post.featuredImage}
																	alt={post.title}
																	className='size-28 object-cover rounded-2xl shadow-xl border-2 border-white'
																	onError={(e) => {
																		e.currentTarget.style.display = 'none';
																	}}
																/>
																{/* Enhanced Badge overlays */}
																<div className='absolute -top-3 -right-3 flex flex-col gap-2'>
																	{post.isFeatured && (
																		<div
																			className='w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-200 border-2 border-white transform hover:scale-110 transition-transform'
																			title='Bài viết nổi bật'
																		>
																			<Star className='w-4 h-4 text-white' />
																		</div>
																	)}
																	{post.isSticky && (
																		<div
																			className='w-8 h-8 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-xl shadow-red-200 border-2 border-white transform hover:scale-110 transition-transform'
																			title='Bài viết ghim'
																		>
																			<Pin className='w-4 h-4 text-white' />
																		</div>
																	)}
																</div>
															</div>
														)}

														{/* Enhanced Post Info */}
														<div className='flex-1 min-w-20'>
															<div className='font-bold text-slate-900 text-xl leading-tight mb-2 group-hover:text-blue-700 transition-colors'>
																{truncateText(post.title, 30)}
															</div>
															{post.excerpt && (
																<p className='text-slate-600 text-sm leading-relaxed font-medium'>
																	{truncateText(post.excerpt, 30)}
																</p>
															)}
														</div>
													</div>
												</TableCell>

												<TableCell>
													<div className='flex items-center gap-4'>
														{post.authorId?.avatar ? (
															<img
																src={post.authorId.avatar}
																alt={post.authorId.displayName}
																className='w-12 h-12 rounded-full object-cover shadow-lg border-3 border-white ring-2 ring-blue-100'
															/>
														) : (
															<div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg ring-2 ring-blue-100'>
																{post.authorId?.username?.charAt(0).toUpperCase() ||
																	'U'}
															</div>
														)}
														<div>
															<div className='font-bold text-slate-900 text-base'>
																{post.authorId?.displayName ||
																	post.authorId?.username ||
																	'Không rõ'}
															</div>
															<div className='text-sm text-slate-500 font-medium'>
																@{post.authorId?.username || 'unknown'}
															</div>
														</div>
													</div>
												</TableCell>

												<TableCell>
													<div className='flex items-center gap-3'>
														<div className='w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
															<Hash className='w-5 h-5 text-white' />
														</div>
														<div>
															<div className='font-bold text-slate-900 text-base'>
																{post.categoryId?.name || 'Chưa phân loại'}
															</div>
															<div className='text-sm text-slate-500 font-medium'>
																/{post.categoryId?.slug || 'uncategorized'}
															</div>
														</div>
													</div>
												</TableCell>

												<TableCell>{getStatusBadge(post.status)}</TableCell>

												<TableCell>
													<div className='space-y-2'>
														<div className='flex items-center gap-6 text-sm'>
															<div
																className='flex items-center gap-2 text-slate-600 font-semibold hover:text-blue-600 transition-colors'
																title='Lượt xem'
															>
																<div className='p-1 bg-blue-100 rounded-lg'>
																	<Eye className='w-4 h-4 text-blue-600' />
																</div>
																<span className='font-bold'>{post.viewCount || 0}</span>
															</div>
															{/* <div
																className='flex items-center gap-2 text-slate-600 font-semibold hover:text-red-500 transition-colors'
																title='Lượt thích'
															>
																<div className='p-1 bg-red-100 rounded-lg'>
																	<Heart className='w-4 h-4 text-red-500' />
																</div>
																<span className='font-bold'>{post.likeCount || 0}</span>
															</div> */}
															{/* <div
																className='flex items-center gap-2 text-slate-600 font-semibold hover:text-green-600 transition-colors'
																title='Bình luận'
															>
																<div className='p-1 bg-green-100 rounded-lg'>
																	<MessageCircle className='w-4 h-4 text-green-600' />
																</div>
																<span className='font-bold'>
																	{post.commentCount || 0}
																</span>
															</div> */}
														</div>
													</div>
												</TableCell>

												<TableCell>
													<div className='text-sm'>
														<div className='font-bold text-slate-900 text-base'>
															{format(new Date(post.createdAt), 'dd/MM/yyyy', {
																locale: vi,
															})}
														</div>
														<div className='text-slate-500 font-medium'>
															{formatDistanceToNow(new Date(post.createdAt), {
																addSuffix: true,
																locale: vi,
															})}
														</div>
													</div>
												</TableCell>

												<TableCell className='text-end'>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant='ghost'
																size='sm'
																className='h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-200'
															>
																<MoreHorizontal className='h-5 w-5' />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															align='end'
															className='w-52 rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-lg'
														>
															<DropdownMenuItem asChild>
																<Link
																	href={`/admin/posts/${post.slug}`}
																	className='flex items-center gap-3 cursor-pointer py-3 px-4 font-semibold hover:bg-blue-50 rounded-xl transition-colors'
																>
																	<Eye className='h-5 w-5 text-blue-600' />
																	Xem bài viết
																</Link>
															</DropdownMenuItem>
															<DropdownMenuItem asChild>
																<Link
																	href={`/admin/posts/${post.slug}/edit`}
																	className='flex items-center gap-3 cursor-pointer py-3 px-4 font-semibold hover:bg-amber-50 rounded-xl transition-colors'
																>
																	<Edit className='h-5 w-5 text-amber-600' />
																	Chỉnh sửa
																</Link>
															</DropdownMenuItem>
															<DropdownMenuItem
																onSelect={(e) => {
																	e.preventDefault();
																	openDeleteDialog(post.id);
																}}
																disabled={deletePostMutation.isPending}
																className='text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer py-3 px-4 font-semibold rounded-xl transition-colors'
															>
																<Trash2 className='mr-3 h-5 w-5' />
																Xóa bài viết
															</DropdownMenuItem>

															<AlertDialog
																open={deleteDialogOpen}
																onOpenChange={setDeleteDialogOpen}
															>
																<AlertDialogContent className='max-w-md'>
																	<AlertDialogHeader>
																		<AlertDialogTitle className='flex items-center gap-2 text-red-600'>
																			<Trash2 className='h-5 w-5' />
																			Xác nhận xóa bài viết
																		</AlertDialogTitle>
																		<AlertDialogDescription className='text-slate-600'>
																			Bạn có chắc chắn muốn xóa bài viết này
																			không? Hành động này không thể hoàn tác.
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter className='gap-2'>
																		<AlertDialogCancel
																			onClick={cancelDelete}
																			className='hover:bg-slate-100'
																		>
																			Hủy
																		</AlertDialogCancel>
																		<AlertDialogAction
																			onClick={confirmDelete}
																			disabled={deletePostMutation.isPending}
																			className='bg-red-600 hover:bg-red-700 text-white'
																		>
																			{deletePostMutation.isPending ? (
																				<>
																					<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																					Đang xóa...
																				</>
																			) : (
																				<>
																					<Trash2 className='mr-2 h-4 w-4' />
																					Xóa bài viết
																				</>
																			)}
																		</AlertDialogAction>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						) : (
							<div className='flex justify-center py-24'>
								<div className='text-center'>
									<div className='w-24 h-24 bg-gradient-to-br from-slate-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl'>
										<Hash className='w-12 h-12 text-slate-400' />
									</div>
									<p className='text-slate-600 text-2xl font-bold mb-3'>Chưa có bài viết nào</p>
									<p className='text-slate-400 text-base font-medium'>
										Tạo bài viết đầu tiên để bắt đầu hành trình của bạn
									</p>
								</div>
							</div>
						)}

						{/* Enhanced Pagination */}
						{postsData?.pagination && postsData.pagination.total > 0 && (
							<div className='flex items-center justify-between px-8 py-6 border-t-2 border-slate-100 bg-gradient-to-r from-slate-50/80 to-blue-50/50 backdrop-blur-sm rounded-md'>
								<div className='text-base text-slate-600 font-semibold'>
									Hiển thị{' '}
									<span className='font-black text-blue-600'>
										{(postsData.pagination.page - 1) * postsData.pagination.limit + 1}
									</span>{' '}
									đến{' '}
									<span className='font-black text-blue-600'>
										{Math.min(
											postsData.pagination.page * postsData.pagination.limit,
											postsData.pagination.total
										)}
									</span>{' '}
									trong tổng{' '}
									<span className='font-black text-blue-600'>{postsData.pagination.total}</span> bài
									viết
								</div>
								<div className='flex gap-3'>
									<Button
										variant='outline'
										size='sm'
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page <= 1}
										className='hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl px-6 py-2 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200'
									>
										Trang trước
									</Button>

									{/* Enhanced Page Numbers */}
									<div className='flex gap-2'>
										{Array.from({ length: Math.min(5, postsData.pagination.pages) }, (_, i) => {
											const pageNum = i + 1;
											return (
												<Button
													key={pageNum}
													variant={page === pageNum ? 'default' : 'outline'}
													size='sm'
													onClick={() => setPage(pageNum)}
													className={
														page === pageNum
															? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl shadow-blue-200 border-0 rounded-xl px-4 py-2 font-bold transform scale-110'
															: 'hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl px-4 py-2 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200'
													}
												>
													{pageNum}
												</Button>
											);
										})}
									</div>

									<Button
										variant='outline'
										size='sm'
										onClick={() => setPage((p) => p + 1)}
										disabled={page >= postsData.pagination.pages}
										className='hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl px-6 py-2 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200'
									>
										Trang sau
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
