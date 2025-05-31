import api from '@/lib/axiosInstance';

export interface UpdateProfileRequest {
	firstName?: string;
	lastName?: string;
	displayName?: string;
	bio?: string;
	website?: string;
	location?: string;
	dateOfBirth?: string;
	isEmailNotificationEnabled?: boolean;
	isProfilePublic?: boolean;
	seoTitle?: string;
	seoDescription?: string;
}

export interface UpdateProfileResponse {
	message: string;
	user: {
		id: string;
		email: string;
		username: string;
		firstName: string;
		lastName: string;
		displayName: string;
		bio?: string;
		website?: string;
		location?: string;
		dateOfBirth?: string;
		isEmailNotificationEnabled: boolean;
		isProfilePublic: boolean;
		seoTitle?: string;
		seoDescription?: string;
		createdAt: string;
		updatedAt: string;
	};
}

export interface UploadAvatarResponse {
	message: string;
	avatarUrl: string;
	user: {
		id: string;
		avatar: string;
	};
}

// User interface for GET /users API
export interface User {
	id: string;
	username: string;
	email: string;
	firstName?: string;
	lastName?: string;
	displayName?: string;
	bio?: string;
	avatar?: string;
	website?: string;
	location?: string;
	role: 'user' | 'moderator' | 'admin';
	status: 'active' | 'inactive' | 'banned';
	isPublic: boolean;
	postCount?: number;
	followerCount?: number;
	createdAt: string;
	updatedAt: string;
}

// Parameters for GET /users API
export interface GetUsersParams {
	page?: number;
	limit?: number;
	search?: string;
	role?: 'user' | 'moderator' | 'admin';
	status?: 'active' | 'inactive' | 'banned';
	isPublic?: boolean;
	sortBy?: 'createdAt' | 'postCount' | 'followerCount' | 'username';
	sortOrder?: 'asc' | 'desc';
}

// Response for GET /users API
export interface GetUsersResponse {
	data: User[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

/**
 * Cập nhật profile người dùng hiện tại
 * @param profileData - Dữ liệu profile cần cập nhật
 * @returns Promise với response từ API
 */
export const updateProfile = async (profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
	try {
		const response = await api.patch<UpdateProfileResponse>('/users/profile', profileData);
		return response.data;
	} catch (error: any) {
		throw error;
	}
};

/**
 * Upload avatar cho người dùng hiện tại
 * @param file - File ảnh cần upload
 * @returns Promise với response từ API
 */
export const uploadAvatar = async (file: File): Promise<UploadAvatarResponse> => {
	try {
		const formData = new FormData();
		formData.append('avatar', file);

		const response = await api.post<UploadAvatarResponse>('/users/profile/avatar', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		return response.data;
	} catch (error: any) {
		throw error;
	}
};

/**
 * Lấy danh sách tất cả users với pagination và filters
 * @param params - Parameters để filter và phân trang
 * @returns Promise với danh sách users
 */
export const getUsers = async (params?: GetUsersParams): Promise<GetUsersResponse> => {
	try {
		const response = await api.get<GetUsersResponse>('/users', { params });
		return response.data;
	} catch (error: any) {
		throw error;
	}
};
