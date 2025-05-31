'use client';

import { useRouter } from 'next/navigation';
import { PostEditor } from '@/components/post-editor/post-editor';

interface Post {
	id: string;
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	featuredImage?: string;
	categoryId?: string;
	tagIds?: string[];
	status: 'draft' | 'published' | 'archived';
	isFeatured: boolean;
	isSticky: boolean;
	publishedAt?: string;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string[];
	createdAt: string;
	updatedAt: string;
}

export default function NewPostPage() {
	const router = useRouter();

	const handleSave = (post: Post) => {
		router.push('/admin/posts');
	};

	const handleCancel = () => {
		router.push('/admin/posts');
	};

	return <PostEditor onSave={handleSave} onCancel={handleCancel} />;
}
