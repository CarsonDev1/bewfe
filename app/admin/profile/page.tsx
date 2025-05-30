'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Camera, Save, Loader2 } from 'lucide-react';
import { getMe } from '@/services/auth-service';
import { updateProfile, uploadAvatar, UpdateProfileRequest } from '@/services/user-service';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ProfilePage = () => {
	const queryClient = useQueryClient();
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	// Fetch user data
	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['me'],
		queryFn: getMe,
	});

	// Form state - chỉ giữ các field cần thiết (bỏ dateOfBirth và location)
	const [formData, setFormData] = useState<UpdateProfileRequest>({
		firstName: '',
		lastName: '',
		displayName: '',
		bio: '',
		website: '',
		isEmailNotificationEnabled: true,
		isProfilePublic: true,
		seoTitle: '',
		seoDescription: '',
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: updateProfile,
		onSuccess: (data) => {
			toast.success(data.message || 'Cập nhật profile thành công!');
			// Invalidate và refetch user data
			queryClient.invalidateQueries({ queryKey: ['me'] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Cập nhật profile thất bại');
		},
	});

	// Upload avatar mutation - riêng biệt
	const uploadAvatarMutation = useMutation({
		mutationFn: uploadAvatar,
		onSuccess: (data) => {
			toast.success(data.message || 'Upload avatar thành công!');
			// Invalidate user query để refresh avatar
			queryClient.invalidateQueries({ queryKey: ['me'] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Upload avatar thất bại');
		},
	});

	// Populate form with user data - bỏ dateOfBirth và location
	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				displayName: user.displayName || '',
				bio: user.bio || '',
				website: user.website || '',
				isEmailNotificationEnabled: user.isEmailNotificationEnabled ?? true,
				isProfilePublic: user.isProfilePublic ?? true,
				seoTitle: user.seoTitle || '',
				seoDescription: user.seoDescription || '',
			});
		}
	}, [user]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		updateMutation.mutate(formData);
	};

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				toast.error('Vui lòng chọn file ảnh');
				return;
			}

			// Validate file size (max 5MB)
			const maxSize = 5 * 1024 * 1024; // 5MB
			if (file.size > maxSize) {
				toast.error('File ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB');
				return;
			}

			uploadAvatarMutation.mutate(file);
		}
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loader2 className='w-8 h-8 animate-spin' />
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<p className='text-red-600 mb-4'>Không thể tải thông tin profile</p>
					<button
						onClick={() => window.location.reload()}
						className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
					>
						Thử lại
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full mx-auto p-3 space-y-2'>
			{/* Header */}
			<div className='bg-white rounded-2xl shadow-sm border p-6'>
				<h1 className='text-3xl font-bold text-gray-900 mb-2'>Cài đặt Profile</h1>
				<p className='text-gray-600'>Quản lý thông tin cá nhân và cài đặt tài khoản của bạn</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-4'>
				{/* Avatar Section */}
				<div className='bg-white rounded-2xl shadow-sm border p-6 flex flex-col gap-4'>
					<div>
						<h2 className='text-xl font-semibold text-gray-900 mb-4'>Ảnh đại diện</h2>
						<div className='flex items-center space-x-6'>
							<div className='relative'>
								<div
									className='w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-300 transition-colors'
									onClick={handleAvatarClick}
								>
									{user?.avatar ? (
										<img src={user.avatar} alt='Avatar' className='w-full h-full object-cover' />
									) : (
										<span className='text-2xl font-semibold text-gray-500'>
											{user?.firstName?.[0]}
											{user?.lastName?.[0]}
										</span>
									)}
								</div>
								<button
									type='button'
									onClick={handleAvatarClick}
									disabled={uploadAvatarMutation.isPending}
									className='absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-50'
								>
									{uploadAvatarMutation.isPending ? (
										<Loader2 className='w-3 h-3 animate-spin' />
									) : (
										<Camera className='w-4 h-4' />
									)}
								</button>
							</div>
							<div className='flex-1'>
								<p className='text-sm text-gray-600 mb-2'>
									Nhấp vào ảnh đại diện để thay đổi. Chỉ chấp nhận file ảnh dưới 5MB.
								</p>
								<p className='text-xs text-gray-500'>Định dạng được hỗ trợ: JPG, PNG, GIF</p>
							</div>
						</div>
						{/* Hidden file input */}
						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							onChange={handleFileChange}
							className='hidden'
						/>
					</div>

					<div className='flex items-center gap-2'>
						<span>Số bài viết đã đăng: </span>
						<span>{user?.postCount}</span>
					</div>
				</div>

				{/* Basic Information - Bỏ dateOfBirth và location */}
				<div className='bg-white rounded-2xl shadow-sm border p-6'>
					<h2 className='text-xl font-semibold text-gray-900 mb-6'>Thông tin cơ bản</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<Label className='block text-sm font-medium text-gray-700 mb-2'>Tên</Label>
							<Input
								type='text'
								name='firstName'
								value={formData.firstName}
								onChange={handleInputChange}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Nhập tên của bạn'
							/>
						</div>
						<div>
							<Label className='block text-sm font-medium text-gray-700 mb-2'>Họ</Label>
							<Input
								type='text'
								name='lastName'
								value={formData.lastName}
								onChange={handleInputChange}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Nhập họ của bạn'
							/>
						</div>
						<div className='md:col-span-2'>
							<Label className='block text-sm font-medium text-gray-700 mb-2'>Tên hiển thị</Label>
							<Input
								type='text'
								name='displayName'
								value={formData.displayName}
								onChange={handleInputChange}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Tên hiển thị công khai'
							/>
						</div>
						<div className='md:col-span-2'>
							<Label className='block text-sm font-medium text-gray-700 mb-2'>Link Social</Label>
							<Input
								type='url'
								name='website'
								value={formData.website}
								onChange={handleInputChange}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='https://yourwebsite.com'
							/>
						</div>
						<div className='md:col-span-2'>
							<Label className='block text-sm font-medium text-gray-700 mb-2'>Giới thiệu</Label>
							<Textarea
								name='bio'
								value={formData.bio}
								onChange={handleInputChange}
								rows={4}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
								placeholder='Viết vài dòng giới thiệu về bản thân...'
							/>
						</div>
					</div>
				</div>

				{/* Submit Button */}
				<div className='flex justify-end'>
					<button
						type='submit'
						disabled={updateMutation.isPending}
						className='px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
					>
						{updateMutation.isPending ? (
							<>
								<Loader2 className='w-5 h-5 animate-spin' />
								<span>Đang lưu...</span>
							</>
						) : (
							<>
								<Save className='w-5 h-5' />
								<span>Lưu thay đổi</span>
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default ProfilePage;
