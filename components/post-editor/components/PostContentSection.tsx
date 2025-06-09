'use client';

import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditorWrapper } from './TinyMCEWrapper';
import { PostFormData } from '../types/postTypes';
import { uploadPostImage } from '@/services/posts-service';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PostContentSectionProps {
	control: Control<PostFormData>;
	errors: FieldErrors<PostFormData>;
	isFullScreen: boolean;
}

// Helper function to generate slug from title
const generateSlugFromTitle = (title: string): string => {
	return title
		.toLowerCase()
		.trim()
		// Replace Vietnamese characters
		.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
		.replace(/[èéẹẻẽêềếệểễ]/g, 'e')
		.replace(/[ìíịỉĩ]/g, 'i')
		.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
		.replace(/[ùúụủũưừứựửữ]/g, 'u')
		.replace(/[ỳýỵỷỹ]/g, 'y')
		.replace(/đ/g, 'd')
		// Replace spaces and special characters with hyphens
		.replace(/[\s\W-]+/g, '-')
		// Remove leading/trailing hyphens
		.replace(/^-+|-+$/g, '')
		// Limit to 100 characters
		.substring(0, 100)
		// Remove trailing hyphen if cut off mid-word
		.replace(/-$/, '');
};

export const PostContentSection = ({ control, errors, isFullScreen }: PostContentSectionProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Nội dung bài viết</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div>
					<Label htmlFor='title'>Tiêu đề *</Label>
					<Controller
						name='title'
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								placeholder='Nhập tiêu đề bài viết...'
								className={errors.title ? 'border-red-500' : ''}
							/>
						)}
					/>
					{errors.title && <p className='text-sm text-red-500 mt-1'>{errors.title.message}</p>}
				</div>

				<div>
					<div className='flex items-center justify-between mb-2'>
						<Label htmlFor='slug'>URL Slug *</Label>
						<Controller
							name='title'
							control={control}
							render={({ field: titleField }) => (
								<Controller
									name='slug'
									control={control}
									render={({ field: slugField }) => (
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={() => {
												if (titleField.value) {
													const generatedSlug = generateSlugFromTitle(titleField.value);
													slugField.onChange(generatedSlug);
												}
											}}
											disabled={!titleField.value}
											className='flex items-center gap-1'
										>
											<RefreshCw className='h-3 w-3' />
											Tạo từ tiêu đề
										</Button>
									)}
								/>
							)}
						/>
					</div>
					<Controller
						name='slug'
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								placeholder='url-slug-cua-bai-viet'
								className={errors.slug ? 'border-red-500' : ''}
								maxLength={100}
							/>
						)}
					/>
					{errors.slug && <p className='text-sm text-red-500 mt-1'>{errors.slug.message}</p>}
					<p className='text-xs text-gray-500 mt-1'>
						URL thân thiện cho bài viết (tối đa 100 ký tự). Chỉ sử dụng chữ thường, số và dấu gạch ngang.
					</p>
				</div>

				<div>
					<Label htmlFor='excerpt'>Tóm tắt</Label>
					<Controller
						name='excerpt'
						control={control}
						render={({ field }) => (
							<Textarea {...field} placeholder='Tóm tắt ngắn gọn về bài viết...' rows={3} />
						)}
					/>
				</div>

				<div>
					<Label htmlFor='content'>Nội dung *</Label>
					<Controller
						name='content'
						control={control}
						render={({ field }) => (
							<div className='mt-2'>
								<EditorWrapper
									value={field.value || ''}
									onChange={(content: string) => {
										field.onChange(content);
									}}
									isFullScreen={isFullScreen}
									uploadImage={uploadPostImage}
								/>
							</div>
						)}
					/>
					{errors.content && <p className='text-sm text-red-500 mt-1'>{errors.content.message}</p>}
				</div>
			</CardContent>
		</Card>
	);
};