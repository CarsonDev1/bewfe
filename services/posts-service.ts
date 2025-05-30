import api from '@/lib/axiosInstance';

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
}

export interface CreatePostRequest {
	title: string;
	excerpt?: string;
	content: string;
	featuredImage?: string;
	categoryId?: string;
	tagIds?: string[];
	status?: 'draft' | 'published' | 'archived';
	isFeatured?: boolean;
	isSticky?: boolean;
	publishedAt?: string;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
}

// NEW: Update post request interface
export interface UpdatePostRequest {
	title?: string;
	excerpt?: string;
	content?: string;
	featuredImage?: string;
	categoryId?: string;
	tagIds?: string[];
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

// Get post by slug service
export const getPostBySlug = async (slug: string): Promise<Post> => {
	const response = await api.get(`/posts/slug/${slug}`);
	return response.data;
};

// NEW: Update post service
export const updatePost = async (id: string, data: UpdatePostRequest): Promise<any> => {
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