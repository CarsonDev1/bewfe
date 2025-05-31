import { Control, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';
import { Hash, Loader2 } from 'lucide-react';
import { PostFormData } from '@/types';

interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string;
	icon?: string;
}

interface CategoriesResponse {
	data: Category[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

interface CategorySectionProps {
	control: Control<PostFormData>;
	errors: FieldErrors<PostFormData>;
	categoriesData?: CategoriesResponse;
}

export const CategorySection = ({ control, errors, categoriesData }: CategorySectionProps) => {
	const categories = categoriesData?.data || [];
	const isLoading = !categoriesData;

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Hash className='h-5 w-5' />
					Danh mục
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='space-y-2'>
					<Label htmlFor='categoryId'>Chọn danh mục *</Label>
					<Controller
						name='categoryId'
						control={control}
						render={({ field }) => (
							<Select
								value={field.value && field.value.trim() !== '' ? field.value : undefined}
								onValueChange={(value) => {
									// Only call onChange if value is not empty and not the disabled option
									if (value && value !== 'no-categories') {
										field.onChange(value);
									}
								}}
								disabled={isLoading}
							>
								<SelectTrigger className={`w-full ${errors.categoryId ? 'border-red-500' : ''}`}>
									{isLoading ? (
										<div className='flex items-center gap-2'>
											<Loader2 className='h-4 w-4 animate-spin' />
											<span>Đang tải danh mục...</span>
										</div>
									) : (
										<SelectValue placeholder='Chọn danh mục bài viết' />
									)}
								</SelectTrigger>
								<SelectContent>
									{categories.length > 0 ? (
										categories
											.filter((category) => category.id && category.id.trim() !== '') // Filter out empty IDs
											.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													<div className='flex items-center gap-2'>
														{category.icon && (
															<span className='text-sm'>{category.icon}</span>
														)}
														<span>{category.name}</span>
													</div>
												</SelectItem>
											))
									) : (
										<SelectItem value='no-categories' disabled>
											Không có danh mục nào
										</SelectItem>
									)}
								</SelectContent>
							</Select>
						)}
					/>
					{errors.categoryId && (
						<p className='text-sm text-red-500 flex items-center gap-1'>
							<span>⚠️</span>
							{errors.categoryId.message}
						</p>
					)}
				</div>

				{/* Category Info */}
				{categories.length > 0 && (
					<div className='text-xs text-gray-500 bg-blue-50 p-3 rounded-lg'>
						<p className='font-medium text-blue-800 mb-1'>📂 Thông tin:</p>
						<ul className='space-y-1 text-blue-700'>
							<li>• Có {categories.length} danh mục khả dụng</li>
							<li>• Danh mục giúp phân loại bài viết</li>
							<li>• Mỗi bài viết chỉ thuộc 1 danh mục</li>
						</ul>
					</div>
				)}

				{/* No categories warning */}
				{!isLoading && categories.length === 0 && (
					<div className='text-xs text-red-500 bg-red-50 p-3 rounded-lg'>
						<p className='font-medium text-red-800 mb-1'>⚠️ Cảnh báo:</p>
						<p className='text-red-700'>Không có danh mục nào. Vui lòng tạo danh mục trước khi đăng bài.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
