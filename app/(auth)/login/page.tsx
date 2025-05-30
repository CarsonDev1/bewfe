'use client';
import { login, LoginRequest } from '@/services/auth-service';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
	const router = useRouter();
	const [formData, setFormData] = useState<LoginRequest>({
		email: '',
		password: '',
	});
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await login(formData);
			toast.success(response.message || 'Đăng nhập thành công!');

			router.push('/admin');
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4'>
			<div className='w-full max-w-lg'>
				{/* Header */}
				<div className='text-center mb-8'>
					<div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4'>
						<svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
							/>
						</svg>
					</div>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>Đăng nhập</h1>
					<p className='text-gray-600'>Chào mừng bạn trở lại</p>
				</div>

				{/* Form Card */}
				<div className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* Email */}
						<div className='space-y-2'>
							<label htmlFor='email' className='block text-sm font-semibold text-gray-700'>
								Email
							</label>
							<input
								type='email'
								id='email'
								name='email'
								value={formData.email}
								onChange={handleInputChange}
								required
								className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100'
								placeholder='your@email.com'
							/>
						</div>

						{/* Password */}
						<div className='space-y-2'>
							<label htmlFor='password' className='block text-sm font-semibold text-gray-700'>
								Mật khẩu
							</label>
							<div className='relative'>
								<input
									type={showPassword ? 'text' : 'password'}
									id='password'
									name='password'
									value={formData.password}
									onChange={handleInputChange}
									required
									className='w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100'
									placeholder='Nhập mật khẩu'
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'
								>
									{showPassword ? (
										<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
											/>
										</svg>
									) : (
										<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
											/>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
											/>
										</svg>
									)}
								</button>
							</div>
						</div>

						{/* Forgot Password */}
						<div className='flex justify-end'>
							<a
								href='/forgot-password'
								className='text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors'
							>
								Quên mật khẩu?
							</a>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							disabled={loading}
							className='w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg'
						>
							{loading ? (
								<div className='flex items-center justify-center space-x-2'>
									<svg
										className='animate-spin h-5 w-5 text-white'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
									>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
										></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										></path>
									</svg>
									<span>Đang đăng nhập...</span>
								</div>
							) : (
								'Đăng nhập'
							)}
						</button>
					</form>

					{/* Footer */}
					<div className='mt-6 text-center'>
						<p className='text-sm text-gray-600'>
							Chưa có tài khoản?{' '}
							<a
								href='/register'
								className='font-semibold text-indigo-600 hover:text-indigo-500 transition-colors'
							>
								Đăng ký ngay
							</a>
						</p>
					</div>
				</div>

				{/* Additional Info */}
				<div className='text-center mt-6'>
					<p className='text-xs text-gray-500'>
						Bằng cách đăng nhập, bạn đồng ý với{' '}
						<a href='#' className='underline hover:text-gray-700'>
							Điều khoản dịch vụ
						</a>{' '}
						và{' '}
						<a href='#' className='underline hover:text-gray-700'>
							Chính sách bảo mật
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
