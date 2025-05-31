import { Control, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Controller } from 'react-hook-form';
import { CalendarDays, Settings, Save, Upload, Edit3, Plus } from 'lucide-react';
import { PostFormData, Post } from '@/types';
import { useEffect, useState } from 'react';

interface PublishSettingsSectionProps {
	control: Control<PostFormData>;
	post?: Post;
	isSubmitting: boolean;
	isUpdating?: boolean;
	isPending: boolean;
	isEditMode?: boolean;
}

export const PublishSettingsSection = ({
	control,
	post,
	isSubmitting,
	isUpdating,
	isPending,
	isEditMode = false,
}: PublishSettingsSectionProps) => {
	// Local state for Select value to ensure proper display
	const [localStatus, setLocalStatus] = useState<string>('draft');

	// Watch current form status value
	const currentStatus = useWatch({
		control,
		name: 'status',
		defaultValue: 'draft',
	});

	// Sync local status with form/post status
	useEffect(() => {
		const targetStatus = isEditMode ? post?.status || currentStatus || 'draft' : currentStatus || 'draft';
		console.log('Syncing local status:', { targetStatus, currentStatus, postStatus: post?.status });
		setLocalStatus(targetStatus);
	}, [isEditMode, post?.status, currentStatus]);

	// Force sync if there's a mismatch in edit mode
	useEffect(() => {
		if (isEditMode && post?.status && currentStatus !== post.status) {
			console.log('Status sync needed:', { currentStatus, postStatus: post.status });
			// Use setValue from control
			control._defaultValues.status = post.status;
			control._formValues.status = post.status;
		}
	}, [isEditMode, post?.status, currentStatus, control]);

	const getStatusBadge = (status: string) => {
		const variants = {
			published: { color: 'bg-green-500 text-white', text: 'Đã xuất bản', icon: '🟢' },
			draft: { color: 'bg-yellow-500 text-white', text: 'Bản nháp', icon: '📝' },
			archived: { color: 'bg-red-500 text-white', text: 'Đã lưu trữ', icon: '📦' },
		};

		const config = variants[status as keyof typeof variants] || variants.draft;

		return (
			<Badge className={`${config.color} font-semibold`}>
				<span className='mr-1'>{config.icon}</span>
				{config.text}
			</Badge>
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Settings className='h-5 w-5' />
					Cài đặt xuất bản
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Current Status (for edit mode) */}
				{isEditMode && post && (
					<div className='p-3 bg-slate-50 rounded-lg'>
						<Label className='text-sm font-medium text-slate-600'>Trạng thái hiện tại</Label>
						<div className='mt-1'>{getStatusBadge(post.status)}</div>
					</div>
				)}

				{/* Status Selection */}
				<div className='space-y-2'>
					<Label htmlFor='status'>Trạng thái</Label>
					<Controller
						name='status'
						control={control}
						render={({ field }) => (
							<Select
								key={`status-select-${post?.id || 'new'}-${localStatus}`} // Use localStatus in key
								value={localStatus} // Use localStatus instead of field.value
								onValueChange={(value) => {
									console.log('Status changing to:', value);
									setLocalStatus(value); // Update local state
									field.onChange(value); // Update form
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder='Chọn trạng thái' className='w-full' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='draft'>
										<div className='flex items-center gap-2'>
											<span>📝</span>
											<span>Bản nháp</span>
										</div>
									</SelectItem>
									<SelectItem value='published'>
										<div className='flex items-center gap-2'>
											<span>🟢</span>
											<span>Xuất bản</span>
										</div>
									</SelectItem>
									<SelectItem value='archived'>
										<div className='flex items-center gap-2'>
											<span>📦</span>
											<span>Lưu trữ</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				{/* Featured Toggle */}
				<div className='flex items-center justify-between space-x-2'>
					<Label htmlFor='isFeatured' className='text-sm font-medium'>
						Bài viết nổi bật
					</Label>
					<Controller
						name='isFeatured'
						control={control}
						render={({ field: { value, onChange } }) => (
							<Switch id='isFeatured' checked={value || false} onCheckedChange={onChange} />
						)}
					/>
				</div>

				{/* Sticky Toggle */}
				<div className='flex items-center justify-between space-x-2'>
					<Label htmlFor='isSticky' className='text-sm font-medium'>
						Ghim bài viết
					</Label>
					<Controller
						name='isSticky'
						control={control}
						render={({ field: { value, onChange } }) => (
							<Switch id='isSticky' checked={value || false} onCheckedChange={onChange} />
						)}
					/>
				</div>

				{/* Published Date Display (Read-only) */}
				{isEditMode && post?.publishedAt && (
					<div className='space-y-2'>
						<Label className='flex items-center gap-2'>
							<CalendarDays className='h-4 w-4' />
							Ngày xuất bản
						</Label>
						<div className='p-2 bg-slate-50 rounded-md text-sm'>
							{new Date(post.publishedAt).toLocaleString('vi-VN', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit',
							})}
						</div>
						<p className='text-xs text-slate-500'>Thời gian xuất bản được tự động ghi nhận</p>
					</div>
				)}

				{/* Action Buttons */}
				<div className='space-y-2 pt-4 border-t border-slate-200'>
					<Button
						type='submit'
						className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 w-full'
						disabled={isSubmitting || isPending}
						size='lg'
					>
						{isSubmitting || isPending ? (
							<div className='flex items-center gap-2'>
								<div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
								<span>{isEditMode ? 'Đang cập nhật...' : 'Đang lưu...'}</span>
							</div>
						) : (
							<div className='flex items-center gap-2'>
								{isEditMode ? (
									<>
										<Edit3 className='h-4 w-4' />
										<span>Cập nhật bài viết</span>
									</>
								) : (
									<>
										<Plus className='h-4 w-4' />
										<span>Tạo bài viết</span>
									</>
								)}
							</div>
						)}
					</Button>

					{/* Save as Draft (only for published posts in edit mode) */}
					{isEditMode && post?.status === 'published' && (
						<Button type='button' variant='outline' className='w-full' disabled={isSubmitting || isPending}>
							<Save className='mr-2 h-4 w-4' />
							Lưu thành bản nháp
						</Button>
					)}
				</div>

				{/* Tips */}
				<div className='text-xs text-slate-500 bg-blue-50 p-3 rounded-lg mt-4'>
					<p className='font-medium text-blue-800 mb-1'>💡 Gợi ý:</p>
					<ul className='space-y-1 text-blue-700'>
						<li>• Bản nháp: Chỉ bạn có thể xem</li>
						<li>• Xuất bản: Hiển thị công khai</li>
						<li>• Nổi bật: Hiển thị ở trang chủ</li>
						<li>• Ghim: Luôn ở đầu danh sách</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
};
