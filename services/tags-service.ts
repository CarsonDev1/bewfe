import api from '@/lib/axiosInstance';

export interface Tag {
	id: string;
	name: string;
	slug: string;
	description?: string;
	color?: string;
	isActive: boolean;
	postCount?: number;
	seoTitle?: string;
	seoDescription?: string;
	createdAt: string;
	updatedAt: string;
	image?: string;
}

export interface CreateTagRequest {
	name: string;
	description?: string;
	color?: string;
	isActive?: boolean;
	seoTitle?: string;
	seoDescription?: string;
}

export interface CreateTagResponse {
	data: Tag;
	message: string;
}

export interface UpdateTagRequest {
	name?: string;
	description?: string;
	color?: string;
	isActive?: boolean;
	seoTitle?: string;
	seoDescription?: string;
}

export interface UpdateTagResponse {
	data: Tag;
	message: string;
}

export interface DeleteTagResponse {
	message: string;
}

export interface GetTagsParams {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}

export interface GetTagsResponse {
	data: Tag[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface UploadTagImageResponse {
	data: {
		imageUrl: string;
	};
	message: string;
}

export const createTag = async (data: CreateTagRequest): Promise<CreateTagResponse> => {
	const response = await api.post('/tags', data);
	return response.data;
};

export const getTags = async (params?: GetTagsParams): Promise<GetTagsResponse> => {
	const response = await api.get('/tags', { params });
	return response.data;
};

export const getTagById = async (id: string): Promise<{ data: Tag }> => {
	const response = await api.get(`/tags/${id}`);
	return response.data;
};

export const updateTag = async (id: string, data: UpdateTagRequest): Promise<UpdateTagResponse> => {
	const response = await api.patch(`/tags/${id}`, data);
	return response.data;
};

export const deleteTag = async (id: string): Promise<DeleteTagResponse> => {
	const response = await api.delete(`/tags/${id}`);
	return response.data;
};

// Upload tag image function
export const uploadTagImage = async (id: string, file: File): Promise<UploadTagImageResponse> => {
	const formData = new FormData();
	formData.append('file', file);

	const response = await api.post(`/tags/${id}/image`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});

	return response.data;
};