import api from '@/lib/axiosInstance';

export interface ProductImage {
	url: string;
}

export interface ProductPrice {
	currency: string;
	value: number;
}

export interface ProductPriceRange {
	minimum_price: {
		final_price: ProductPrice;
	};
}

export interface Product {
	name: string;
	url_key: string;
	image: ProductImage;
	price_range: ProductPriceRange;
	daily_sale: any | null;
}

export interface ProductsResponse {
	data: Product[];
	total: number;
}

// Specific category functions
export const getTechnologyNewsProducts = async (): Promise<ProductsResponse> => {
	const response = await api.get('/products/technology-news');
	return response.data;
};

// NEW: Bgames products function
export const getBgamesProducts = async (): Promise<ProductsResponse> => {
	const response = await api.get('/products/bgames');
	return response.data;
};

// NEW: Advise products function
export const getAdviseProducts = async (): Promise<ProductsResponse> => {
	const response = await api.get('/products/advise');
	return response.data;
};

// NEW: Onhand products function
export const getOnhandProducts = async (): Promise<ProductsResponse> => {
	const response = await api.get('/products/onhand');
	return response.data;
};

// NEW: Evaluate products function
export const getEvaluateProducts = async (): Promise<ProductsResponse> => {
	const response = await api.get('/products/evaluate');
	return response.data;
};

// NEW: Trick products function
export const getTrickProducts = async (): Promise<ProductsResponse> => {
	const response = await api.get('/products/trick');
	return response.data;
};

// NEW: Promotion products function
export const getPromotionProducts = async (): Promise<ProductsResponse> => {
	const response = await api.get('/products/promotion');
	return response.data;
};

// Generic function for any category
export const getProductsByCategory = async (category: string): Promise<ProductsResponse> => {
	const response = await api.get(`/products/${category}`);
	return response.data;
};

// Utility functions
export const formatPrice = (price: ProductPrice): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price.value);
};

export const formatPriceSimple = (price: ProductPrice): string => {
	return `${price.value.toLocaleString('vi-VN')} ${price.currency}`;
};
