'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Save, Eye, Loader2, Expand, Minimize } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPost, uploadPostImage, CreatePostRequest } from '@/services/posts-service';
import { getCategories } from '@/services/categories-service';
import { getTags } from '@/services/tags-service';

// Remove the unused dynamic import
// const TinyMCEEditor = dynamic(() => import('@tinymce/tinymce-react'), {
// 	ssr: false,
// 	loading: () => (
// 		<div className="h-96 bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
// 			<Loader2 className="h-8 w-8 animate-spin" />
// 		</div>
// 	),
// });

// TinyMCE Wrapper Component
const EditorWrapper = ({ value, onChange, isFullScreen, uploadImage }: any) => {
	const [mounted, setMounted] = useState(false);
	const [Editor, setEditor] = useState<any>(null);
	const editorRef = useRef<any>(null);

	useEffect(() => {
		// Load TinyMCE dynamically
		const loadEditor = async () => {
			try {
				const tinymce = await import('@tinymce/tinymce-react');
				setEditor(() => tinymce.Editor);
				setMounted(true);
			} catch (error) {
				console.error('Failed to load TinyMCE:', error);
				setMounted(true);
			}
		};

		loadEditor();
	}, []);

	if (!mounted) {
		return (
			<div className='h-96 bg-gray-100 animate-pulse rounded-md flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	if (!Editor) {
		// Fallback to textarea if TinyMCE fails to load
		return (
			<Textarea
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
				className='min-h-96'
				placeholder='Nhập nội dung bài viết...'
			/>
		);
	}

	const editorConfig = {
		height: isFullScreen ? '80vh' : 500,
		menubar: true,
		plugins: [
			// Core editing features
			'anchor',
			'autolink',
			'charmap',
			'codesample',
			'emoticons',
			'image',
			'link',
			'lists',
			'media',
			'searchreplace',
			'table',
			'visualblocks',
			'wordcount',
			// Premium features (nếu có account premium)
			'checklist',
			'mediaembed',
			'casechange',
			'formatpainter',
			'pageembed',
			'powerpaste',
			'advtable',
			'advcode',
			'editimage',
			'advtemplate',
			'mentions',
			'tableofcontents',
			'footnotes',
			'autocorrect',
			'typography',
			'inlinecss',
			'markdown',
			'importword',
			'exportword',
			'exportpdf',
			// Additional useful plugins
			'fullscreen',
			'preview',
			'code',
			'help',
			'insertdatetime',
			'nonbreaking',
			'pagebreak',
			'paste',
			'tabfocus',
			'template',
			'textpattern',
			'hr',
		],
		toolbar: [
			'undo redo | fullscreen preview | blocks fontfamily fontsize',
			'bold italic underline strikethrough | forecolor backcolor | align lineheight',
			'checklist numlist bullist indent outdent | link image media table',
			'codesample blockquote hr pagebreak | emoticons charmap | searchreplace',
			'formatpainter removeformat | code wordcount | help',
		].join(' | '),

		// Cấu hình nâng cao
		skin: 'oxide',
		content_css: 'default',
		content_style: `
			body { 
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
				font-size: 14px; 
				line-height: 1.6; 
				color: #333;
				max-width: none;
			}
			h1, h2, h3, h4, h5, h6 { 
				color: #2d3748; 
				margin-top: 1.5em; 
				margin-bottom: 0.5em; 
				font-weight: 600;
			}
			h1 { font-size: 2.25em; }
			h2 { font-size: 1.875em; }
			h3 { font-size: 1.5em; }
			h4 { font-size: 1.25em; }
			h5 { font-size: 1.125em; }
			h6 { font-size: 1em; }
			p { margin-bottom: 1em; }
			a { color: #3182ce; text-decoration: none; }
			a:hover { text-decoration: underline; }
			blockquote { 
				border-left: 4px solid #e2e8f0; 
				margin: 1.5em 0; 
				padding-left: 1.5em; 
				color: #718096; 
				font-style: italic;
			}
			code { 
				background: #f7fafc; 
				padding: 0.25em 0.5em; 
				border-radius: 4px; 
				font-size: 0.875em; 
				font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
			}
			pre { 
				background: #1a202c; 
				color: #e2e8f0;
				padding: 1.5em; 
				border-radius: 8px; 
				overflow-x: auto;
				font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
				line-height: 1.5;
			}
			table { 
				border-collapse: collapse; 
				width: 100%; 
				margin: 1.5em 0; 
				border: 1px solid #e2e8f0;
			}
			th, td { 
				border: 1px solid #e2e8f0; 
				padding: 12px; 
				text-align: left; 
			}
			th { 
				background: #f7fafc; 
				font-weight: 600; 
			}
			img {
				max-width: 100%;
				height: auto;
				border-radius: 8px;
				box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
			}
			ul, ol {
				padding-left: 2em;
				margin: 1em 0;
			}
			li {
				margin-bottom: 0.5em;
			}
		`,

		// Font configuration
		font_family_formats: [
			'Arial=arial,helvetica,sans-serif',
			'Times New Roman=times new roman,times,serif',
			'Georgia=georgia,serif',
			'Verdana=verdana,sans-serif',
			'Courier New=courier new,courier,monospace',
			'Tahoma=tahoma,sans-serif',
			'Trebuchet MS=trebuchet ms,sans-serif',
			'Impact=impact,sans-serif',
		].join('; '),

		font_size_formats: '8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 32px 36px 48px 72px',

		// Image configuration
		image_advtab: true,
		image_uploadtab: true,
		file_picker_types: 'image',
		automatic_uploads: true,
		paste_data_images: true,

		// Image upload handler
		images_upload_handler: async (blobInfo: any) => {
			return new Promise((resolve, reject) => {
				const file = blobInfo.blob();
				uploadImage(file)
					.then((response: any) => {
						if (response.url) {
							resolve(response.url);
						} else {
							reject('Không thể tải ảnh lên');
						}
					})
					.catch((error: any) => {
						reject('Lỗi tải ảnh: ' + error.message);
					});
			});
		},

		// Paste configuration
		paste_as_text: false,
		paste_auto_cleanup_on_paste: true,
		paste_remove_styles_if_webkit: false,
		paste_merge_formats: true,
		smart_paste: true,

		// Table configuration
		table_default_attributes: {
			border: '1',
		},
		table_default_styles: {
			'border-collapse': 'collapse',
			width: '100%',
		},
		table_responsive_width: true,

		// Link configuration
		link_default_protocol: 'https',
		link_assume_external_targets: true,
		link_context_toolbar: true,

		// Code configuration
		codesample_languages: [
			{ text: 'HTML/XML', value: 'markup' },
			{ text: 'JavaScript', value: 'javascript' },
			{ text: 'CSS', value: 'css' },
			{ text: 'PHP', value: 'php' },
			{ text: 'Ruby', value: 'ruby' },
			{ text: 'Python', value: 'python' },
			{ text: 'Java', value: 'java' },
			{ text: 'C', value: 'c' },
			{ text: 'C#', value: 'csharp' },
			{ text: 'C++', value: 'cpp' },
		],

		// Templates
		templates: [
			{
				title: 'Bài viết cơ bản',
				description: 'Template cơ bản cho bài viết',
				content: `
					<h2>Tiêu đề chính</h2>
					<p>Đoạn mở đầu giới thiệu về chủ đề bài viết...</p>
					
					<h3>Nội dung chính</h3>
					<p>Phát triển ý tưởng và cung cấp thông tin chi tiết...</p>
					
					<blockquote>
						<p>Một câu trích dẫn hoặc thông tin quan trọng</p>
					</blockquote>
					
					<h3>Kết luận</h3>
					<p>Tóm tắt và kết luận bài viết...</p>
				`,
			},
			{
				title: 'Bài viết có hình ảnh',
				description: 'Template với hình ảnh minh họa',
				content: `
					<h2>Tiêu đề với hình ảnh</h2>
					<p>Giới thiệu về chủ đề...</p>
					
					<p><img src="https://via.placeholder.com/600x400/f0f0f0/666?text=Hình+minh+họa" alt="Hình minh họa" style="width: 100%; max-width: 600px;" /></p>
					
					<h3>Phân tích chi tiết</h3>
					<p>Nội dung phân tích dựa trên hình ảnh...</p>
				`,
			},
			{
				title: 'Bài viết có bảng',
				description: 'Template với bảng dữ liệu',
				content: `
					<h2>Dữ liệu và thống kê</h2>
					<p>Giới thiệu về dữ liệu...</p>
					
					<table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
						<thead>
							<tr style="background-color: #f8f9fa;">
								<th style="border: 1px solid #dee2e6; padding: 12px;">Tiêu đề 1</th>
								<th style="border: 1px solid #dee2e6; padding: 12px;">Tiêu đề 2</th>
								<th style="border: 1px solid #dee2e6; padding: 12px;">Tiêu đề 3</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td style="border: 1px solid #dee2e6; padding: 12px;">Dữ liệu 1</td>
								<td style="border: 1px solid #dee2e6; padding: 12px;">Dữ liệu 2</td>
								<td style="border: 1px solid #dee2e6; padding: 12px;">Dữ liệu 3</td>
							</tr>
						</tbody>
					</table>
					
					<p>Phân tích dữ liệu trong bảng...</p>
				`,
			},
		],

		// Advanced options
		browser_spellcheck: true,
		contextmenu: 'link image table',
		placeholder: 'Bắt đầu viết nội dung bài viết của bạn...',
		resize: 'both',
		statusbar: true,

		// Event handlers
		setup: (editor: any) => {
			editor.on('init', () => {
				editorRef.current = editor;
			});
		},

		// Remove branding (nếu có premium account)
		branding: false,

		// Language
		language: 'vi',
	};

	return (
		<div className={`tinymce-container ${isFullScreen ? 'fullscreen-editor' : ''}`}>
			<Editor
				apiKey='1h1h01p48rexzbjsj0pbq5jv01cgy2srguriuatuwcq2odfk'
				value={value || ''}
				onEditorChange={(content: string) => {
					onChange(content);
				}}
				init={editorConfig}
			/>
		</div>
	);
};

// Schema validation
const postSchema = z.object({
	title: z.string().min(1, 'Tiêu đề là bắt buộc'),
	excerpt: z.string().optional().or(z.literal('')),
	content: z.string().min(1, 'Nội dung là bắt buộc'),
	featuredImage: z.string().optional().or(z.literal('')),
	categoryId: z.string().min(1, 'Danh mục là bắt buộc'),
	tagIds: z.array(z.string()).optional(),
	status: z.enum(['draft', 'published', 'archived']).optional(),
	isFeatured: z.boolean().optional(),
	isSticky: z.boolean().optional(),
	publishedAt: z.string().optional().or(z.literal('')),
	seoTitle: z.string().optional().or(z.literal('')),
	seoDescription: z.string().optional().or(z.literal('')),
	seoKeywords: z.array(z.string()).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface Post {
	id: string;
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	featuredImage?: string;
	categoryId?: any;
	tagIds?: any;
	status: 'draft' | 'published' | 'archived';
	isFeatured: boolean;
	isSticky: boolean;
	publishedAt?: string;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
	createdAt: string;
	updatedAt: string;
}

interface PostEditorProps {
	post?: Post;
	onSave?: (post: Post) => void;
	onCancel?: () => void;
	isUpdating?: boolean;
}

export function PostEditor({ post, onSave, onCancel, isUpdating }: PostEditorProps) {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [newKeyword, setNewKeyword] = useState('');
	const [previewMode, setPreviewMode] = useState(false);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Vui lòng chọn tệp hình ảnh');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error('Kích thước hình ảnh phải nhỏ hơn 5MB');
			return;
		}

		uploadImageMutation.mutate(file);
	};

	const handleTagToggle = (tagId: string) => {
		setSelectedTags((prev) => {
			const newTags = prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId];
			setValue('tagIds', newTags);
			return newTags;
		});
	};

	const handleAddKeyword = () => {
		if (newKeyword.trim()) {
			const currentKeywords = getValues('seoKeywords') || [];
			if (!currentKeywords.includes(newKeyword.trim())) {
				setValue('seoKeywords', [...currentKeywords, newKeyword.trim()]);
				setNewKeyword('');
			} else {
				toast.error('Từ khóa đã tồn tại');
			}
		}
	};

	const handleRemoveKeyword = (index: number) => {
		const currentKeywords = getValues('seoKeywords') || [];
		setValue(
			'seoKeywords',
			currentKeywords.filter((_, i) => i !== index)
		);
	};

	const watchedContent = watch('content');
	const watchedTitle = watch('title');
	const watchedFeaturedImage = watch('featuredImage');
	const watchedSeoKeywords = watch('seoKeywords');

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
				<Card>
					<CardHeader>
						<CardTitle>{watchedTitle}</CardTitle>
					</CardHeader>
					<CardContent>
						<div
							className='prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-blockquote:text-gray-600'
							dangerouslySetInnerHTML={{ __html: watchedContent || '' }}
						/>
					</CardContent>
				</Card>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						{/* Main Content */}
						<div className='lg:col-span-2 space-y-6'>
							<Card>
								<CardHeader>
									<CardTitle>Nội dung bài viết</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div>
										<Label htmlFor='title'>Tiêu đề *</Label>
										<Controller
											name='title'
											control={control}
											render={({ field }) => (
												<Input
													{...field}
													placeholder='Nhập tiêu đề bài viết...'
													className={errors.title ? 'border-red-500' : ''}
												/>
											)}
										/>
										{errors.title && (
											<p className='text-sm text-red-500 mt-1'>{errors.title.message}</p>
										)}
									</div>

									<div>
										<Label htmlFor='excerpt'>Tóm tắt</Label>
										<Controller
											name='excerpt'
											control={control}
											render={({ field }) => (
												<Textarea
													{...field}
													placeholder='Tóm tắt ngắn gọn về bài viết...'
													rows={3}
												/>
											)}
										/>
									</div>

									<div>
										<Label htmlFor='content'>Nội dung *</Label>
										<Controller
											name='content'
											control={control}
											render={({ field }) => (
												<div className='mt-2'>
													<EditorWrapper
														value={field.value || ''}
														onChange={(content: string) => {
															field.onChange(content);
														}}
														isFullScreen={isFullScreen}
														uploadImage={uploadPostImage}
													/>
												</div>
											)}
										/>
										{errors.content && (
											<p className='text-sm text-red-500 mt-1'>{errors.content.message}</p>
										)}
									</div>
								</CardContent>
							</Card>

							{/* SEO Settings */}
							<Card>
								<CardHeader>
									<CardTitle>Cài đặt SEO</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div>
										<Label htmlFor='seoTitle'>Tiêu đề SEO</Label>
										<Controller
											name='seoTitle'
											control={control}
											render={({ field }) => (
												<Input {...field} placeholder='Tiêu đề tối ưu SEO...' />
											)}
										/>
									</div>

									<div>
										<Label htmlFor='seoDescription'>Mô tả SEO</Label>
										<Controller
											name='seoDescription'
											control={control}
											render={({ field }) => (
												<Textarea {...field} placeholder='Mô tả meta SEO...' rows={3} />
											)}
										/>
									</div>

									<div className='flex flex-col gap-3'>
										<Label htmlFor='seoKeywords'>Từ khóa SEO</Label>
										<div className='flex items-center gap-2'>
											<Input
												value={newKeyword}
												onChange={(e) => setNewKeyword(e.target.value)}
												placeholder='Thêm từ khóa...'
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														handleAddKeyword();
													}
												}}
											/>
											<Button
												type='button'
												onClick={handleAddKeyword}
												className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200'
											>
												Thêm
											</Button>
										</div>
										<div className='flex flex-wrap gap-2'>
											{(watchedSeoKeywords || []).map((keyword, index) => (
												<Badge key={index} variant='secondary' className='p-2'>
													{keyword}
													<button
														type='button'
														onClick={() => handleRemoveKeyword(index)}
														className='ml-2 hover:text-red-500'
													>
														<X className='h-3 w-3' />
													</button>
												</Badge>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className='space-y-6'>
							{/* Publish Settings */}
							<Card>
								<CardHeader>
									<CardTitle>Xuất bản</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='flex flex-col gap-3'>
										<Label htmlFor='status'>Trạng thái</Label>
										<Controller
											name='status'
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} value={field.value || 'draft'}>
													<SelectTrigger>
														<SelectValue placeholder='Chọn trạng thái' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='draft'>Bản nháp</SelectItem>
														<SelectItem value='published'>Đã xuất bản</SelectItem>
														<SelectItem value='archived'>Đã lưu trữ</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
									</div>

									<div className='flex items-center space-x-2'>
										<Controller
											name='isFeatured'
											control={control}
											render={({ field }) => (
												<Switch
													checked={field.value || false}
													onCheckedChange={field.onChange}
												/>
											)}
										/>
										<Label>Bài viết nổi bật</Label>
									</div>

									<div className='flex items-center space-x-2'>
										<Controller
											name='isSticky'
											control={control}
											render={({ field }) => (
												<Switch
													checked={field.value || false}
													onCheckedChange={field.onChange}
												/>
											)}
										/>
										<Label>Bài viết ghim</Label>
									</div>

									<div className='pt-4 border-t'>
										<Button
											type='submit'
											disabled={isSubmitting || isUpdating || createPostMutation.isPending}
											className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 w-full'
										>
											{isSubmitting || isUpdating || createPostMutation.isPending ? (
												<>
													<Loader2 className='mr-2 h-4 w-4 animate-spin' />
													Đang tạo...
												</>
											) : (
												<>
													<Save className='mr-2 h-4 w-4' />
													{post ? 'Cập nhật bài viết' : 'Tạo bài viết'}
												</>
											)}
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* Featured Image */}
							<Card>
								<CardHeader>
									<CardTitle>Hình ảnh đại diện</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										<input
											type='file'
											ref={fileInputRef}
											onChange={handleImageUpload}
											accept='image/*'
											className='hidden'
										/>

										{watchedFeaturedImage ? (
											<div className='relative'>
												<img
													src={watchedFeaturedImage}
													alt='Hình đại diện'
													className='w-full h-40 object-cover rounded-lg'
												/>
												<Button
													type='button'
													variant='destructive'
													size='sm'
													className='absolute top-2 right-2'
													onClick={() => setValue('featuredImage', '')}
												>
													<X className='h-4 w-4' />
												</Button>
											</div>
										) : (
											<Button
												type='button'
												variant='outline'
												className='w-full h-40 border-dashed'
												onClick={() => fileInputRef.current?.click()}
												disabled={uploadImageMutation.isPending}
											>
												<div className='text-center'>
													{uploadImageMutation.isPending ? (
														<>
															<Loader2 className='mx-auto h-8 w-8 mb-2 animate-spin' />
															<div>Đang tải lên...</div>
														</>
													) : (
														<>
															<Upload className='mx-auto h-8 w-8 mb-2' />
															<div>Tải lên hình ảnh</div>
														</>
													)}
												</div>
											</Button>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Category */}
							<Card>
								<CardHeader>
									<CardTitle>Danh mục</CardTitle>
								</CardHeader>
								<CardContent>
									<Controller
										name='categoryId'
										control={control}
										render={({ field }) => (
											<Select onValueChange={field.onChange} value={field.value}>
												<SelectTrigger>
													<SelectValue placeholder='Chọn danh mục' />
												</SelectTrigger>
												<SelectContent>
													{categoriesData?.data?.map((category: any) => (
														<SelectItem key={category.id} value={category.id}>
															{category.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
									{errors.categoryId && (
										<p className='text-sm text-red-500 mt-1'>{errors.categoryId.message}</p>
									)}
								</CardContent>
							</Card>

							{/* Tags */}
							<Card>
								<CardHeader>
									<CardTitle>Thẻ</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-2 max-h-48 overflow-y-auto'>
										{tagsData?.data?.map((tag) => (
											<div key={tag.id} className='flex items-center space-x-2'>
												<input
													type='checkbox'
													id={`tag-${tag.id}`}
													checked={selectedTags.includes(tag.id)}
													onChange={() => handleTagToggle(tag.id)}
													className='rounded'
												/>
												<Label htmlFor={`tag-${tag.id}`} className='flex-1'>
													{tag.name}
												</Label>
												{tag.color && (
													<div
														className='w-4 h-4 rounded-full'
														style={{ backgroundColor: tag.color }}
													/>
												)}
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</form>
			)}
		</div>
	);
}
