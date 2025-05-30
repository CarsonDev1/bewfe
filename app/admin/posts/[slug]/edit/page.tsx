'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostBySlug, updatePost } from '@/services/posts-service';
import { PostEditor } from '@/components/post-editor';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hash, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Post {
	id: string;
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	featuredImage?: string;
	categoryId?: any;
	tagIds?: string[];
	status: 'draft' | 'published' | 'archived';
	isFeatured: boolean;
	isSticky: boolean;
	publishedAt?: string;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
	createdAt: string;
	updatedAt: string;
	authorId?: any;
}

export default function EditPostPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const slug = params?.slug as string;

	// Fetch post data by slug
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
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: (failureCount, error: any) => {
			if (error?.response?.status === 404) return false;
			return failureCount < 3;
		},
	});

	// Update post mutation
	const updatePostMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) => updatePost(id, data),
		onSuccess: (updatedPost) => {
			toast.success('Cập nhật bài viết thành công!');

			// Update cache
			queryClient.invalidateQueries({ queryKey: ['posts'] });
			queryClient.setQueryData(['post', slug], updatedPost);

			// Navigate back to posts list
			router.push('/admin/posts');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Cập nhật bài viết thất bại');
		},
	});

	const post = postResponse;

	// Handle save with update
	const handleSave = async (updatedPostData: any) => {
		if (!post?.id) {
			toast.error('Không tìm thấy ID bài viết');
			return;
		}

		try {
			// Prepare update data - only include changed fields
			const updateData = {
				title: updatedPostData.title,
				excerpt: updatedPostData.excerpt || undefined,
				content: updatedPostData.content,
				featuredImage: updatedPostData.featuredImage || undefined,
				categoryId: updatedPostData.categoryId,
				tagIds:
					updatedPostData.tagIds && updatedPostData.tagIds.length > 0 ? updatedPostData.tagIds : undefined,
				status: updatedPostData.status || 'draft',
				isFeatured: updatedPostData.isFeatured || false,
				isSticky: updatedPostData.isSticky || false,
				publishedAt:
					updatedPostData.status === 'published' && !updatedPostData.publishedAt
						? new Date().toISOString()
						: updatedPostData.publishedAt || undefined,
				seoTitle: updatedPostData.seoTitle || undefined,
				seoDescription: updatedPostData.seoDescription || undefined,
				seoKeywords:
					updatedPostData.seoKeywords && updatedPostData.seoKeywords.length > 0
						? updatedPostData.seoKeywords
						: undefined,
			};

			await updatePostMutation.mutateAsync({ id: post.id, data: updateData });
		} catch (error) {
			console.error('Error updating post:', error);
		}
	};

	const handleCancel = () => {
		router.push('/admin/posts');
	};

	// Loading state
	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/80'>
				<div className='max-w-7xl mx-auto p-6'>
					{/* Back button */}
					<div className='mb-8'>
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
				<div className='max-w-7xl mx-auto p-6'>
					{/* Back button */}
					<div className='mb-8'>
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
										? 'Bài viết bạn muốn chỉnh sửa không tồn tại hoặc đã bị xóa.'
										: 'Không thể tải bài viết. Vui lòng thử lại sau.'}
								</p>
								<div className='flex gap-3 justify-center'>
									<Button
										onClick={() => refetch()}
										className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
									>
										<Loader2 className='mr-2 h-4 w-4' />
										Thử lại
									</Button>
									<Button variant='outline' asChild>
										<Link href='/admin/posts'>
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

	// Enhanced PostEditor wrapper with update functionality
	const EnhancedPostEditor = () => {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/80 relative overflow-hidden'>
				{/* Background Elements */}
				<div className='absolute inset-0 overflow-hidden pointer-events-none'>
					<div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl'></div>
					<div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-rose-600/20 rounded-full blur-3xl'></div>
				</div>

				<div className='relative z-10 max-w-7xl mx-auto p-6'>
					{/* Enhanced Header */}
					<div className='mb-8'>
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

						<div className='flex items-center gap-4 mb-6'>
							<div className='p-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl shadow-lg'>
								<Hash className='h-8 w-8 text-white' />
							</div>
							<div>
								<h1 className='text-4xl font-black bg-gradient-to-r from-slate-800 via-amber-800 to-orange-800 bg-clip-text text-transparent leading-tight'>
									Chỉnh sửa bài viết
								</h1>
								<p className='text-slate-600 mt-2 text-lg font-medium'>
									Cập nhật nội dung và thông tin bài viết của bạn
								</p>
							</div>
						</div>

						{/* Post Info Card */}
						<Card className='border-0 shadow-lg bg-white/70 backdrop-blur-sm mb-6'>
							<CardContent className='p-6'>
								<div className='flex items-start gap-6'>
									{post.featuredImage && (
										<img
											src={post.featuredImage}
											alt={post.title}
											className='w-20 h-20 object-cover rounded-xl shadow-md'
										/>
									)}
									<div className='flex-1'>
										<h3 className='text-xl font-bold text-slate-900 mb-2'>{post.title}</h3>
										<div className='flex items-center gap-4 text-sm text-slate-600'>
											<span className='flex items-center gap-1'>
												📝 <strong>Slug:</strong> {post.slug}
											</span>
											<span className='flex items-center gap-1'>
												📅 <strong>Tạo:</strong>{' '}
												{new Date(post.createdAt).toLocaleDateString('vi-VN')}
											</span>
											<span className='flex items-center gap-1'>
												🔄 <strong>Cập nhật:</strong>{' '}
												{new Date(post.updatedAt).toLocaleDateString('vi-VN')}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* PostEditor with loading overlay */}
					<div className='relative'>
						{updatePostMutation.isPending && (
							<div className='absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg'>
								<div className='text-center'>
									<div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4'></div>
									<p className='text-slate-600 font-semibold'>Đang cập nhật bài viết...</p>
								</div>
							</div>
						)}

						<PostEditor
							post={post}
							onSave={handleSave}
							onCancel={handleCancel}
							isUpdating={updatePostMutation.isPending}
						/>
					</div>
				</div>
			</div>
		);
	};

	return <EnhancedPostEditor />;
}
