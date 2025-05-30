import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 10, // 10 minutes
			retry: (failureCount, error: any) => {
				if (error?.response?.status >= 400 && error?.response?.status < 500) {
					if (![408, 429].includes(error.response.status)) {
						return false;
					}
				}
				return failureCount < 3;
			},
		},
		mutations: {
			retry: false,
		},
	},
});
