import api from '@/lib/axiosInstance';

export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string;
	icon?: string;
	parentId?: string | null;
	order: number;
	isActive: boolean;
	postCount?: number;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
	createdAt: string;
	updatedAt: string;
	children?: Category[];
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

export interface CreateCategoryResponse {
	data: Category;
	message: string;
}

export interface UpdateCategoryRequest {
	name?: string;
	description?: string;
	icon?: string;
	parentId?: string;
	order?: number;
	isActive?: boolean;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
}

export interface UpdateCategoryResponse {
	data: Category;
	message: string;
}

export interface DeleteCategoryResponse {
	message: string;
}

export interface GetCategoriesParams {
	page?: number;
	limit?: number;
	search?: string;
	parentId?: string;
	isActive?: boolean;
	includeChildren?: boolean;
}

export interface GetCategoriesResponse {
	data: Category[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export const createCategory = async (data: CreateCategoryRequest): Promise<CreateCategoryResponse> => {
	const response = await api.post('/categories', data);
	return response.data;
};

export const getCategories = async (params?: GetCategoriesParams): Promise<GetCategoriesResponse> => {
	const response = await api.get('/categories', { params });
	return response.data;
};

export const getCategoryById = async (id: string): Promise<{ data: Category }> => {
	const response = await api.get(`/categories/${id}`);
	return response.data;
};

export const updateCategory = async (id: string, data: UpdateCategoryRequest): Promise<UpdateCategoryResponse> => {
	const response = await api.patch(`/categories/${id}`, data);
	return response.data;
};

export const deleteCategory = async (id: string): Promise<DeleteCategoryResponse> => {
	const response = await api.delete(`/categories/${id}`);
	return response.data;
};
