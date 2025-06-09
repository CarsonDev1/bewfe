// @/types/index.ts or wherever your main types are defined

import { z } from 'zod';

// Post schema with slug validation - THIS IS THE MAIN SCHEMA
export const postSchema = z.object({
	title: z.string().min(1, 'Tiêu đề là bắt buộc').max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
	slug: z
		.string()
		.min(1, 'URL slug là bắt buộc')
		.max(100, 'URL slug không được vượt quá 100 ký tự')
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			'URL slug chỉ được chứa chữ thường, số và dấu gạch ngang. Không được bắt đầu hoặc kết thúc bằng dấu gạch ngang'
		),
	excerpt: z.string().optional(),
	content: z.string().min(1, 'Nội dung là bắt buộc'),
	featuredImage: z.string().optional(),
	categoryId: z.string().min(1, 'Danh mục là bắt buộc'),
	tagIds: z.array(z.string()).optional(),
	relatedProducts: z.array(z.object({
		name: z.string(),
		url_key: z.string(),
		image_url: z.string(),
		price: z.number(),
		currency: z.string().min(1, 'Currency is required'),
		sale_price: z.number().optional(),
		product_url: z.string(),
	})).optional(),
	status: z.enum(['draft', 'published', 'archived']),
	isFeatured: z.boolean().optional(),
	isSticky: z.boolean().optional(),
	seoTitle: z.string().optional(),
	seoDescription: z.string().optional(),
	seoKeywords: z.array(z.string()).optional(),
});

// THIS IS THE MAIN PostFormData TYPE - make sure it matches everywhere
export type PostFormData = z.infer<typeof postSchema>;

// Related Product Schema
export const relatedProductSchema = z.object({
	name: z.string(),
	url_key: z.string(),
	image_url: z.string(),
	price: z.number(),
	currency: z.string().min(1, 'Currency is required'),
	sale_price: z.number().optional(),
	product_url: z.string(),
});

export type RelatedProduct = z.infer<typeof relatedProductSchema>;

// Post interface for API responses
export interface Post {
	id: string;
	title: string;
	slug: string; // Make sure slug is included here
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
	authorId: any;
	relatedProducts?: RelatedProduct[];
}

export interface PostEditorProps {
	post?: Post;
	onSave?: (post: Post) => void;
	onCancel: () => void;
	isUpdating?: boolean;
}

// Product related interfaces
export interface Product {
	name: string;
	url_key: string;
	image: {
		url: string;
	};
	price_range: {
		minimum_price: {
			final_price: {
				value: number;
				currency: string;
			};
		};
	};
	daily_sale?: {
		price: number;
	};
}

export interface ProductsResponse {
	data: Product[];
	total: number;
}

// Category interface
export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string;
	icon?: string;
}

// Tag interface
export interface Tag {
	id: string;
	name: string;
	color?: string;
}