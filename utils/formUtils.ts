// utils/formUtils.ts
import { PostFormData, Post } from '@/components/post-editor/types/postTypes';

/**
 * Utility function để convert Post entity về PostFormData
 * Đảm bảo type safety và default values
 */
export const postToFormData = (post?: Post): Partial<PostFormData> => {
	if (!post) {
		return {
			title: '',
			excerpt: '',
			content: '',
			featuredImage: '',
			categoryId: '',
			tagIds: [],
			relatedProducts: [],
			status: 'draft',
			isFeatured: false,
			isSticky: false,
			seoTitle: '',
			seoDescription: '',
			seoKeywords: [],
		};
	}

	return {
		title: post.title || '',
		excerpt: post.excerpt || '',
		content: post.content || '',
		featuredImage: post.featuredImage || '',
		categoryId: typeof post.categoryId === 'object' ? post.categoryId?.id || '' : post.categoryId || '',
		tagIds: Array.isArray(post.tagIds)
			? post.tagIds.map((tag: any) => (typeof tag === 'string' ? tag : tag.id || tag))
			: [],
		relatedProducts: post.relatedProducts || [],
		status: post.status || 'draft',
		isFeatured: post.isFeatured || false,
		isSticky: post.isSticky || false,
		seoTitle: post.seoTitle || '',
		seoDescription: post.seoDescription || '',
		seoKeywords: post.seoKeywords || [],
	};
};

/**
 * Utility function để convert FormData về payload cho API
 */
export const formDataToPayload = (data: PostFormData, selectedTags: string[]) => {
	return {
		title: data.title,
		excerpt: data.excerpt || undefined,
		content: data.content,
		featuredImage: data.featuredImage || undefined,
		categoryId: data.categoryId,
		tagIds: selectedTags.length > 0 ? selectedTags : undefined,
		relatedProducts: data.relatedProducts && data.relatedProducts.length > 0 ? data.relatedProducts : undefined,
		status: data.status || 'draft',
		isFeatured: data.isFeatured || false,
		isSticky: data.isSticky || false,
		seoTitle: data.seoTitle || undefined,
		seoDescription: data.seoDescription || undefined,
		seoKeywords: data.seoKeywords && data.seoKeywords.length > 0 ? data.seoKeywords : undefined,
	};
};
