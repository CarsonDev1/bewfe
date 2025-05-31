'use client';

import { useState } from 'react';
import { UseFormGetValues, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Search, Package, AlertCircle, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PostFormData, Product, ProductsResponse, RelatedProduct } from '@/types';
import {
	getTechnologyNewsProducts,
	getBgamesProducts,
	getAdviseProducts,
	getOnhandProducts,
	getEvaluateProducts,
	getTrickProducts,
	getPromotionProducts,
	getProductsByCategory,
} from '@/services/product-service';

interface RelatedProductsSectionProps {
	getValues: UseFormGetValues<PostFormData>;
	setValue: UseFormSetValue<PostFormData>;
	watch: UseFormWatch<PostFormData>;
}

const MAX_PRODUCTS = 8;

// Define available product categories
const PRODUCT_CATEGORIES = [
	{ value: 'technology-news', label: 'Tin tức công nghệ', service: getTechnologyNewsProducts },
	{ value: 'bgames', label: 'Games', service: getBgamesProducts },
	{ value: 'advise', label: 'Tư vấn', service: getAdviseProducts },
	{ value: 'onhand', label: 'Trên tay', service: getOnhandProducts },
	{ value: 'evaluate', label: 'Đánh giá', service: getEvaluateProducts },
	{ value: 'trick', label: 'Thủ thuật', service: getTrickProducts },
	{ value: 'promotion', label: 'Khuyến mãi', service: getPromotionProducts },
] as const;

