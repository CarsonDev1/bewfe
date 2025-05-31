'use client';

import { Control, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';
import { Post, PostFormData } from '@/components/post-editor/types/postTypes';

interface PublishSettingsSectionProps {
	control: Control<PostFormData>;
	post?: Post;
	isSubmitting: boolean;
	isUpdating?: boolean;
	isPending: boolean;
}

export const PublishSettingsSection = ({
	control,
	post,
	isSubmitting,
	isUpdating,
	isPending,
}: PublishSettingsSectionProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Xuất bản</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex flex-col gap-3'>
					<Label htmlFor='status'>Trạng thái</Label>
					<Controller
						name='status'
						control={control}
						render={({ field }) => (
							<Select onValueChange={field.onChange} value={field.value || 'draft'}>
								<SelectTrigger>
									<SelectValue placeholder='Chọn trạng thái' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='draft'>Bản nháp</SelectItem>
									<SelectItem value='published'>Đã xuất bản</SelectItem>
									<SelectItem value='archived'>Đã lưu trữ</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				<div className='flex items-center space-x-2'>
					<Controller
						name='isFeatured'
						control={control}
						render={({ field }) => (
							<Switch checked={field.value || false} onCheckedChange={field.onChange} />
						)}
					/>
					<Label>Bài viết nổi bật</Label>
				</div>

				<div className='flex items-center space-x-2'>
					<Controller
						name='isSticky'
						control={control}
						render={({ field }) => (
							<Switch checked={field.value || false} onCheckedChange={field.onChange} />
						)}
					/>
					<Label>Bài viết ghim</Label>
				</div>

				<div className='pt-4 border-t'>
					<Button
						type='submit'
						disabled={isSubmitting || isUpdating || isPending}
						className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 w-full'
					>
						{isSubmitting || isUpdating || isPending ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Đang tạo...
							</>
						) : (
							<>
								<Save className='mr-2 h-4 w-4' />
								{post ? 'Cập nhật bài viết' : 'Tạo bài viết'}
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
