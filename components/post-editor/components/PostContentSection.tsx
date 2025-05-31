'use client';

import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditorWrapper } from './TinyMCEWrapper';
import { PostFormData } from '../types/postTypes';
import { uploadPostImage } from '@/services/posts-service';

interface PostContentSectionProps {
	control: Control<PostFormData>;
	errors: FieldErrors<PostFormData>;
	isFullScreen: boolean;
}

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
