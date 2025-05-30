import api from '@/lib/axiosInstance';

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	displayName: string;
}

export interface MeResponse {
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
	avatar?: string;
	postCount: number;
}

export interface RegisterResponse {
	message: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	message: string;
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
		username: string;
		firstName: string;
		lastName: string;
		displayName: string;
	};
}

/**
 * Đăng ký người dùng mới
 * @param userData - Thông tin người dùng cần đăng ký
 * @returns Promise với response từ API
 */
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
	try {
		const response = await api.post<RegisterResponse>('/auth/register', userData);
		return response.data;
	} catch (error: any) {
		throw error;
	}
};

/**
 * Đăng nhập người dùng
 * @param loginData - Thông tin đăng nhập (email và password)
 * @returns Promise với response từ API
 */
export const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
	try {
		const response = await api.post<LoginResponse>('/auth/login', loginData);

		// Lưu tokens vào localStorage
		if (response.data.accessToken) {
			localStorage.setItem('accessToken', response.data.accessToken);
		}
		if (response.data.refreshToken) {
			localStorage.setItem('refreshToken', response.data.refreshToken);
		}

		return response.data;
	} catch (error: any) {
		throw error;
	}
};

/**
 * Lấy thông tin profile người dùng hiện tại
 * @returns Promise với thông tin user
 */
export const getMe = async (): Promise<MeResponse> => {
	try {
		const response = await api.get<MeResponse>('/auth/me');
		return response.data;
	} catch (error: any) {
		throw error;
	}
};
