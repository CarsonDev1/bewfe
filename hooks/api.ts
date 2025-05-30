import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axiosInstance';
import {
	User,
	Category,
	Tag,
	Post,
	PaginationResponse,
	LoginRequest,
	LoginResponse,
	CreatePostRequest,
	CreateCategoryRequest,
	CreateTagRequest,
	QueryParams,
} from '@/types';

// Auth hooks
export const useLogin = () => {
	return useMutation<LoginResponse, Error, LoginRequest>({
		mutationFn: async (credentials) => {
			const response = await api.post('/auth/login', credentials);
			return response.data;
		},
		onSuccess: (data) => {
			localStorage.setItem('accessToken', data.accessToken);
			localStorage.setItem('refreshToken', data.refreshToken);
		},
	});
};

export const useLogout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const refreshToken = localStorage.getItem('refreshToken');
			if (refreshToken) {
				await api.post('/auth/logout', { refreshToken });
			}
		},
		onSuccess: () => {
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
			queryClient.clear();
		},
	});
};

// Posts hooks
export const usePosts = (params?: any) => {
	return useQuery<PaginationResponse<Post>>({
		queryKey: ['posts', params],
		queryFn: async () => {
			const response = await api.get('/posts', { params });
			return response.data;
		},
	});
};

export const usePost = (id: string) => {
	return useQuery<Post>({
		queryKey: ['posts', id],
		queryFn: async () => {
			const response = await api.get(`/posts/${id}`);
			return response.data;
		},
		enabled: !!id,
	});
};

export const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation<Post, Error, CreatePostRequest>({
		mutationFn: async (data) => {
			const response = await api.post('/posts', data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['posts'] });
		},
	});
};

export const useUpdatePost = () => {
	const queryClient = useQueryClient();

	return useMutation<Post, Error, { id: string; data: Partial<CreatePostRequest> }>({
		mutationFn: async ({ id, data }) => {
			const response = await api.patch(`/posts/${id}`, data);
			return response.data;
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ['posts'] });
			queryClient.invalidateQueries({ queryKey: ['posts', id] });
		},
	});
};

export const useDeletePost = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, string>({
		mutationFn: async (id) => {
			await api.delete(`/posts/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['posts'] });
		},
	});
};

// Categories hooks
export const useCategories = (params?: any) => {
	return useQuery<any>({
		queryKey: ['categories', params],
		queryFn: async () => {
			const response = await api.get('/categories', { params });
			return response.data;
		},
	});
};

export const useCategoryTree = () => {
	return useQuery<Category[]>({
		queryKey: ['categories', 'tree'],
		queryFn: async () => {
			const response = await api.get('/categories/tree');
			return response.data;
		},
	});
};

export const useCategory = (id: string) => {
	return useQuery<Category>({
		queryKey: ['categories', id],
		queryFn: async () => {
			const response = await api.get(`/categories/${id}`);
			return response.data;
		},
		enabled: !!id,
	});
};

export const useCreateCategory = () => {
	const queryClient = useQueryClient();

	return useMutation<Category, Error, CreateCategoryRequest>({
		mutationFn: async (data) => {
			const response = await api.post('/categories', data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
	});
};

export const useUpdateCategory = () => {
	const queryClient = useQueryClient();

	return useMutation<Category, Error, { id: string; data: Partial<CreateCategoryRequest> }>({
		mutationFn: async ({ id, data }) => {
			const response = await api.patch(`/categories/${id}`, data);
			return response.data;
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ['categories'] });
			queryClient.invalidateQueries({ queryKey: ['categories', id] });
		},
	});
};

export const useDeleteCategory = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, string>({
		mutationFn: async (id) => {
			await api.delete(`/categories/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
	});
};

// Tags hooks
export const useTags = (params?: QueryParams) => {
	return useQuery<PaginationResponse<Tag>>({
		queryKey: ['tags', params],
		queryFn: async () => {
			const response = await api.get('/tags', { params });
			return response.data;
		},
	});
};

export const useTag = (id: string) => {
	return useQuery<Tag>({
		queryKey: ['tags', id],
		queryFn: async () => {
			const response = await api.get(`/tags/${id}`);
			return response.data;
		},
		enabled: !!id,
	});
};

export const useCreateTag = () => {
	const queryClient = useQueryClient();

	return useMutation<Tag, Error, CreateTagRequest>({
		mutationFn: async (data) => {
			const response = await api.post('/tags', data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
	});
};

export const useUpdateTag = () => {
	const queryClient = useQueryClient();

	return useMutation<Tag, Error, { id: string; data: Partial<CreateTagRequest> }>({
		mutationFn: async ({ id, data }) => {
			const response = await api.patch(`/tags/${id}`, data);
			return response.data;
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ['tags'] });
			queryClient.invalidateQueries({ queryKey: ['tags', id] });
		},
	});
};

export const useDeleteTag = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, string>({
		mutationFn: async (id) => {
			await api.delete(`/tags/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
	});
};

// Users hooks
export const useUsers = (params?: QueryParams) => {
	return useQuery<PaginationResponse<User>>({
		queryKey: ['users', params],
		queryFn: async () => {
			const response = await api.get('/users', { params });
			return response.data;
		},
	});
};

export const useUser = (id: string) => {
	return useQuery<User>({
		queryKey: ['users', id],
		queryFn: async () => {
			const response = await api.get(`/users/${id}`);
			return response.data;
		},
		enabled: !!id,
	});
};

// Upload hooks
export const useUploadImage = () => {
	return useMutation<{ url: string; publicId: string }, Error, { file: File; type: string }>({
		mutationFn: async ({ file, type }) => {
			const formData = new FormData();
			formData.append('file', file);

			const response = await api.post(`/upload/${type}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		},
	});
};

// Stats hooks
export const useStats = () => {
	return useQuery({
		queryKey: ['stats'],
		queryFn: async () => {
			const response = await api.get('/stats');
			return response.data;
		},
	});
};
