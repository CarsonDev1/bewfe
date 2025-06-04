'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	Plus,
	Loader2,
	Search,
	Tag as TagIcon,
	Settings,
	Eye,
	Edit,
	Save,
	Trash2,
	AlertTriangle,
	Palette,
	Hash,
	Upload,
	Image as ImageIcon,
	X,
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
	Tag,
	createTag,
	updateTag,
	deleteTag,
	getTags,
	uploadTagImage,
	CreateTagRequest,
	UpdateTagRequest,
} from '@/services/tags-service';

// Extend Tag interface locally to include image
interface TagWithImage extends Tag {
	image?: string;
}

const PRESET_COLORS = [
	'#ef4444',
	'#f97316',
	'#f59e0b',
	'#eab308',
	'#84cc16',
	'#22c55e',
	'#10b981',
	'#14b8a6',
	'#06b6d4',
	'#0ea5e9',
	'#3b82f6',
	'#6366f1',
	'#8b5cf6',
	'#a855f7',
	'#d946ef',
	'#ec4899',
	'#f43f5e',
	'#64748b',
	'#6b7280',
	'#374151',
];

const TagsPage = () => {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedTag, setSelectedTag] = useState<TagWithImage | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [formData, setFormData] = useState<CreateTagRequest>({
		name: '',
		description: '',
		color: PRESET_COLORS[0],
		isActive: true,
		seoTitle: '',
		seoDescription: '',
	});
	const [editFormData, setEditFormData] = useState<UpdateTagRequest>({
		name: '',
		description: '',
		color: '',
		isActive: true,
		seoTitle: '',
		seoDescription: '',
	});

	// Get tags query
	const {
		data: tagsData,
		isLoading: isLoadingTags,
		error: tagsError,
	} = useQuery({
		queryKey: ['tags', currentPage, searchTerm],
		queryFn: () =>
			getTags({
				page: currentPage,
				limit: 20,
				search: searchTerm || undefined,
			}),
	});

	// Create tag mutation
	const createMutation = useMutation({
		mutationFn: createTag,
		onSuccess: (data) => {
			toast.success(data.message || 'Tạo tag thành công!');
			setOpen(false);
			resetForm();
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Tạo tag thất bại');
		},
	});

	// Update tag mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateTagRequest }) => updateTag(id, data),
		onSuccess: (data) => {
			toast.success(data.message || 'Cập nhật tag thành công!');
			setEditOpen(false);
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Cập nhật tag thất bại');
		},
	});

	// Delete tag mutation
	const deleteMutation = useMutation({
		mutationFn: deleteTag,
		onSuccess: (data) => {
			toast.success(data.message || 'Xóa tag thành công!');
			setDeleteOpen(false);
			setSelectedTag(null);
			queryClient.invalidateQueries({ queryKey: ['tags'] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Xóa tag thất bại');
		},
	});

	// Upload image mutation
	const uploadImageMutation = useMutation({
		mutationFn: ({ id, file }: { id: string; file: File }) => uploadTagImage(id, file),
		onSuccess: (data) => {
			toast.success('Upload ảnh thành công!');
			queryClient.invalidateQueries({ queryKey: ['tags'] });
			setPreviewImage(null);
			// Update selected tag to reflect new image
			if (selectedTag) {
				const updatedTag = { ...selectedTag, image: data.data.imageUrl };
				setSelectedTag(updatedTag);
			}
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Upload ảnh thất bại');
			setPreviewImage(null);
		},
	});

	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			color: PRESET_COLORS[0],
			isActive: true,
			seoTitle: '',
			seoDescription: '',
		});
	};

	const resetEditForm = () => {
		setEditFormData({
			name: '',
			description: '',
			color: '',
			isActive: true,
			seoTitle: '',
			seoDescription: '',
		});
	};

	// Populate edit form when opening edit dialog
	useEffect(() => {
		if (editOpen && selectedTag) {
			setEditFormData({
				name: selectedTag.name,
				description: selectedTag.description || '',
				color: selectedTag.color || PRESET_COLORS[0],
				isActive: selectedTag.isActive,
				seoTitle: selectedTag.seoTitle || '',
				seoDescription: selectedTag.seoDescription || '',
			});
		}
	}, [editOpen, selectedTag]);

	// Check if tag can be deleted
	const canDeleteTag = (tag: Tag): { canDelete: boolean; reason?: string } => {
		if (tag.postCount && tag.postCount > 0) {
			return {
				canDelete: false,
				reason: `Không thể xóa tag "${tag.name}" vì còn ${tag.postCount} bài viết. Vui lòng xóa hoặc chuyển tất cả bài viết trước.`,
			};
		}
		return { canDelete: true };
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setEditFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSwitchChange = (checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			isActive: checked,
		}));
	};

	const handleEditSwitchChange = (checked: boolean) => {
		setEditFormData((prev) => ({
			...prev,
			isActive: checked,
		}));
	};

	const handleColorChange = (color: string) => {
		setFormData((prev) => ({
			...prev,
			color,
		}));
	};

	const handleEditColorChange = (color: string) => {
		setEditFormData((prev) => ({
			...prev,
			color,
		}));
	};

	// Image upload handlers
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file size (10MB max)
		if (file.size > 10 * 1024 * 1024) {
			toast.error('Kích thước file không được vượt quá 10MB');
			return;
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error('Vui lòng chọn file ảnh hợp lệ');
			return;
		}

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setPreviewImage(e.target?.result as string);
		};
		reader.readAsDataURL(file);

		// Upload image
		if (selectedTag) {
			uploadImageMutation.mutate({ id: selectedTag.id, file });
		}
	};

	const triggerImageUpload = () => {
		fileInputRef.current?.click();
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) {
			toast.error('Tên tag không được để trống');
			return;
		}

		createMutation.mutate(formData);
	};

	const handleEditSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editFormData.name?.trim()) {
			toast.error('Tên tag không được để trống');
			return;
		}

		if (!selectedTag) return;

		updateMutation.mutate({
			id: selectedTag.id,
			data: editFormData,
		});
	};

	const handleEditTag = () => {
		if (selectedTag) {
			setEditOpen(true);
		}
	};

	const handleDeleteTag = () => {
		if (!selectedTag) return;

		const deleteCheck = canDeleteTag(selectedTag);
		if (!deleteCheck.canDelete) {
			toast.error(deleteCheck.reason);
			return;
		}

		setDeleteOpen(true);
	};

	const confirmDelete = () => {
		if (selectedTag) {
			deleteMutation.mutate(selectedTag.id);
		}
	};

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const renderColorPicker = (selectedColor: string, onColorChange: (color: string) => void) => (
		<div className='space-y-3'>
			<Label className='text-sm font-medium'>Màu sắc</Label>
			<div className='grid grid-cols-10 gap-2 p-4 bg-gray-50 rounded-lg'>
				{PRESET_COLORS.map((color) => (
					<button
						key={color}
						type='button'
						onClick={() => onColorChange(color)}
						className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color
							? 'border-gray-900 scale-110'
							: 'border-gray-200 hover:border-gray-400'
							}`}
						style={{ backgroundColor: color }}
					/>
				))}
			</div>
			<div className='flex items-center gap-2'>
				<Label className='text-xs text-gray-500'>Tùy chỉnh:</Label>
				<input
					type='color'
					value={selectedColor}
					onChange={(e) => onColorChange(e.target.value)}
					className='w-8 h-8 rounded border cursor-pointer'
				/>
			</div>
		</div>
	);

	const renderTagGrid = () => {
		if (!tagsData?.data || tagsData.data.length === 0) {
			return (
				<div className='col-span-full text-center py-2'>
					<div className='bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-200 rounded-xl p-12'>
						<TagIcon className='w-16 h-16 mx-auto mb-4 text-gray-300' />
						<p className='font-medium text-gray-700 mb-2'>
							{searchTerm ? 'Không tìm thấy tag nào' : 'Chưa có tag nào'}
						</p>
						<p className='text-sm text-gray-500 mb-6'>
							{searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Tạo tag đầu tiên để bắt đầu'}
						</p>
						{!searchTerm && (
							<Button
								variant='outline'
								onClick={() => setOpen(true)}
								className='bg-white hover:bg-blue-50'
							>
								<Plus className='w-4 h-4 mr-2' />
								Tạo tag đầu tiên
							</Button>
						)}
					</div>
				</div>
			);
		}

		return tagsData.data.map((tag) => (
			<Card
				key={tag.id}
				className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-slate-200 p-0 ${selectedTag?.id === tag.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
					}`}
				onClick={() => setSelectedTag(tag)}
			>
				<CardContent className='p-2'>
					<div className='flex items-start justify-between mb-4'>
						<div className='flex items-center gap-3'>
							{tag.image ? (
								<img
									src={tag.image}
									alt={tag.name}
									className='w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm'
								/>
							) : (
								<div
									className='w-4 h-4 rounded-full border-2 border-white shadow-sm'
									style={{ backgroundColor: tag.color || '#6b7280' }}
								/>
							)}
							<h3 className='font-semibold text-gray-900 flex-1 truncate w-24'>{tag.name}</h3>
						</div>
						{!tag.isActive && (
							<Badge variant='destructive' className='text-xs'>
								Inactive
							</Badge>
						)}
					</div>

					{tag.description && <p className='text-sm text-gray-600 mb-4 line-clamp-2'>{tag.description}</p>}

					<div className='flex items-center justify-between text-xs text-gray-500'>
						<span>ID: {tag.id.slice(-6)}</span>
						{tag.postCount !== undefined && (
							<Badge variant='secondary' className='text-xs'>
								{tag.postCount} posts
							</Badge>
						)}
					</div>
				</CardContent>
			</Card>
		));
	};

	const renderPagination = () => {
		if (!tagsData?.pagination || tagsData.pagination.pages <= 1) return null;

		const { page, pages } = tagsData.pagination;

		return (
			<div className='flex items-center justify-center gap-2 mt-8'>
				<Button variant='outline' size='sm' onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
					Trước
				</Button>

				<div className='flex items-center gap-1'>
					{Array.from({ length: Math.min(5, pages) }, (_, i) => {
						const pageNum = Math.max(1, Math.min(pages - 4, page - 2)) + i;
						return (
							<Button
								key={pageNum}
								variant={page === pageNum ? 'default' : 'outline'}
								size='sm'
								onClick={() => handlePageChange(pageNum)}
								className='w-10'
							>
								{pageNum}
							</Button>
						);
					})}
				</div>

				<Button variant='outline' size='sm' onClick={() => handlePageChange(page + 1)} disabled={page >= pages}>
					Sau
				</Button>
			</div>
		);
	};

	return (
		<div>
			<div className='mx-auto p-2 flex flex-col gap-4'>
				{/* Header */}
				<div className='flex flex-col gap-4'>
					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
						<div>
							<h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
								Tags
							</h1>
							<p className='text-gray-600 mt-2'>Quản lý thẻ tag và phân loại nội dung</p>
						</div>

						{/* Hidden file input for image upload */}
						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							onChange={handleImageUpload}
							className='hidden'
						/>

						{/* Create Tag Dialog */}
						<Dialog open={open} onOpenChange={setOpen}>
							<DialogTrigger asChild>
								<Button
									size='lg'
									className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200'
								>
									<Plus className='w-5 h-5 mr-2' />
									<span className='hidden sm:inline'>Tạo Tag</span>
									<span className='sm:hidden'>Tạo</span>
								</Button>
							</DialogTrigger>
							<DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
								<DialogHeader className='pb-4'>
									<DialogTitle className='text-2xl font-semibold'>Tạo Tag Mới</DialogTitle>
									<DialogDescription className='text-base'>
										Tạo tag mới để phân loại và tổ chức nội dung
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleSubmit} className='space-y-6'>
									{/* Basic Information */}
									<Card>
										<CardHeader>
											<CardTitle className='flex items-center gap-2'>
												<Settings className='w-5 h-5' />
												Thông tin cơ bản
											</CardTitle>
										</CardHeader>
										<CardContent className='space-y-4'>
											<div className='space-y-2'>
												<Label htmlFor='name' className='font-medium'>
													Tên Tag <span className='text-red-500'>*</span>
												</Label>
												<Input
													id='name'
													name='name'
													value={formData.name}
													onChange={handleInputChange}
													placeholder='Ví dụ: JavaScript, React, CSS...'
													className='h-12'
													required
												/>
											</div>

											<div className='space-y-2'>
												<Label htmlFor='description' className='font-medium'>
													Mô tả
												</Label>
												<Textarea
													id='description'
													name='description'
													value={formData.description}
													onChange={handleInputChange}
													placeholder='Mô tả ngắn gọn về tag này...'
													rows={3}
													className='resize-none'
												/>
											</div>

											{renderColorPicker(formData.color || PRESET_COLORS[0], handleColorChange)}

											<div className='flex items-center justify-between p-4 bg-gray-50 rounded-xl'>
												<div>
													<Label htmlFor='isActive' className='font-medium cursor-pointer'>
														Kích hoạt ngay
													</Label>
													<p className='text-sm text-gray-600'>Tag sẽ hiển thị công khai</p>
												</div>
												<Switch
													id='isActive'
													checked={formData.isActive}
													onCheckedChange={handleSwitchChange}
													className='data-[state=checked]:bg-green-500'
												/>
											</div>
										</CardContent>
									</Card>

									{/* SEO Settings */}
									<Card>
										<CardHeader>
											<CardTitle className='flex items-center gap-2'>
												<Eye className='w-5 h-5' />
												Tối ưu SEO (Tùy chọn)
											</CardTitle>
										</CardHeader>
										<CardContent className='space-y-4'>
											<div className='space-y-2'>
												<Label htmlFor='seoTitle' className='font-medium'>
													SEO Title
												</Label>
												<Input
													id='seoTitle'
													name='seoTitle'
													value={formData.seoTitle}
													onChange={handleInputChange}
													placeholder='Tiêu đề tối ưu cho công cụ tìm kiếm'
													className='h-12'
												/>
												<p className='text-xs text-gray-500'>Để trống sẽ sử dụng tên tag</p>
											</div>

											<div className='space-y-2'>
												<Label htmlFor='seoDescription' className='font-medium'>
													SEO Description
												</Label>
												<Textarea
													id='seoDescription'
													name='seoDescription'
													value={formData.seoDescription}
													onChange={handleInputChange}
													placeholder='Mô tả trang tag để hiển thị trên kết quả tìm kiếm'
													rows={2}
													className='resize-none'
												/>
											</div>
										</CardContent>
									</Card>

									<DialogFooter className='gap-3 pt-6'>
										<Button
											type='button'
											variant='outline'
											onClick={() => setOpen(false)}
											size='lg'
										>
											Hủy bỏ
										</Button>
										<Button
											type='submit'
											disabled={createMutation.isPending}
											size='lg'
											className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200'
										>
											{createMutation.isPending ? (
												<>
													<Loader2 className='w-5 h-5 mr-2 animate-spin' />
													Đang tạo...
												</>
											) : (
												<>
													<Plus className='w-5 h-5 mr-2' />
													Tạo Tag
												</>
											)}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>

						{/* Edit Tag Dialog */}
						<Dialog
							open={editOpen}
							onOpenChange={(open) => {
								setEditOpen(open);
								if (!open) resetEditForm();
							}}
						>
							<DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
								<DialogHeader className='pb-4'>
									<DialogTitle className='text-2xl font-semibold'>Chỉnh sửa Tag</DialogTitle>
									<DialogDescription className='text-base'>
										Cập nhật thông tin tag "{selectedTag?.name}"
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleEditSubmit} className='space-y-6'>
									{/* Basic Information */}
									<Card>
										<CardHeader>
											<CardTitle className='flex items-center gap-2'>
												<Settings className='w-5 h-5' />
												Thông tin cơ bản
											</CardTitle>
										</CardHeader>
										<CardContent className='space-y-4'>
											<div className='space-y-2'>
												<Label htmlFor='editName' className='font-medium'>
													Tên Tag <span className='text-red-500'>*</span>
												</Label>
												<Input
													id='editName'
													name='name'
													value={editFormData.name}
													onChange={handleEditInputChange}
													placeholder='Ví dụ: JavaScript, React, CSS...'
													className='h-12'
													required
												/>
											</div>

											<div className='space-y-2'>
												<Label htmlFor='editDescription' className='font-medium'>
													Mô tả
												</Label>
												<Textarea
													id='editDescription'
													name='description'
													value={editFormData.description}
													onChange={handleEditInputChange}
													placeholder='Mô tả ngắn gọn về tag này...'
													rows={3}
													className='resize-none'
												/>
											</div>

											{renderColorPicker(
												editFormData.color || PRESET_COLORS[0],
												handleEditColorChange
											)}

											<div className='flex items-center justify-between p-4 bg-gray-50 rounded-xl'>
												<div>
													<Label
														htmlFor='editIsActive'
														className='font-medium cursor-pointer'
													>
														Kích hoạt ngay
													</Label>
													<p className='text-sm text-gray-600'>Tag sẽ hiển thị công khai</p>
												</div>
												<Switch
													id='editIsActive'
													checked={editFormData.isActive}
													onCheckedChange={handleEditSwitchChange}
													className='data-[state=checked]:bg-green-500'
												/>
											</div>
										</CardContent>
									</Card>

									{/* SEO Settings */}
									<Card>
										<CardHeader>
											<CardTitle className='flex items-center gap-2'>
												<Eye className='w-5 h-5' />
												Tối ưu SEO (Tùy chọn)
											</CardTitle>
										</CardHeader>
										<CardContent className='space-y-4'>
											<div className='space-y-2'>
												<Label htmlFor='editSeoTitle' className='font-medium'>
													SEO Title
												</Label>
												<Input
													id='editSeoTitle'
													name='seoTitle'
													value={editFormData.seoTitle}
													onChange={handleEditInputChange}
													placeholder='Tiêu đề tối ưu cho công cụ tìm kiếm'
													className='h-12'
												/>
												<p className='text-xs text-gray-500'>Để trống sẽ sử dụng tên tag</p>
											</div>

											<div className='space-y-2'>
												<Label htmlFor='editSeoDescription' className='font-medium'>
													SEO Description
												</Label>
												<Textarea
													id='editSeoDescription'
													name='seoDescription'
													value={editFormData.seoDescription}
													onChange={handleEditInputChange}
													placeholder='Mô tả trang tag để hiển thị trên kết quả tìm kiếm'
													rows={2}
													className='resize-none'
												/>
											</div>
										</CardContent>
									</Card>

									<DialogFooter className='gap-3 pt-6'>
										<Button
											type='button'
											variant='outline'
											onClick={() => setEditOpen(false)}
											size='lg'
										>
											Hủy bỏ
										</Button>
										<Button
											type='submit'
											disabled={updateMutation.isPending}
											size='lg'
											className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
										>
											{updateMutation.isPending ? (
												<>
													<Loader2 className='w-5 h-5 mr-2 animate-spin' />
													Đang cập nhật...
												</>
											) : (
												<>
													<Save className='w-5 h-5 mr-2' />
													Cập nhật Tag
												</>
											)}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>

						{/* Delete Confirmation Dialog */}
						<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle className='flex items-center gap-3'>
										<div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center'>
											<Trash2 className='w-6 h-6 text-red-600' />
										</div>
										Xác nhận xóa Tag
									</AlertDialogTitle>
									<AlertDialogDescription className='space-y-3 pt-4'>
										<p className='text-base'>
											Bạn có chắc chắn muốn xóa tag{' '}
											<span className='font-semibold text-gray-900'>"{selectedTag?.name}"</span>?
										</p>

										{selectedTag && (
											<div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
												<div className='flex items-start gap-3'>
													<AlertTriangle className='w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0' />
													<div className='space-y-2'>
														<p className='font-medium text-amber-800'>Lưu ý quan trọng:</p>
														<ul className='text-sm text-amber-700 space-y-1'>
															<li>• Hành động này không thể hoàn tác</li>
															{selectedTag.postCount && selectedTag.postCount > 0 && (
																<li>• Tag này có {selectedTag.postCount} bài viết</li>
															)}
															<li>• Tất cả dữ liệu liên quan sẽ bị mất vĩnh viễn</li>
														</ul>
													</div>
												</div>
											</div>
										)}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter className='gap-3'>
									<AlertDialogCancel asChild>
										<Button variant='outline' size='lg'>
											Hủy bỏ
										</Button>
									</AlertDialogCancel>
									<AlertDialogAction asChild>
										<Button
											onClick={confirmDelete}
											disabled={deleteMutation.isPending}
											size='lg'
											className='bg-red-600 hover:bg-red-700 text-white'
										>
											{deleteMutation.isPending ? (
												<>
													<Loader2 className='w-5 h-5 mr-2 animate-spin' />
													Đang xóa...
												</>
											) : (
												<>
													<Trash2 className='w-5 h-5 mr-2' />
													Xóa Tag
												</>
											)}
										</Button>
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>

					{/* Search and Quick Actions */}
					<div className='flex flex-col sm:flex-row gap-4'>
						<div className='relative flex-1 max-w-md'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
							<Input
								placeholder='Tìm kiếm tag...'
								value={searchTerm}
								onChange={(e) => handleSearch(e.target.value)}
								className='pl-10 h-12 border-slate-200'
							/>
						</div>
						<Button
							variant='outline'
							size='sm'
							onClick={() => setOpen(true)}
							className='bg-white hover:bg-purple-50 border-purple-200 hover:border-purple-300 h-12'
						>
							<Plus className='w-4 h-4 mr-2' />
							Thêm Tag
						</Button>
					</div>
				</div>

				{/* Content */}
				<div className='grid grid-cols-1 xl:grid-cols-5 gap-2'>
					{/* Left Panel - Tags Grid */}
					<div className='xl:col-span-3'>
						<Card className='border-slate-200'>
							<CardHeader className='pb-4'>
								<div className='flex items-center justify-between'>
									<CardTitle className='flex items-center gap-2'>
										<TagIcon className='w-5 h-5' />
										Danh sách Tags
										{tagsData?.pagination && (
											<Badge variant='outline' className='ml-2 border-slate-200'>
												{tagsData.pagination.total} tags
											</Badge>
										)}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className='pt-0'>
								{isLoadingTags ? (
									<div className='flex items-center justify-center py-2'>
										<div className='text-center'>
											<Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-purple-500' />
											<p className='text-gray-500'>Đang tải tags...</p>
										</div>
									</div>
								) : tagsError ? (
									<div className='text-center py-2'>
										<div className='bg-red-50 border border-red-200 rounded-xl p-6'>
											<p className='text-red-600 font-medium'>Không thể tải danh sách tags</p>
											<p className='text-red-500 text-sm mt-1'>Vui lòng thử lại sau</p>
										</div>
									</div>
								) : (
									<>
										<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
											{renderTagGrid()}
										</div>
										{renderPagination()}
									</>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Right Panel - Tag Details */}
					<div className='xl:col-span-2'>
						<Card className='h-fit sticky top-6'>
							<CardContent className='p-6'>
								{selectedTag ? (
									<div className='space-y-6'>
										{/* Header with Image Upload */}
										<div className='text-center'>
											<div className='relative inline-block mb-4'>
												{selectedTag.image ? (
													<img
														src={selectedTag.image}
														alt={selectedTag.name}
														className='w-16 h-16 rounded-full mx-auto border-4 border-white shadow-lg object-cover'
													/>
												) : (
													<div
														className='w-16 h-16 rounded-full mx-auto border-4 border-white shadow-lg'
														style={{ backgroundColor: selectedTag.color || '#6b7280' }}
													/>
												)}
												{/* Upload Image Button */}
												<button
													onClick={triggerImageUpload}
													disabled={uploadImageMutation.isPending}
													className='absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg'
													title='Upload ảnh tag'
												>
													{uploadImageMutation.isPending ? (
														<Loader2 className='w-3 h-3 animate-spin' />
													) : (
														<Upload className='w-3 h-3' />
													)}
												</button>
											</div>

											<h2 className='text-xl font-bold text-gray-900 mb-2'>{selectedTag.name}</h2>
											<div className='flex items-center justify-center gap-2'>
												<Badge variant='outline' className='font-mono text-xs'>
													ID: {selectedTag.id.slice(-6)}
												</Badge>
												{selectedTag.slug && (
													<Badge variant='secondary' className='text-xs'>
														/{selectedTag.slug}
													</Badge>
												)}
											</div>
											<Badge
												variant={selectedTag.isActive ? 'default' : 'destructive'}
												className={`mt-3 ${selectedTag.isActive
													? 'bg-green-100 text-green-800 hover:bg-green-200'
													: 'bg-red-100 text-red-800 hover:bg-red-200'
													}`}
											>
												{selectedTag.isActive ? '🟢 Đang hoạt động' : '🔴 Tạm dừng'}
											</Badge>
										</div>

										{/* Image Preview */}
										{previewImage && (
											<div className='relative'>
												<div className='bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200'>
													<img
														src={previewImage}
														alt='Preview'
														className='w-full h-32 object-cover rounded-lg'
													/>
													<button
														onClick={() => setPreviewImage(null)}
														className='absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
													>
														<X className='w-3 h-3' />
													</button>
												</div>
												<p className='text-xs text-gray-500 mt-2 text-center'>
													{uploadImageMutation.isPending ? 'Đang upload...' : 'Ảnh đang được tải lên'}
												</p>
											</div>
										)}

										<Separator />

										{/* Actions */}
										<div className='flex flex-col gap-2'>
											<Button
												onClick={handleEditTag}
												size='sm'
												className='w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
											>
												<Edit className='w-4 h-4 mr-2' />
												Chỉnh sửa
											</Button>
											<Button
												onClick={triggerImageUpload}
												size='sm'
												variant='outline'
												className='w-full border-blue-200 hover:bg-blue-50'
												disabled={uploadImageMutation.isPending}
											>
												{uploadImageMutation.isPending ? (
													<>
														<Loader2 className='w-4 h-4 mr-2 animate-spin' />
														Đang upload...
													</>
												) : (
													<>
														<ImageIcon className='w-4 h-4 mr-2' />
														Upload ảnh
													</>
												)}
											</Button>
											<Button
												onClick={handleDeleteTag}
												size='sm'
												variant='destructive'
												className='w-full bg-red-500 hover:bg-red-600'
											>
												<Trash2 className='w-4 h-4 mr-2' />
												Xóa
											</Button>
										</div>

										<Separator />

										{/* Details */}
										<div className='space-y-4'>
											{selectedTag.description && (
												<div>
													<Label className='text-sm font-medium text-gray-600'>Mô tả</Label>
													<p className='text-gray-800 mt-1 text-sm leading-relaxed'>
														{selectedTag.description}
													</p>
												</div>
											)}

											<div>
												<Label className='text-sm font-medium text-gray-600'>
													{selectedTag.image ? 'Ảnh & Màu sắc' : 'Màu sắc'}
												</Label>
												<div className='flex items-center gap-3 mt-2'>
													{selectedTag.image && (
														<img
															src={selectedTag.image}
															alt={selectedTag.name}
															className='w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm'
														/>
													)}
													<div
														className='w-6 h-6 rounded-full border-2 border-white shadow-sm'
														style={{ backgroundColor: selectedTag.color || '#6b7280' }}
													/>
													<code className='text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded'>
														{selectedTag.color || '#6b7280'}
													</code>
												</div>
											</div>

											<div>
												<Label className='text-sm font-medium text-gray-600'>Số bài viết</Label>
												<p className='font-semibold text-gray-900 mt-1'>
													{selectedTag.postCount || 0} bài viết
												</p>
											</div>
										</div>

										{/* SEO Section */}
										{(selectedTag.seoTitle || selectedTag.seoDescription) && (
											<>
												<Separator />
												<div className='space-y-4'>
													<h3 className='font-medium text-gray-900 flex items-center gap-2'>
														<Eye className='w-4 h-4' />
														Tối ưu SEO
													</h3>
													{selectedTag.seoTitle && (
														<div>
															<Label className='text-sm font-medium text-gray-600'>
																Meta Title
															</Label>
															<p className='text-gray-800 mt-1 text-sm'>
																{selectedTag.seoTitle}
															</p>
														</div>
													)}
													{selectedTag.seoDescription && (
														<div>
															<Label className='text-sm font-medium text-gray-600'>
																Meta Description
															</Label>
															<p className='text-gray-800 mt-1 text-sm leading-relaxed'>
																{selectedTag.seoDescription}
															</p>
														</div>
													)}
												</div>
											</>
										)}

										{/* Timestamps */}
										<Separator />
										<div className='space-y-3 text-xs text-gray-500'>
											<div>
												<span className='font-medium'>Ngày tạo:</span>
												<p className='mt-1'>
													{new Date(selectedTag.createdAt).toLocaleDateString('vi-VN', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													})}
												</p>
											</div>
											<div>
												<span className='font-medium'>Cập nhật:</span>
												<p className='mt-1'>
													{new Date(selectedTag.updatedAt).toLocaleDateString('vi-VN', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													})}
												</p>
											</div>
										</div>
									</div>
								) : (
									<div className='text-center py-12'>
										<div className='bg-gradient-to-br from-gray-100 to-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-4'>
											<TagIcon className='w-8 h-8 text-gray-400 mx-auto' />
										</div>
										<h3 className='font-semibold text-gray-900 mb-2'>Chi tiết Tag</h3>
										<p className='text-gray-500 text-sm'>
											Chọn một tag từ danh sách để xem thông tin chi tiết
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TagsPage;