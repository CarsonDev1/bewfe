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
