import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';

export const usePosts = (params?: any) => {
	return useQuery<any>({
		queryKey: ['posts', params],
		queryFn: async () => {
			const response = await api.get('/posts', { params });
			return response.data;
		},
	});
};
