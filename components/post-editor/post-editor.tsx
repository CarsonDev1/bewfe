'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Import all the components
import { PostContentSection } from './components/PostContentSection';
import { PublishSettingsSection } from './components/PublishSettingsSection';
import { FeaturedImageSection } from './components/FeaturedImageSection';
import { CategorySection } from './components/CategorySection';
import { TagsSection } from './components/TagsSection';
import { SEOSection } from './components/SEOSection';
import { PostPreview } from './components/PostPreview';

// Import types and services
import { postSchema, PostFormData, Post, PostEditorProps } from './types/postTypes';
import { createPost, uploadPostImage } from '@/services/posts-service';
import { getCategories } from '@/services/categories-service';
import { getTags } from '@/services/tags-service';

export function PostEditor({ post, onSave, onCancel, isUpdating }: PostEditorProps) {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [previewMode, setPreviewMode] = useState(false);
	const [isFullScreen, setIsFullScreen] = useState(false);

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
	} = useForm<PostFormData>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			title: post?.title || '',
			excerpt: post?.excerpt || '',
			content: post?.content || '',
			featuredImage: post?.featuredImage || '',
			categoryId: post?.categoryId?.id,
			tagIds: post?.tagIds || [],
			status: post?.status || 'draft',
			isFeatured: post?.isFeatured || false,
			isSticky: post?.isSticky || false,
			publishedAt: post?.publishedAt || '',
			seoTitle: post?.seoTitle || '',
			seoDescription: post?.seoDescription || '',
			seoKeywords: post?.seoKeywords || [],
		},
	});

	useEffect(() => {
		if (post?.tagIds) {
			const tagIds = post.tagIds.map((tag: any) => (typeof tag === 'string' ? tag : tag.id));
			setSelectedTags(tagIds);
			setValue('tagIds', tagIds);
		}
	}, [post, setValue]);

	const onSubmit = async (data: PostFormData) => {
		try {
			const payload: any = {
				title: data.title,
				excerpt: data.excerpt || undefined,
				content: data.content,
				featuredImage: data.featuredImage || undefined,
				categoryId: data.categoryId,
				tagIds: selectedTags.length > 0 ? selectedTags : undefined,
				status: data.status || 'draft',
				isFeatured: data.isFeatured || false,
				isSticky: data.isSticky || false,
				publishedAt:
					data.status === 'published' && !data.publishedAt
						? new Date().toISOString()
						: data.publishedAt || undefined,
				seoTitle: data.seoTitle || undefined,
				seoDescription: data.seoDescription || undefined,
				seoKeywords: data.seoKeywords && data.seoKeywords.length > 0 ? data.seoKeywords : undefined,
			};

			if (post && onSave) {
				onSave(payload);
			} else {
				createPostMutation.mutate(payload);
			}
		} catch (error) {
			console.error('Error saving post:', error);
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

	return (
		<div className='w-full mx-auto relative'>
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>{post ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>
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
						</div>

						{/* Sidebar */}
						<div className='space-y-6'>
							<PublishSettingsSection
								control={control}
								post={post}
								isSubmitting={isSubmitting}
								isUpdating={isUpdating}
								isPending={createPostMutation.isPending}
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
