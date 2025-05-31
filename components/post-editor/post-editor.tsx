'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Import all the components
import { createPost, updatePost, uploadPostImage, preparePostData } from '@/services/posts-service';
import { getCategories } from '@/services/categories-service';
import { getTags } from '@/services/tags-service';
import { PostEditorProps, PostFormData, postSchema } from '@/components/post-editor/types/postTypes';
import { PostPreview } from '@/components/post-editor/components/PostPreview';
import { PostContentSection } from '@/components/post-editor/components/PostContentSection';
import { PublishSettingsSection } from '@/components/post-editor/components/PublishSettingsSection';
import { FeaturedImageSection } from '@/components/post-editor/components/FeaturedImageSection';
import { CategorySection } from '@/components/post-editor/components/CategorySection';
import { TagsSection } from '@/components/post-editor/components/TagsSection';
import { RelatedProductsSection } from '@/components/post-editor/components/RelatedProductsSection';
import { SEOSection } from '@/components/post-editor/components/SEOSection';
import { useRouter } from 'next/navigation';

export function PostEditor({ post, onSave, onCancel, isUpdating }: PostEditorProps) {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [previewMode, setPreviewMode] = useState(false);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const router = useRouter();

	// Determine if this is an edit or create operation
	const isEditMode = !!post?.id;

	// API Queries
	const { data: categoriesData } = useQuery({
		queryKey: ['categories'],
		queryFn: () => getCategories({ limit: 100 }),
	});

	const { data: tagsData } = useQuery({
		queryKey: ['tags'],
		queryFn: () => getTags({ limit: 100 }),
	});

	// API Mutations
	const createPostMutation = useMutation({
		mutationFn: createPost,
		onSuccess: (data) => {
			toast.success(data.message || 'Tạo bài viết thành công!');
			onSave?.(data.data);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Tạo bài viết thất bại');
		},
	});

	const updatePostMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) => updatePost(id, data),
		onSuccess: (data) => {
			toast.success(data.message || 'Cập nhật bài viết thành công!');
			onSave?.(data.data);
			router.push('/admin/posts');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Cập nhật bài viết thất bại');
		},
	});

	const uploadImageMutation = useMutation({
		mutationFn: uploadPostImage,
		onSuccess: (data) => {
			toast.success(data.message || 'Tải ảnh lên thành công!');
			if (data.url) {
				setValue('featuredImage', data.url);
			} else {
				toast.error('Không nhận được URL hình ảnh');
			}
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Tải ảnh lên thất bại');
		},
	});

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		getValues,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<PostFormData>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			title: '',
			excerpt: '',
			content: '',
			featuredImage: '',
			categoryId: '',
			tagIds: [],
			relatedProducts: [],
			status: 'draft',
			isFeatured: false,
			isSticky: false,
			seoTitle: '',
			seoDescription: '',
			seoKeywords: [],
		},
	});

	// Reset form when post data changes (for edit mode)
	useEffect(() => {
		if (post) {
			// Extract categoryId properly
			let categoryId = '';
			if (post.categoryId) {
				if (typeof post.categoryId === 'string') {
					categoryId = post.categoryId;
				} else if (typeof post.categoryId === 'object' && post.categoryId.id) {
					categoryId = post.categoryId.id;
				}
			}

			// Extract tagIds properly
			let tagIds: string[] = [];
			if (post.tagIds && Array.isArray(post.tagIds)) {
				tagIds = post.tagIds.map((tag: any) => (typeof tag === 'string' ? tag : tag.id || tag._id));
			}

			const formData = {
				title: post.title || '',
				excerpt: post.excerpt || '',
				content: post.content || '',
				featuredImage: post.featuredImage || '',
				categoryId: categoryId,
				tagIds: tagIds,
				relatedProducts: post.relatedProducts || [],
				status: post.status || 'draft', // Ensure status is set properly
				isFeatured: post.isFeatured || false,
				isSticky: post.isSticky || false,
				seoTitle: post.seoTitle || '',
				seoDescription: post.seoDescription || '',
				seoKeywords: post.seoKeywords || [],
			};

			console.log('Setting form data:', formData); // Debug log
			reset(formData);

			// Set selected tags for the TagsSection component
			setSelectedTags(tagIds);
		}
	}, [post, reset]);

	const onSubmit: SubmitHandler<PostFormData> = async (data: PostFormData) => {
		try {
			// Prepare payload with current selected tags and auto-set publishedAt for published posts
			const rawPayload = {
				...data,
				tagIds: selectedTags.length > 0 ? selectedTags : undefined,
				// Auto-set publishedAt only when status is 'published' and not already set
				publishedAt:
					data.status === 'published' && !post?.publishedAt
						? new Date().toISOString()
						: data.status === 'published'
						? post?.publishedAt
						: undefined,
			};

			// Clean the data according to API requirements
			const payload: any = preparePostData(rawPayload);

			if (isEditMode && post?.id) {
				// Update existing post
				updatePostMutation.mutate({ id: post.id, data: payload });
			} else {
				// Create new post
				createPostMutation.mutate(payload);
			}
		} catch (error) {
			console.error('Error saving post:', error);
			toast.error('Có lỗi xảy ra khi lưu bài viết');
		}
	};

	const handleTagToggle = (tagId: string) => {
		setSelectedTags((prev) => {
			const newTags = prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId];
			setValue('tagIds', newTags);
			return newTags;
		});
	};

	const watchedContent = watch('content');
	const watchedTitle = watch('title');
	const watchedCategoryId = watch('categoryId'); // Debug watch
	const watchedStatus = watch('status'); // Debug status

	// Debug log
	useEffect(() => {
		if (isEditMode) {
			console.log('=== DEBUGGING CATEGORY & STATUS ===');
			console.log('Current categoryId in form:', watchedCategoryId);
			console.log('Current status in form:', watchedStatus);
			console.log('Post categoryId:', post?.categoryId);
			console.log('Post status:', post?.status);
			console.log(
				'Categories available:',
				categoriesData?.data?.map((c) => ({ id: c.id, name: c.name }))
			);
			console.log(
				'Is categoryId in categories?',
				categoriesData?.data?.some((c) => c.id === watchedCategoryId)
			);
		}
	}, [watchedCategoryId, watchedStatus, post?.categoryId, post?.status, categoriesData, isEditMode]);

	// Determine loading state
	const isSaving = createPostMutation.isPending || updatePostMutation.isPending;

	return (
		<div className='w-full mx-auto relative'>
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>{isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>
				<div className='flex items-center space-x-2'>
					<Button type='button' variant='outline' onClick={() => setPreviewMode(!previewMode)}>
						<Eye className='mr-2 h-4 w-4' />
						{previewMode ? 'Chỉnh sửa' : 'Xem trước'}
					</Button>
					<Button type='button' variant='outline' onClick={onCancel}>
						Hủy
					</Button>
				</div>
			</div>

			{previewMode ? (
				<PostPreview title={watchedTitle} content={watchedContent} />
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						{/* Main Content */}
						<div className='lg:col-span-2 space-y-6'>
							<PostContentSection control={control} errors={errors} isFullScreen={isFullScreen} />
							<RelatedProductsSection getValues={getValues} setValue={setValue} watch={watch} />
						</div>

						{/* Sidebar */}
						<div className='space-y-6'>
							<PublishSettingsSection
								control={control}
								post={post}
								isSubmitting={isSubmitting || isSaving}
								isUpdating={isUpdating}
								isPending={isSaving}
								isEditMode={isEditMode}
							/>

							<FeaturedImageSection
								watch={watch}
								setValue={setValue}
								uploadImageMutation={uploadImageMutation}
							/>

							<CategorySection control={control} errors={errors} categoriesData={categoriesData} />

							<TagsSection
								selectedTags={selectedTags}
								onTagToggle={handleTagToggle}
								tagsData={tagsData}
							/>

							<SEOSection control={control} getValues={getValues} setValue={setValue} watch={watch} />
						</div>
					</div>
				</form>
			)}
		</div>
	);
}
