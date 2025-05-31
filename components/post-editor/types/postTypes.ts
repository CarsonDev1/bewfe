import { z } from 'zod';

// Schema validation
export const postSchema = z.object({
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

export type PostFormData = z.infer<typeof postSchema>;

export interface Post {
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

export interface PostEditorProps {
	post?: Post;
	onSave?: (post: Post) => void;
	onCancel?: () => void;
	isUpdating?: boolean;
}
