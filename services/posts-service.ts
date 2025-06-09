import api from '@/lib/axiosInstance';
import { z } from 'zod';

// Related Product Schema - Make currency required with default value
export const relatedProductSchema = z.object({
	name: z.string(),
	url_key: z.string(),
	image_url: z.string(),
	price: z.number(),
	currency: z.string().min(1, 'Currency is required'), // Make currency required
	sale_price: z.number().optional(),
	product_url: z.string(),
});

export type RelatedProduct = z.infer<typeof relatedProductSchema>;

export interface Post {
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
	authorId: any;
	relatedProducts?: RelatedProduct[];
}

export interface CreatePostRequest {
	title: string;
	slug: string; // Make slug required for create request
	excerpt?: string;
	content: string;
	featuredImage?: string;
	categoryId?: string;
	tagIds?: string[];
	relatedProducts?: RelatedProduct[];
	status?: 'draft' | 'published' | 'archived';
	isFeatured?: boolean;
	isSticky?: boolean;
	publishedAt?: string;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
}

// Updated: Include slug and relatedProducts in update request
export interface UpdatePostRequest {
	title?: string;
	slug: string; // Make slug required for update request
	excerpt?: string;
	content?: string;
	featuredImage?: string;
	categoryId?: string;
	tagIds?: string[];
	relatedProducts?: RelatedProduct[];
	status?: 'draft' | 'published' | 'archived';
	isFeatured?: boolean;
	isSticky?: boolean;
	publishedAt?: string;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
}

export interface CreatePostResponse {
	data: Post;
	message: string;
}

// NEW: Update post response interface
export interface UpdatePostResponse {
	data: Post;
	message: string;
}

export interface GetPostsParams {
	page?: number;
	limit?: number;
	search?: string;
	categoryId?: string;
	tagId?: string;
	authorId?: string;
	status?: 'draft' | 'published' | 'archived';
	isFeatured?: boolean;
	isSticky?: boolean;
	sortBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'likeCount' | 'title';
	sortOrder?: 'asc' | 'desc';
}

export interface GetPostsResponse {
	data: Post[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

// FIXED: Upload response interface theo actual API response
export interface UploadPostImageResponse {
	message: string;
	url: string;
	publicId: string;
	width: number;
	height: number;
	responsive: {
		small: string;
		medium: string;
		large: string;
		original: string;
	};
}

export interface DeletePostResponse {
	message: string;
}

// Services
export const createPost = async (data: CreatePostRequest): Promise<CreatePostResponse> => {
	const response = await api.post('/posts', data);
	return response.data;
};

export const getPosts = async (params?: GetPostsParams): Promise<GetPostsResponse> => {
	const response = await api.get('/posts', { params });
	return response.data;
};

// NEW: Get current user's posts
export const getMyPosts = async (params?: GetPostsParams): Promise<GetPostsResponse> => {
	const response = await api.get('/posts/my-posts', { params });
	return response.data;
};

// Get post by slug service
export const getPostBySlug = async (slug: string): Promise<Post> => {
	const response = await api.get(`/posts/slug/${slug}`);
	return response.data;
};

// Get post by ID service
export const getPostById = async (id: string): Promise<Post> => {
	const response = await api.get(`/posts/${id}`);
	return response.data;
};

// UPDATED: Update post service with proper types
export const updatePost = async (id: string, data: UpdatePostRequest): Promise<UpdatePostResponse> => {
	const response = await api.patch(`/posts/${id}`, data);
	return response.data;
};

export const deletePost = async (id: string): Promise<DeletePostResponse> => {
	const response = await api.delete(`/posts/${id}`);
	return response.data;
};

export const uploadPostImage = async (file: File): Promise<UploadPostImageResponse> => {
	const formData = new FormData();
	formData.append('file', file); // Hoặc 'image' - check API documentation

	const response = await api.post('/upload/post-image', formData, {
		// Check endpoint
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};

// Helper function to prepare post data for API
export const preparePostData = (data: any): UpdatePostRequest | CreatePostRequest => {
	// Remove undefined fields and prepare data according to API schema
	const cleanedData: any = {};

	if (data.title !== undefined) cleanedData.title = data.title;
	if (data.slug !== undefined) cleanedData.slug = data.slug; // Slug is required, so always include if provided
	if (data.excerpt !== undefined && data.excerpt !== '') cleanedData.excerpt = data.excerpt;
	if (data.content !== undefined) cleanedData.content = data.content;
	if (data.featuredImage !== undefined && data.featuredImage !== '') cleanedData.featuredImage = data.featuredImage;
	if (data.categoryId !== undefined && data.categoryId !== '') cleanedData.categoryId = data.categoryId;
	if (data.tagIds !== undefined && Array.isArray(data.tagIds) && data.tagIds.length > 0) {
		cleanedData.tagIds = data.tagIds;
	}
	if (data.relatedProducts !== undefined && Array.isArray(data.relatedProducts) && data.relatedProducts.length > 0) {
		// Ensure all related products have required currency field
		cleanedData.relatedProducts = data.relatedProducts.map((product: any) => ({
			...product,
			currency: product.currency || 'VND', // Fallback to VND if currency is missing
		}));
	}
	if (data.status !== undefined) cleanedData.status = data.status;
	if (data.isFeatured !== undefined) cleanedData.isFeatured = data.isFeatured;
	if (data.isSticky !== undefined) cleanedData.isSticky = data.isSticky;

	// Auto-generate publishedAt when status is 'published' and publishedAt is not already set
	if (data.status === 'published' && data.publishedAt) {
		cleanedData.publishedAt = data.publishedAt;
	} else if (data.status === 'published' && !data.publishedAt) {
		cleanedData.publishedAt = new Date().toISOString();
	}

	if (data.seoTitle !== undefined && data.seoTitle !== '') cleanedData.seoTitle = data.seoTitle;
	if (data.seoDescription !== undefined && data.seoDescription !== '')
		cleanedData.seoDescription = data.seoDescription;
	if (data.seoKeywords !== undefined && Array.isArray(data.seoKeywords) && data.seoKeywords.length > 0) {
		cleanedData.seoKeywords = data.seoKeywords;
	}

	return cleanedData;
};

// Optional: Helper function to generate slug from title
export const generateSlug = (title: string): string => {
	return title
		.toLowerCase()
		.trim()
		.replace(/[\s\W-]+/g, '-') // Replace spaces and special characters with hyphens
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};