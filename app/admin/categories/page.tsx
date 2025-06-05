'use client';
import React, { useState, useEffect, Fragment } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	Plus,
	Loader2,
	ChevronRight,
	ChevronDown,
	Folder,
	FolderOpen,
	Settings,
	Eye,
	Edit,
	Save,
	X,
	Trash2,
	AlertTriangle,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
	Category,
	createCategory,
	updateCategory,
	deleteCategory,
	CreateCategoryRequest,
	UpdateCategoryRequest,
	getCategories,
} from '@/services/categories-service';

const CategoriesPage = () => {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
	const [categoryType, setCategoryType] = useState<'root' | 'subcategory'>('root');
	const [editCategoryType, setEditCategoryType] = useState<'root' | 'subcategory'>('root');
	const [formData, setFormData] = useState<CreateCategoryRequest>({
		name: '',
		description: '',
		icon: '',
		parentId: '',
		order: 0,
		isActive: true,
		seoTitle: '',
		seoDescription: '',
		seoKeywords: [],
	});
	const [editFormData, setEditFormData] = useState<UpdateCategoryRequest>({
		name: '',
		description: '',
		icon: '',
		parentId: '',
		order: 0,
		isActive: true,
		seoTitle: '',
		seoDescription: '',
		seoKeywords: [],
	});

	// Get categories query
	const {
		data: categoriesData,
		isLoading: isLoadingCategories,
		error: categoriesError,
	} = useQuery({
		queryKey: ['categories'],
		queryFn: () => getCategories({ includeChildren: true, limit: 100 }),
	});

	// Create category mutation
	const createMutation = useMutation({
		mutationFn: createCategory,
		onSuccess: (data) => {
			toast.success(data.message || 'Tạo category thành công!');
			setOpen(false);
			resetForm();
			queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Tạo category thất bại');
		},
	});

	// Update category mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) => updateCategory(id, data),
		onSuccess: (data) => {
			toast.success(data.message || 'Cập nhật category thành công!');
			setEditOpen(false);
			queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Cập nhật category thất bại');
		},
	});

	// Delete category mutation
	const deleteMutation = useMutation({
		mutationFn: deleteCategory,
		onSuccess: (data) => {
			toast.success(data.message || 'Xóa category thành công!');
			setDeleteOpen(false);
			setSelectedCategory(null);
			queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Xóa category thất bại');
		},
	});

	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			icon: '',
			parentId: '',
			order: 0,
			isActive: true,
			seoTitle: '',
			seoDescription: '',
			seoKeywords: [],
		});
		setCategoryType('root');
	};

	const resetEditForm = () => {
		setEditFormData({
			name: '',
			description: '',
			icon: '',
			parentId: '',
			order: 0,
			isActive: true,
			seoTitle: '',
			seoDescription: '',
			seoKeywords: [],
		});
		setEditCategoryType('root');
	};

	// Populate edit form when opening edit dialog
	useEffect(() => {
		if (editOpen && selectedCategory) {
			setEditFormData({
				name: selectedCategory.name,
				description: selectedCategory.description || '',
				icon: selectedCategory.icon || '',
				parentId: selectedCategory.parentId || '',
				order: selectedCategory.order,
				isActive: selectedCategory.isActive,
				seoTitle: selectedCategory.seoTitle || '',
				seoDescription: selectedCategory.seoDescription || '',
				seoKeywords: selectedCategory.seoKeywords || [],
			});
			setEditCategoryType(selectedCategory.parentId ? 'subcategory' : 'root');
		}
	}, [editOpen, selectedCategory]);

	// Check if category can be deleted
	const canDeleteCategory = (category: Category): { canDelete: boolean; reason?: string } => {
		// Check if it's a root category with children
		if (!category.parentId && category.children && category.children.length > 0) {
			return {
				canDelete: false,
				reason: `Không thể xóa category gốc "${category.name}" vì còn ${category.children.length} subcategory. Vui lòng xóa tất cả subcategory trước.`,
			};
		}

		// Check if category has posts
		if (category.postCount && category.postCount > 0) {
			return {
				canDelete: false,
				reason: `Không thể xóa category "${category.name}" vì còn ${category.postCount} bài viết. Vui lòng chuyển hoặc xóa tất cả bài viết trước.`,
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

	const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const keywords = e.target.value
			.split(',')
			.map((keyword) => keyword.trim())
			.filter(Boolean);
		setFormData((prev) => ({
			...prev,
			seoKeywords: keywords,
		}));
	};

	const handleEditKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const keywords = e.target.value
			.split(',')
			.map((keyword) => keyword.trim())
			.filter(Boolean);
		setEditFormData((prev) => ({
			...prev,
			seoKeywords: keywords,
		}));
	};

	const handleCategoryTypeChange = (value: 'root' | 'subcategory') => {
		setCategoryType(value);
		setFormData((prev) => ({
			...prev,
			parentId: value === 'root' ? '' : prev.parentId,
		}));
	};

	const handleEditCategoryTypeChange = (value: 'root' | 'subcategory') => {
		setEditCategoryType(value);
		setEditFormData((prev) => ({
			...prev,
			parentId: value === 'root' ? '' : prev.parentId,
		}));
	};

	const handleParentChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			parentId: value,
		}));
	};

	const handleEditParentChange = (value: string) => {
		setEditFormData((prev) => ({
			...prev,
			parentId: value,
		}));
	};

	const toggleExpand = (categoryId: string) => {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(categoryId)) {
			newExpanded.delete(categoryId);
		} else {
			newExpanded.add(categoryId);
		}
		setExpandedCategories(newExpanded);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) {
			toast.error('Tên category không được để trống');
			return;
		}

		// Auto calculate order based on existing categories
		const siblings =
			categoryType === 'root'
				? categoriesData?.data?.filter((cat) => !cat.parentId) || []
				: categoriesData?.data?.find((cat) => cat.id === formData.parentId)?.children || [];

		const nextOrder = Math.max(0, ...siblings.map((cat) => cat.order)) + 1;

		// Base payload without parentId
		const payload: any = {
			name: formData.name,
			description: formData.description || '',
			icon: formData.icon || '',
			order: nextOrder,
			isActive: formData.isActive,
			seoTitle: formData.seoTitle || '',
			seoDescription: formData.seoDescription || '',
			seoKeywords: formData.seoKeywords || [],
		};

		// Only add parentId if it's a subcategory and parentId exists
		if (categoryType === 'subcategory' && formData.parentId) {
			payload.parentId = formData.parentId;
		}

		createMutation.mutate(payload);
	};

	const handleEditSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editFormData.name?.trim()) {
			toast.error('Tên category không được để trống');
			return;
		}

		if (!selectedCategory) return;

		// Base payload without parentId
		const payload: any = {
			name: editFormData.name,
			description: editFormData.description || '',
			icon: editFormData.icon || '',
			order: editFormData.order,
			isActive: editFormData.isActive,
			seoTitle: editFormData.seoTitle || '',
			seoDescription: editFormData.seoDescription || '',
			seoKeywords: editFormData.seoKeywords || [],
		};

		// Only add parentId if it's a subcategory and parentId exists
		if (editCategoryType === 'subcategory' && editFormData.parentId) {
			payload.parentId = editFormData.parentId;
		}

		updateMutation.mutate({
			id: selectedCategory.id,
			data: payload,
		});
	};

	const handleEditCategory = () => {
		if (selectedCategory) {
			setEditOpen(true);
		}
	};

	const handleDeleteCategory = () => {
		if (!selectedCategory) return;

		const deleteCheck = canDeleteCategory(selectedCategory);
		if (!deleteCheck.canDelete) {
			toast.error(deleteCheck.reason);
			return;
		}

		setDeleteOpen(true);
	};

	const confirmDelete = () => {
		if (selectedCategory) {
			deleteMutation.mutate(selectedCategory.id);
		}
	};

	const handleCollapseAll = () => {
		setExpandedCategories(new Set());
	};

	const handleExpandAll = () => {
		const allIds = new Set<string>();
		const collectIds = (categories: Category[]) => {
			categories.forEach((cat) => {
				allIds.add(cat.id);
				if (cat.children) collectIds(cat.children);
			});
		};
		if (categoriesData?.data) {
			collectIds(categoriesData.data);
		}
		setExpandedCategories(allIds);
	};

	// Get all root categories for parent selection
	const getRootCategories = (): Category[] => {
		return categoriesData?.data?.filter((cat) => !cat.parentId) || [];
	};

	// Get available parent categories for editing (excluding current category and its children)
	const getAvailableParentCategories = (): Category[] => {
		if (!selectedCategory) return getRootCategories();

		const rootCategories = getRootCategories();
		return rootCategories.filter((cat) => cat.id !== selectedCategory.id);
	};

	const renderCategoryTree = (categories: Category[], level = 0) => {
		return categories.map((category) => (
			<div key={category.id} className={`ml-${level * 3}`}>
				<div
					className={`group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-sm ${selectedCategory?.id === category.id
						? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md border-l-4 border-blue-500'
						: 'hover:shadow-sm'
						}`}
					onClick={() => setSelectedCategory(category)}
				>
					{category.children && category.children.length > 0 ? (
						<button
							onClick={(e) => {
								e.stopPropagation();
								toggleExpand(category.id);
							}}
							className='p-1.5 hover:bg-white/70 rounded-lg transition-colors'
						>
							{expandedCategories.has(category.id) ? (
								<ChevronDown className='w-4 h-4 text-gray-600' />
							) : (
								<ChevronRight className='w-4 h-4 text-gray-600' />
							)}
						</button>
					) : (
						<div />
					)}

					<div className='flex items-center gap-2 flex-1 min-w-0'>
						{expandedCategories.has(category.id) && category.children?.length ? (
							<FolderOpen className='w-5 h-5 text-blue-500 flex-shrink-0' />
						) : (
							<Folder className='w-5 h-5 text-gray-500 flex-shrink-0' />
						)}

						<div className='flex-1 min-w-0'>
							<div className='flex items-center justify-between'>
								<span className='font-medium text-gray-900 truncate'>{category.name}</span>
								{category.postCount !== undefined && category.postCount >= 0 && (
									<Badge variant='secondary' className='text-xs'>
										{category.postCount}
									</Badge>
								)}
							</div>
						</div>

						{!category.isActive && (
							<Badge variant='destructive' className='text-xs'>
								Inactive
							</Badge>
						)}
					</div>
				</div>

				{category.children && category.children.length > 0 && expandedCategories.has(category.id) && (
					<div className='ml-4 mt-1 border-l-2 border-gray-100'>
						{renderCategoryTree(category.children, level + 1)}
					</div>
				)}
			</div>
		));
	};

	return (
		<Fragment>
			<div className='mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
						<div>
							<h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
								Categories
							</h1>
							<p className='text-gray-600 mt-2'>Quản lý danh mục và phân loại nội dung</p>
						</div>

						{/* Create Category Dialog */}
						<Dialog open={open} onOpenChange={setOpen}>
							<DialogTrigger asChild>
								<Button
									size='lg'
									className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200'
								>
									<Plus className='w-5 h-5 mr-2' />
									<span className='hidden sm:inline'>Tạo Category</span>
									<span className='sm:hidden'>Tạo</span>
								</Button>
							</DialogTrigger>
							<DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
								<DialogHeader className='pb-4'>
									<DialogTitle className='text-2xl font-semibold'>Tạo Category Mới</DialogTitle>
									<DialogDescription className='text-base'>
										Tạo danh mục mới để tổ chức và phân loại nội dung
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleSubmit} className='space-y-6'>
									{/* Category Type Selection */}
									<Card className='border-2 border-dashed border-gray-200'>
										<CardContent className='pt-6'>
											<div className='space-y-3'>
												<Label className='text-base font-medium'>Loại Category</Label>
												<Select value={categoryType} onValueChange={handleCategoryTypeChange}>
													<SelectTrigger className='h-12'>
														<SelectValue placeholder='Chọn loại category' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='root' className='p-3'>
															<div className='flex items-center gap-3'>
																<Folder className='w-5 h-5 text-blue-500' />
																<div>
																	<div className='font-medium'>Root Category</div>
																	<div className='text-sm text-gray-500'>
																		Category cấp cao nhất
																	</div>
																</div>
															</div>
														</SelectItem>
														<SelectItem value='subcategory' className='p-3'>
															<div className='flex items-center gap-3'>
																<FolderOpen className='w-5 h-5 text-indigo-500' />
																<div>
																	<div className='font-medium'>Subcategory</div>
																	<div className='text-sm text-gray-500'>
																		Category con thuộc category khác
																	</div>
																</div>
															</div>
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</CardContent>
									</Card>

									{/* Parent Category Selection */}
									{categoryType === 'subcategory' && (
										<Card>
											<CardContent className='pt-6'>
												<div className='space-y-3'>
													<Label htmlFor='parentId' className='text-base font-medium'>
														Category Cha <span className='text-red-500'>*</span>
													</Label>
													<Select
														value={formData.parentId}
														onValueChange={handleParentChange}
													>
														<SelectTrigger className='h-12'>
															<SelectValue placeholder='Chọn category cha' />
														</SelectTrigger>
														<SelectContent>
															{getRootCategories().map((category) => (
																<SelectItem
																	key={category.id}
																	value={category.id}
																	className='p-3'
																>
																	<div className='flex items-center gap-3'>
																		<Folder className='w-4 h-4 text-gray-500' />
																		<span>{category.name}</span>
																	</div>
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</CardContent>
										</Card>
									)}

									{/* Basic Information */}
									<Card>
										<CardHeader>
											<CardTitle className='flex items-center gap-2'>
												<Settings className='w-5 h-5' />
												Thông tin cơ bản
											</CardTitle>
										</CardHeader>
										<CardContent className='space-y-4'>
											<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='name' className='font-medium'>
														Tên Category <span className='text-red-500'>*</span>
													</Label>
													<Input
														id='name'
														name='name'
														value={formData.name}
														onChange={handleInputChange}
														placeholder='Ví dụ: Công nghệ, Thể thao...'
														className='h-12'
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='icon' className='font-medium'>
														Icon
													</Label>
													<Input
														id='icon'
														name='icon'
														value={formData.icon}
														onChange={handleInputChange}
														placeholder='laptop, smartphone, book...'
														className='h-12'
													/>
												</div>
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
													placeholder='Mô tả ngắn gọn về danh mục này...'
													rows={3}
													className='resize-none'
												/>
											</div>

											<div className='flex items-center justify-between p-4 bg-gray-50 rounded-xl'>
												<div>
													<Label htmlFor='isActive' className='font-medium cursor-pointer'>
														Kích hoạt ngay
													</Label>
													<p className='text-sm text-gray-600'>
														Category sẽ hiển thị công khai
													</p>
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
												<p className='text-xs text-gray-500'>
													Để trống sẽ sử dụng tên category
												</p>
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
													placeholder='Mô tả trang category để hiển thị trên kết quả tìm kiếm'
													rows={2}
													className='resize-none'
												/>
											</div>

											<div className='space-y-2'>
												<Label htmlFor='seoKeywords' className='font-medium'>
													SEO Keywords
												</Label>
												<Input
													id='seoKeywords'
													name='seoKeywords'
													value={formData.seoKeywords?.join(', ')}
													onChange={handleKeywordsChange}
													placeholder='từ khóa 1, từ khóa 2, từ khóa 3'
													className='h-12'
												/>
												<p className='text-xs text-gray-500'>
													Phân cách bằng dấu phẩy. Ví dụ: công nghệ, laptop, điện thoại
												</p>
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
											className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
										>
											{createMutation.isPending ? (
												<>
													<Loader2 className='w-5 h-5 mr-2 animate-spin' />
													Đang tạo...
												</>
											) : (
												<>
													<Plus className='w-5 h-5 mr-2' />
													Tạo {categoryType === 'root' ? 'Root Category' : 'Subcategory'}
												</>
											)}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>

						{/* Edit Category Dialog */}
						<Dialog
							open={editOpen}
							onOpenChange={(open) => {
								setEditOpen(open);
								if (!open) resetEditForm();
							}}
						>
							<DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
								<DialogHeader className='pb-4'>
									<DialogTitle className='text-2xl font-semibold'>Chỉnh sửa Category</DialogTitle>
									<DialogDescription className='text-base'>
										Cập nhật thông tin danh mục "{selectedCategory?.name}"
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleEditSubmit} className='space-y-6'>
									{/* Category Type Selection */}
									<Card className='border-2 border-dashed border-gray-200'>
										<CardContent className='pt-6'>
											<div className='space-y-3'>
												<Label className='text-base font-medium'>Loại Category</Label>
												<Select
													value={editCategoryType}
													onValueChange={handleEditCategoryTypeChange}
												>
													<SelectTrigger className='h-12'>
														<SelectValue placeholder='Chọn loại category' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='root' className='p-3'>
															<div className='flex items-center gap-3'>
																<Folder className='w-5 h-5 text-blue-500' />
																<div>
																	<div className='font-medium'>Root Category</div>
																	<div className='text-sm text-gray-500'>
																		Category cấp cao nhất
																	</div>
																</div>
															</div>
														</SelectItem>
														<SelectItem value='subcategory' className='p-3'>
															<div className='flex items-center gap-3'>
																<FolderOpen className='w-5 h-5 text-indigo-500' />
																<div>
																	<div className='font-medium'>Subcategory</div>
																	<div className='text-sm text-gray-500'>
																		Category con thuộc category khác
																	</div>
																</div>
															</div>
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</CardContent>
									</Card>

									{/* Parent Category Selection */}
									{editCategoryType === 'subcategory' && (
										<Card>
											<CardContent className='pt-6'>
												<div className='space-y-3'>
													<Label htmlFor='editParentId' className='text-base font-medium'>
														Category Cha <span className='text-red-500'>*</span>
													</Label>
													<Select
														value={editFormData.parentId}
														onValueChange={handleEditParentChange}
													>
														<SelectTrigger className='h-12'>
															<SelectValue placeholder='Chọn category cha' />
														</SelectTrigger>
														<SelectContent>
															{getAvailableParentCategories().map((category) => (
																<SelectItem
																	key={category.id}
																	value={category.id}
																	className='p-3'
																>
																	<div className='flex items-center gap-3'>
																		<Folder className='w-4 h-4 text-gray-500' />
																		<span>{category.name}</span>
																	</div>
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</CardContent>
										</Card>
									)}

									{/* Basic Information */}
									<Card>
										<CardHeader>
											<CardTitle className='flex items-center gap-2'>
												<Settings className='w-5 h-5' />
												Thông tin cơ bản
											</CardTitle>
										</CardHeader>
										<CardContent className='space-y-4'>
											<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='editName' className='font-medium'>
														Tên Category <span className='text-red-500'>*</span>
													</Label>
													<Input
														id='editName'
														name='name'
														value={editFormData.name}
														onChange={handleEditInputChange}
														placeholder='Ví dụ: Công nghệ, Thể thao...'
														className='h-12'
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='editIcon' className='font-medium'>
														Icon
													</Label>
													<Input
														id='editIcon'
														name='icon'
														value={editFormData.icon}
														onChange={handleEditInputChange}
														placeholder='laptop, smartphone, book...'
														className='h-12'
													/>
												</div>
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
													placeholder='Mô tả ngắn gọn về danh mục này...'
													rows={3}
													className='resize-none'
												/>
											</div>

											<div className='flex items-center justify-between p-4 bg-gray-50 rounded-xl'>
												<div>
													<Label
														htmlFor='editIsActive'
														className='font-medium cursor-pointer'
													>
														Kích hoạt ngay
													</Label>
													<p className='text-sm text-gray-600'>
														Category sẽ hiển thị công khai
													</p>
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
												<p className='text-xs text-gray-500'>
													Để trống sẽ sử dụng tên category
												</p>
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
													placeholder='Mô tả trang category để hiển thị trên kết quả tìm kiếm'
													rows={2}
													className='resize-none'
												/>
											</div>

											<div className='space-y-2'>
												<Label htmlFor='editSeoKeywords' className='font-medium'>
													SEO Keywords
												</Label>
												<Input
													id='editSeoKeywords'
													name='seoKeywords'
													value={editFormData.seoKeywords?.join(', ')}
													onChange={handleEditKeywordsChange}
													placeholder='từ khóa 1, từ khóa 2, từ khóa 3'
													className='h-12'
												/>
												<p className='text-xs text-gray-500'>
													Phân cách bằng dấu phẩy. Ví dụ: công nghệ, laptop, điện thoại
												</p>
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
													Cập nhật Category
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
										Xác nhận xóa Category
									</AlertDialogTitle>
									<AlertDialogDescription className='space-y-3 pt-4'>
										<p className='text-base'>
											Bạn có chắc chắn muốn xóa category{' '}
											<span className='font-semibold text-gray-900'>
												"{selectedCategory?.name}"
											</span>
											?
										</p>

										{selectedCategory && (
											<div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
												<div className='flex items-start gap-3'>
													<AlertTriangle className='w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0' />
													<div className='space-y-2'>
														<p className='font-medium text-amber-800'>Lưu ý quan trọng:</p>
														<ul className='text-sm text-amber-700 space-y-1'>
															<li>• Hành động này không thể hoàn tác</li>
															{!selectedCategory.parentId && (
																<li>
																	• Đây là category gốc - đảm bảo không còn
																	subcategory
																</li>
															)}
															{selectedCategory.postCount &&
																selectedCategory.postCount > 0 && (
																	<li>
																		• Category này có {selectedCategory.postCount}{' '}
																		bài viết
																	</li>
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
													Xóa Category
												</>
											)}
										</Button>
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>

					{/* Quick Action Buttons */}
					<div className='flex flex-wrap gap-3 mt-6'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => {
								setCategoryType('root');
								setOpen(true);
							}}
							className='bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300'
						>
							<Plus className='w-4 h-4 mr-2' />
							Add Root Category
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={() => {
								setCategoryType('subcategory');
								setOpen(true);
							}}
							disabled={getRootCategories().length === 0}
							className='bg-white hover:bg-indigo-50 border-indigo-200 hover:border-indigo-300'
						>
							<Plus className='w-4 h-4 mr-2' />
							Add Subcategory
						</Button>
					</div>
				</div>

				{/* Content */}
				<div className='grid grid-cols-1 xl:grid-cols-7 gap-6'>
					{/* Left Panel - Category Tree */}
					<div className='xl:col-span-2'>
						<Card className='h-fit sticky top-6 border-slate-200'>
							<CardHeader className='p-4'>
								<div className='flex items-center justify-between'>
									<CardTitle className='flex items-center gap-2'>
										<Folder className='w-5 h-5' />
										Danh mục
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className='p-2'>
								<div className='max-h-[600px] overflow-y-auto space-y-1'>
									{isLoadingCategories ? (
										<div className='flex items-center justify-center py-4'>
											<div className='text-center'>
												<Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-blue-500' />
												<p className='text-gray-500'>Đang tải danh mục...</p>
											</div>
										</div>
									) : categoriesError ? (
										<div className='text-center py-12'>
											<div className='bg-red-50 border border-red-200 rounded-xl p-6'>
												<p className='text-red-600 font-medium'>Không thể tải danh mục</p>
												<p className='text-red-500 text-sm mt-1'>Vui lòng thử lại sau</p>
											</div>
										</div>
									) : categoriesData?.data && categoriesData.data.length > 0 ? (
										renderCategoryTree(categoriesData.data.filter((cat) => !cat.parentId))
									) : (
										<div className='text-center py-4'>
											<div className='bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-200 rounded-xl p-8'>
												<Folder className='w-12 h-12 mx-auto mb-4 text-gray-300' />
												<p className='font-medium text-gray-700 mb-2'>Chưa có danh mục nào</p>
												<p className='text-sm text-gray-500 mb-4'>
													Tạo category đầu tiên để bắt đầu
												</p>
												<Button
													variant='outline'
													onClick={() => {
														setCategoryType('root');
														setOpen(true);
													}}
													className='bg-white hover:bg-blue-50'
												>
													<Plus className='w-4 h-4 mr-2' />
													Tạo category đầu tiên
												</Button>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Panel - Category Details */}
					<div className='xl:col-span-5'>
						<Card className='min-h-[600px] border-slate-200'>
							<CardContent className='p-8'>
								{selectedCategory ? (
									<div className='space-y-8'>
										{/* Header */}
										<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
											<div className='flex-1 min-w-0'>
												<h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words'>
													{selectedCategory.name}
												</h2>
												<div className='flex flex-wrap items-center gap-3'>
													<Badge variant='outline' className='font-mono'>
														ID: {selectedCategory.id}
													</Badge>
													{selectedCategory.slug && (
														<Badge variant='secondary'>/{selectedCategory.slug}</Badge>
													)}
												</div>
											</div>
											<div className='flex items-center gap-3'>
												<Badge
													variant={selectedCategory.isActive ? 'default' : 'destructive'}
													className={`${selectedCategory.isActive
														? 'bg-green-100 text-green-800 hover:bg-green-200'
														: 'bg-red-100 text-red-800 hover:bg-red-200'
														} px-4 py-2`}
												>
													{selectedCategory.isActive ? '🟢 Đang hoạt động' : '🔴 Tạm dừng'}
												</Badge>
												<Button
													onClick={handleEditCategory}
													size='sm'
													className='bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
												>
													<Edit className='w-4 h-4 mr-2' />
													Chỉnh sửa
												</Button>
												<Button
													onClick={handleDeleteCategory}
													size='sm'
													variant='destructive'
													className='bg-red-500 hover:bg-red-600'
												>
													<Trash2 className='w-4 h-4 mr-2' />
													Xóa
												</Button>
											</div>
										</div>

										<Separator />

										{/* Content Grid */}
										<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
											{/* Content Section */}
											<Card className='border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/30'>
												<CardHeader>
													<CardTitle className='flex items-center gap-2 text-lg'>
														<Settings className='w-5 h-5 text-blue-600' />
														Nội dung
													</CardTitle>
												</CardHeader>
												<CardContent className='space-y-4'>
													<div>
														<Label className='text-sm font-medium text-gray-600'>
															Tên danh mục
														</Label>
														<p className='font-semibold text-gray-900 mt-1'>
															{selectedCategory.name}
														</p>
													</div>
													{selectedCategory.description && (
														<div>
															<Label className='text-sm font-medium text-gray-600'>
																Mô tả
															</Label>
															<p className='text-gray-800 mt-1 leading-relaxed'>
																{selectedCategory.description}
															</p>
														</div>
													)}
													{selectedCategory.slug && (
														<div>
															<Label className='text-sm font-medium text-gray-600'>
																URL Slug
															</Label>
															<code className='block mt-1 px-3 py-2 bg-white border rounded-lg font-mono text-sm text-gray-800'>
																/{selectedCategory.slug}
															</code>
														</div>
													)}
												</CardContent>
											</Card>

											{/* Display Settings */}
											<Card className='border-0 shadow-sm bg-gradient-to-br from-emerald-50/50 to-teal-50/30'>
												<CardHeader>
													<CardTitle className='flex items-center gap-2 text-lg'>
														<Eye className='w-5 h-5 text-emerald-600' />
														Hiển thị
													</CardTitle>
												</CardHeader>
												<CardContent className='space-y-4'>
													<div className='flex items-center justify-between'>
														<div>
															<Label className='text-sm font-medium text-gray-600'>
																Thứ tự sắp xếp
															</Label>
															<p className='font-semibold text-gray-900 mt-1'>
																{selectedCategory.order}
															</p>
														</div>
														<Badge variant='outline' className='bg-white'>
															#{selectedCategory.order}
														</Badge>
													</div>
													{selectedCategory.icon && (
														<div>
															<Label className='text-sm font-medium text-gray-600'>
																Icon
															</Label>
															<div className='flex items-center gap-2 mt-1'>
																<code className='px-2 py-1 bg-white border rounded text-sm font-mono'>
																	{selectedCategory.icon}
																</code>
															</div>
														</div>
													)}
													<div className='flex items-center justify-between'>
														<div>
															<Label className='text-sm font-medium text-gray-600'>
																Số bài viết
															</Label>
															<p className='font-semibold text-gray-900 mt-1'>
																{selectedCategory.postCount || 0}
															</p>
														</div>
														<Badge variant='secondary' className='bg-white'>
															{selectedCategory.postCount || 0} posts
														</Badge>
													</div>
												</CardContent>
											</Card>
										</div>

										{/* SEO Section */}
										{(selectedCategory.seoTitle ||
											selectedCategory.seoDescription ||
											selectedCategory.seoKeywords?.length) && (
												<>
													<Separator />
													<Card className='border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-pink-50/30'>
														<CardHeader>
															<CardTitle className='flex items-center gap-2 text-lg'>
																<Eye className='w-5 h-5 text-purple-600' />
																Tối ưu SEO
															</CardTitle>
														</CardHeader>
														<CardContent className='space-y-4'>
															{selectedCategory.seoTitle && (
																<div>
																	<Label className='text-sm font-medium text-gray-600'>
																		Meta Title
																	</Label>
																	<p className='text-gray-800 mt-1 font-medium'>
																		{selectedCategory.seoTitle}
																	</p>
																</div>
															)}
															{selectedCategory.seoDescription && (
																<div>
																	<Label className='text-sm font-medium text-gray-600'>
																		Meta Description
																	</Label>
																	<p className='text-gray-800 mt-1 leading-relaxed'>
																		{selectedCategory.seoDescription}
																	</p>
																</div>
															)}
															{selectedCategory.seoKeywords?.length && (
																<div>
																	<Label className='text-sm font-medium text-gray-600'>
																		Keywords
																	</Label>
																	<div className='flex flex-wrap gap-2 mt-2'>
																		{selectedCategory.seoKeywords.map(
																			(keyword, index) => (
																				<Badge
																					key={index}
																					variant='outline'
																					className='bg-white border-purple-200 text-purple-700'
																				>
																					{keyword}
																				</Badge>
																			)
																		)}
																	</div>
																</div>
															)}
														</CardContent>
													</Card>
												</>
											)}

										{/* Timestamps */}
										<Separator />
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500'>
											<div className='flex items-center gap-2'>
												<span className='font-medium'>Ngày tạo:</span>
												<span>
													{new Date(selectedCategory.createdAt).toLocaleDateString('vi-VN', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													})}
												</span>
											</div>
											<div className='flex items-center gap-2'>
												<span className='font-medium'>Cập nhật:</span>
												<span>
													{new Date(selectedCategory.updatedAt).toLocaleDateString('vi-VN', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													})}
												</span>
											</div>
										</div>
									</div>
								) : (
									<div className='flex flex-col items-center justify-center py-20 text-center'>
										<div className='bg-gradient-to-br from-gray-100 to-blue-100 rounded-full p-8 mb-6'>
											<Folder className='w-16 h-16 text-gray-400' />
										</div>
										<h3 className='text-xl font-semibold text-gray-900 mb-2'>Chi tiết danh mục</h3>
										<p className='text-gray-500 max-w-sm'>
											Chọn một danh mục từ danh sách bên trái để xem thông tin chi tiết và cài đặt
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</Fragment>
	);
};

export default CategoriesPage;
