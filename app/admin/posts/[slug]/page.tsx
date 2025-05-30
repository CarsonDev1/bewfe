'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Eye, Heart, MessageCircle, Share2, Star, Pin, Hash, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { getPostBySlug } from '@/services/posts-service';
import Image from 'next/image';

const PostDetail = () => {
	const params = useParams();
	const slug = params?.slug as string;

	const {
		data: postResponse,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ['post', slug],
		queryFn: () => getPostBySlug(slug),
		enabled: !!slug,
		staleTime: 5 * 60 * 1000,
		retry: (failureCount, error: any) => {
			if (error?.response?.status === 404) return false;
			return failureCount < 3;
		},
	});

	const post = postResponse;

	// Loading state
	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/80'>
				<div className='max-w-4xl mx-auto p-6'>
					<div className='flex justify-center items-center py-24'>
						<div className='text-center'>
							<div className='relative'>
								<div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6 shadow-lg'></div>
								<div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-600/20 blur-xl'></div>
							</div>
							<p className='text-slate-600 text-xl font-semibold'>Đang tải bài viết...</p>
							<p className='text-slate-400 text-sm mt-2'>Vui lòng chờ trong giây lát</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/80'>
				<div className='max-w-4xl mx-auto p-6'>
					<div className='flex justify-center items-center py-24'>
						<Card className='max-w-md w-full border-0 shadow-2xl bg-white/80 backdrop-blur-lg rounded-3xl'>
							<CardContent className='p-8 text-center'>
								<div className='w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6'>
									<Hash className='w-8 h-8 text-red-500' />
								</div>
								<h2 className='text-2xl font-bold text-slate-900 mb-3'>
									{(error as any)?.response?.status === 404
										? 'Bài viết không tồn tại'
										: 'Có lỗi xảy ra'}
								</h2>
								<p className='text-slate-600 mb-6'>
									{(error as any)?.response?.status === 404
										? 'Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'
										: 'Không thể tải bài viết. Vui lòng thử lại sau.'}
								</p>
								<div className='flex gap-3 justify-center'>
									<Button
										onClick={() => refetch()}
										className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
									>
										Thử lại
									</Button>
									<Button variant='outline' asChild>
										<Link href='/posts'>
											<ArrowLeft className='mr-2 h-4 w-4' />
											Quay lại
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	if (!post) {
		return null;
	}

	const getStatusBadge = (status: string) => {
		const variants = {
			published: {
				color: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-200 border-0',
				text: 'Đã xuất bản',
				icon: '🟢',
			},
			draft: {
				color: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-200 border-0',
				text: 'Bản nháp',
				icon: '📝',
			},
			archived: {
				color: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-red-200 border-0',
				text: 'Đã lưu trữ',
				icon: '📦',
			},
		};

		const config = variants[status as keyof typeof variants] || variants.draft;

		return (
			<Badge className={`${config.color} font-semibold px-4 py-2 text-sm tracking-wide`}>
				<span className='mr-2'>{config.icon}</span>
				{config.text}
			</Badge>
		);
	};

	return (
		<div>
			{/* Background Elements */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl'></div>
				<div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-rose-600/20 rounded-full blur-3xl'></div>
			</div>

			<div className='relative z-10 mx-auto p-6'>
				{/* Header Navigation */}
				<div className='mb-2'>
					<Button
						variant='outline'
						asChild
						className='mb-6 shadow-lg hover:shadow-xl transition-all duration-200'
					>
						<Link href='/admin/posts'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Quay lại danh sách
						</Link>
					</Button>
				</div>

				{post.featuredImage && (
					<div className='relative max-w-7xl mx-auto h-64 md:h-full rounded-md'>
						<img
							src={post.featuredImage}
							alt={post.title}
							className='w-full h-full object-cover rounded-xl'
						/>
						<div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl'></div>

						{/* Badges overlay */}
						<div className='absolute top-6 right-6 flex gap-3'>
							{post.isFeatured && (
								<div className='bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-3 shadow-xl'>
									<Star className='w-5 h-5 text-white' />
								</div>
							)}
							{post.isSticky && (
								<div className='bg-gradient-to-br from-red-400 to-rose-500 rounded-full p-3 shadow-xl'>
									<Pin className='w-5 h-5 text-white' />
								</div>
							)}
						</div>
					</div>
				)}

				{/* Main Content */}
				<Card className='border-0 max-w-5xl mx-auto -mt-32 shadow-2xl bg-white/80 backdrop-blur-lg rounded-3xl overflow-hidden'>
					<CardContent className='p-8 md:p-12'>
						{/* Post Meta */}
						<div className='flex flex-wrap items-center gap-4 mb-6'>
							{getStatusBadge(post.status)}

							{post.categoryId && (
								<div className='flex items-center gap-2'>
									<div className='w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center'>
										<Hash className='w-3 h-3 text-white' />
									</div>
									<span className='text-sm font-semibold text-slate-600'>
										{typeof post.categoryId === 'object' ? post.categoryId.name : post.categoryId}
									</span>
								</div>
							)}
						</div>

						{/* Title */}
						<h1 className='text-3xl md:text-4xl font-black leading-tight mb-6'>{post.title}</h1>

						{/* Excerpt */}
						{post.excerpt && (
							<p className='text-xl text-slate-600 font-medium leading-relaxed mb-8 border-l-4 border-blue-500 pl-6 bg-blue-50/50 py-4 rounded-r-xl'>
								{post.excerpt}
							</p>
						)}

						{/* Post Meta Info */}
						<div className='flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-slate-200'>
							{/* Author */}
							{post.authorId && (
								<div className='flex items-center gap-3'>
									{post.authorId.avatar ? (
										<Image src={post.authorId.avatar} width={40} height={40} alt='avatar' />
									) : (
										<div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
											<User className='w-5 h-5 text-white' />
										</div>
									)}

									<div>
										<p className='font-semibold text-slate-900'>
											{typeof post.authorId === 'object'
												? post.authorId.displayName || post.authorId.username
												: 'Tác giả'}
										</p>
										<p className='text-sm text-slate-500'>Tác giả</p>
									</div>
								</div>
							)}

							{/* Date */}
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center'>
									<Calendar className='w-5 h-5 text-white' />
								</div>
								<div>
									<p className='font-semibold text-slate-900'>
										{format(new Date(post.createdAt), 'dd/MM/yyyy', { locale: vi })}
									</p>
									<p className='text-sm text-slate-500'>
										{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
									</p>
								</div>
							</div>

							{/* Stats */}
							<div className='flex items-center gap-6 ml-auto'>
								<div className='flex items-center gap-2 text-slate-600'>
									<Eye className='w-5 h-5' />
									<span className='font-semibold'>{(post as any).viewCount || 0}</span>
								</div>
								<div className='flex items-center gap-2 text-slate-600'>
									<Heart className='w-5 h-5' />
									<span className='font-semibold'>{(post as any).likeCount || 0}</span>
								</div>
								<div className='flex items-center gap-2 text-slate-600'>
									<MessageCircle className='w-5 h-5' />
									<span className='font-semibold'>{(post as any).commentCount || 0}</span>
								</div>
							</div>
						</div>

						{/* Content */}
						<div
							className='prose prose-lg max-w-none prose-headings:bg-gradient-to-r prose-headings:from-slate-800 prose-headings:to-blue-800 prose-headings:bg-clip-text prose-headings:text-transparent prose-a:text-blue-600 prose-a:font-semibold hover:prose-a:text-blue-700'
							dangerouslySetInnerHTML={{ __html: post.content }}
						/>

						{/* Tags */}
						{post.tagIds && post.tagIds.length > 0 && (
							<div className='mt-12 pt-8 border-t border-slate-200'>
								<h3 className='text-lg font-bold text-slate-900 mb-4'>Tags</h3>
								<div className='flex flex-wrap gap-3'>
									{post.tagIds.map((tag, index) => (
										<Badge
											key={index}
											variant='outline'
											className='px-4 py-2 font-medium hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer'
										>
											#{typeof tag === 'object' ? (tag as any).name : tag}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className='mt-12 pt-8 border-t border-slate-200 flex justify-between items-center'>
							<div className='flex gap-3'>
								<Button className='bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'>
									<Heart className='mr-2 h-4 w-4' />
									Thích bài viết
								</Button>
								<Button variant='outline'>
									<Share2 className='mr-2 h-4 w-4' />
									Chia sẻ
								</Button>
							</div>

							{/* SEO Info (if available) */}
							{(post.seoTitle || post.seoDescription) && (
								<div className='text-right'>
									<p className='text-sm text-slate-500'>SEO được tối ưu</p>
									<p className='text-xs text-slate-400'>
										{post.seoKeywords?.length ? `${post.seoKeywords.length} từ khóa` : ''}
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default PostDetail;
