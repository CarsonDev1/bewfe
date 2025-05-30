export interface User {
	id: string;
	username: string;
	email: string;
	firstName?: string;
	lastName?: string;
	displayName?: string;
	avatar?: string;
	bio?: string;
	website?: string;
	location?: string;
	dateOfBirth?: string;
	role: 'user' | 'moderator' | 'admin';
	status: 'active' | 'inactive' | 'banned';
	postCount: number;
	commentCount: number;
	followerCount: number;
	followingCount: number;
	likeCount: number;
	lastLoginAt?: string;
	isEmailNotificationEnabled: boolean;
	isProfilePublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string;
	icon?: string;
	parentId?: string;
	order: number;
	isActive: boolean;
	postCount: number;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
	children?: Category[];
	createdAt: string;
	updatedAt: string;
}

export interface Tag {
	id: string;
	name: string;
	slug: string;
	description?: string;
	color?: string;
	postCount: number;
	isActive: boolean;
	seoTitle?: string;
	seoDescription?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Post {
	id: string;
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	featuredImage?: string;
	status: 'draft' | 'published' | 'archived';
	viewCount: number;
	likeCount: number;
	commentCount: number;
	isFeatured: boolean;
	isSticky: boolean;
	publishedAt?: string;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
	createdAt: string;
	updatedAt: string;
	// Populated fields
	categoryId?: Category;
	tagIds?: Tag[];
	authorId?: User;
}

export interface PaginationResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface ApiResponse<T = any> {
	data?: T;
	message?: string;
	error?: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
	expiresIn: number;
}

export interface CreatePostRequest {
	title: string;
	excerpt?: string;
	content: string;
	featuredImage?: string;
	categoryId: string;
	tagIds?: string[];
	status?: 'draft' | 'published' | 'archived';
	isFeatured?: boolean;
	isSticky?: boolean;
	publishedAt?: string;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
}

export interface CreateCategoryRequest {
	name: string;
	description?: string;
	icon?: string;
	parentId?: string;
	order?: number;
	isActive?: boolean;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
}

export interface CreateTagRequest {
	name: string;
	description?: string;
	color?: string;
	isActive?: boolean;
	seoTitle?: string;
	seoDescription?: string;
}

export interface QueryParams {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}
