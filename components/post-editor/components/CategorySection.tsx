'use client';

import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PostFormData } from '@/components/post-editor/types/postTypes';

interface CategorySectionProps {
	control: Control<PostFormData>;
	errors: FieldErrors<PostFormData>;
	categoriesData?: {
		data: Array<{
			id: string;
			name: string;
		}>;
	};
}

export const CategorySection = ({ control, errors, categoriesData }: CategorySectionProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Danh mục</CardTitle>
			</CardHeader>
			<CardContent>
				<Controller
					name='categoryId'
					control={control}
					render={({ field }) => (
						<Select onValueChange={field.onChange} value={field.value}>
							<SelectTrigger>
								<SelectValue placeholder='Chọn danh mục' />
							</SelectTrigger>
							<SelectContent>
								{categoriesData?.data?.map((category: any) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{errors.categoryId && <p className='text-sm text-red-500 mt-1'>{errors.categoryId.message}</p>}
			</CardContent>
		</Card>
	);
};