export const RelatedProductsSection = ({ getValues, setValue, watch }: RelatedProductsSectionProps) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [showProductsList, setShowProductsList] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>('technology-news');
	const watchedRelatedProducts = watch('relatedProducts') || [];

	// Get the service function for the selected category
	const getProductsFunction =
		PRODUCT_CATEGORIES.find((cat) => cat.value === selectedCategory)?.service || getTechnologyNewsProducts;

	// Fetch products from API based on selected category
	const {
		data: productsData,
		isLoading,
		refetch,
	} = useQuery<ProductsResponse>({
		queryKey: ['products', selectedCategory],
		queryFn: getProductsFunction,
		enabled: !!selectedCategory,
	});

	// Filter products based on search term
	const filteredProducts =
		productsData?.data?.filter(
			(product) =>
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.url_key.toLowerCase().includes(searchTerm.toLowerCase())
		) || [];

	// Check if maximum products reached
	const isMaxProductsReached = watchedRelatedProducts.length >= MAX_PRODUCTS;

	// Convert API Product to RelatedProduct format
	const convertToRelatedProduct = (product: Product): RelatedProduct => {
		return {
			name: product.name,
			url_key: product.url_key,
			image_url: product.image.url,
			price: product.price_range.minimum_price.final_price.value,
			currency: product.price_range.minimum_price.final_price.currency,
			sale_price: product.daily_sale?.price || undefined,
			product_url: `/products/${product.url_key}`,
		};
	};

	const handleCategoryChange = (newCategory: string) => {
		setSelectedCategory(newCategory);
		setSearchTerm('');
		setShowProductsList(false);
	};

	const handleAddProduct = (product: Product) => {
		const currentProducts = getValues('relatedProducts') || [];

		// Check if already at maximum
		if (currentProducts.length >= MAX_PRODUCTS) {
			return;
		}

		const productExists = currentProducts.some((p) => p.url_key === product.url_key);

		if (!productExists) {
			const relatedProduct = convertToRelatedProduct(product);
			setValue('relatedProducts', [...currentProducts, relatedProduct]);
			setSearchTerm('');
			setShowProductsList(false);
		}
	};

	const handleRemoveProduct = (index: number) => {
		const currentProducts = getValues('relatedProducts') || [];
		setValue(
			'relatedProducts',
			currentProducts.filter((_, i) => i !== index)
		);
	};

	const formatPrice = (price: number, currency: string = 'VND'): string => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Package className='h-5 w-5' />
					Sản phẩm liên quan
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Category Selection */}
				<div className='space-y-2'>
					<Label htmlFor='category-select'>Chọn danh mục sản phẩm</Label>
					<Select value={selectedCategory} onValueChange={handleCategoryChange}>
						<SelectTrigger className='w-fit'>
							<Filter className='mr-2 h-4 w-4' />
							<SelectValue placeholder='Chọn danh mục...' />
						</SelectTrigger>
						<SelectContent>
							{PRODUCT_CATEGORIES.map((category) => (
								<SelectItem key={category.value} value={category.value}>
									{category.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Search Input */}
				<div className='space-y-2'>
					<Label htmlFor='product-search'>
						Tìm kiếm sản phẩm
						{selectedCategory && (
							<span className='text-sm text-gray-500 ml-2'>
								({PRODUCT_CATEGORIES.find((cat) => cat.value === selectedCategory)?.label})
							</span>
						)}
					</Label>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							id='product-search'
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
								setShowProductsList(true);
							}}
							onFocus={() => setShowProductsList(true)}
							placeholder={
								isMaxProductsReached
									? 'Đã đạt giới hạn tối đa 8 sản phẩm'
									: 'Nhập tên sản phẩm để tìm kiếm...'
							}
							className='pl-10'
							disabled={isMaxProductsReached}
						/>
					</div>

					{/* Maximum products warning */}
					{isMaxProductsReached && (
						<div className='flex items-center gap-2 p-2 bg-amber-50 text-amber-700 rounded-md text-sm'>
							<AlertCircle className='h-4 w-4' />
							<span>
								Đã đạt giới hạn tối đa {MAX_PRODUCTS} sản phẩm. Xóa một sản phẩm để thêm sản phẩm mới.
							</span>
						</div>
					)}

					{/* Products Dropdown */}
					{showProductsList && searchTerm && !isMaxProductsReached && (
						<div className='relative'>
							<div className='absolute top-0 left-0 right-0 z-50 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto'>
								{isLoading ? (
									<div className='p-4 text-center text-gray-500'>Đang tải...</div>
								) : filteredProducts.length > 0 ? (
									filteredProducts.map((product) => {
										const isAlreadySelected = watchedRelatedProducts.some(
											(p) => p.url_key === product.url_key
										);

										return (
											<div
												key={product.url_key}
												className={`p-3 border-b last:border-b-0 flex items-center gap-3 ${
													isAlreadySelected
														? 'bg-gray-100 cursor-not-allowed opacity-60'
														: 'hover:bg-gray-50 cursor-pointer'
												}`}
												onClick={() => !isAlreadySelected && handleAddProduct(product)}
											>
												<img
													src={product.image.url}
													alt={product.name}
													className='w-12 h-12 object-cover rounded'
													onError={(e) => {
														e.currentTarget.src = '/placeholder-product.png';
													}}
												/>
												<div className='flex-1 min-w-0'>
													<p className='font-medium text-sm truncate'>{product.name}</p>
													<p className='text-sm text-gray-600'>
														{formatPrice(
															product.price_range.minimum_price.final_price.value
														)}
													</p>
												</div>
												{isAlreadySelected ? (
													<Badge variant='secondary' className='text-xs'>
														Đã chọn
													</Badge>
												) : (
													<Plus className='h-4 w-4 text-blue-500' />
												)}
											</div>
										);
									})
								) : (
									<div className='p-4 text-center text-gray-500'>
										Không tìm thấy sản phẩm nào trong danh mục "
										{PRODUCT_CATEGORIES.find((cat) => cat.value === selectedCategory)?.label}"
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Selected Products */}
				<div className='space-y-3'>
					<Label>
						Sản phẩm đã chọn ({watchedRelatedProducts.length}/{MAX_PRODUCTS})
					</Label>

					{watchedRelatedProducts.length === 0 ? (
						<div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
							<Package className='mx-auto h-12 w-12 text-gray-300 mb-2' />
							<p>Chưa có sản phẩm nào được chọn</p>
							<p className='text-sm'>
								Chọn danh mục và tìm kiếm sản phẩm liên quan cho bài viết (tối đa {MAX_PRODUCTS} sản
								phẩm)
							</p>
						</div>
					) : (
						<div className='space-y-2 max-h-60 overflow-y-auto'>
							{watchedRelatedProducts.map((product, index) => (
								<div
									key={`${product.url_key}-${index}`}
									className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'
								>
									<img
										src={product.image_url}
										alt={product.name}
										className='w-12 h-12 object-cover rounded'
										onError={(e) => {
											e.currentTarget.src = '/placeholder-product.png';
										}}
									/>
									<div className='flex-1 min-w-0'>
										<p className='font-medium text-sm truncate'>{product.name}</p>
										<div className='flex items-center gap-2 text-sm text-gray-600'>
											<span>{formatPrice(product.price, product.currency)}</span>
											{product.sale_price && product.sale_price < product.price && (
												<Badge variant='destructive' className='text-xs'>
													Sale: {formatPrice(product.sale_price, product.currency)}
												</Badge>
											)}
										</div>
									</div>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => handleRemoveProduct(index)}
										className='hover:text-red-500'
									>
										<X className='h-4 w-4' />
									</Button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Category Stats */}
				{productsData && (
					<div className='text-xs text-gray-500 bg-green-50 p-2 rounded-md'>
						<span className='font-medium'>
							📊 {PRODUCT_CATEGORIES.find((cat) => cat.value === selectedCategory)?.label}:
						</span>
						<span className='ml-1'>{productsData.total} sản phẩm có sẵn</span>
					</div>
				)}

				{/* Info */}
				<div className='text-xs text-gray-500 bg-blue-50 p-3 rounded-lg'>
					<p className='font-medium text-blue-800 mb-1'>💡 Gợi ý:</p>
					<ul className='space-y-1 text-blue-700'>
						<li>• Chọn danh mục phù hợp với nội dung bài viết</li>
						<li>• Chọn tối đa {MAX_PRODUCTS} sản phẩm liên quan để không làm rối người đọc</li>
						<li>• Ưu tiên các sản phẩm có liên quan trực tiếp đến nội dung bài viết</li>
						<li>• Sản phẩm sẽ được hiển thị ở cuối bài viết</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
};
