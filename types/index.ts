import { z } from 'zod';

export const relatedProductSchema = z.object({
	name: z.string(),
	url_key: z.string(),
	image_url: z.string(),
	price: z.number(),
	currency: z.string().default('VND'),
	sale_price: z.number().optional(),
	product_url: z.string(),
});

export const postSchema = z.object({
	title: z.string().min(1, 'Tiêu đề là bắt buộc'),
	excerpt: z.string().optional().or(z.literal('')),
	content: z.string().min(1, 'Nội dung là bắt buộc'),
	featuredImage: z.string().optional().or(z.literal('')),
	categoryId: z.string().min(1, 'Danh mục là bắt buộc'),
	tagIds: z.array(z.string()).optional(),
	relatedProducts: z.array(relatedProductSchema).optional(),
	status: z.enum(['draft', 'published', 'archived']).optional(),
	isFeatured: z.boolean().optional(),
	isSticky: z.boolean().optional(),
	publishedAt: z.string().optional().or(z.literal('')),
	seoTitle: z.string().optional().or(z.literal('')),
	seoDescription: z.string().optional().or(z.literal('')),
	seoKeywords: z.array(z.string()).optional(),
});

export type PostFormData = z.infer<typeof postSchema>;
export type RelatedProduct = z.infer<typeof relatedProductSchema>;

// Product interfaces from API
export interface ProductImage {
	url: string;
}

export interface ProductPrice {
	currency: string;
	value: number;
}

export interface ProductPriceRange {
	minimum_price: {
		final_price: ProductPrice;
	};
}

export interface Product {
	name: string;
	url_key: string;
	image: ProductImage;
	price_range: ProductPriceRange;
	daily_sale: any | null;
}

export interface ProductsResponse {
	data: Product[];
	total: number;
}

export interface Post {
	id: string;
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	featuredImage?: string;
	categoryId?: any;
	tagIds?: any;
	relatedProducts?: RelatedProduct[];
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
