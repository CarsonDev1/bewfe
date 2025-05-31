'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PostPreviewProps {
	title: string;
	content: string;
}

export const PostPreview = ({ title, content }: PostPreviewProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div
					className='prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-blockquote:text-gray-600'
					dangerouslySetInnerHTML={{ __html: content || '' }}
				/>
			</CardContent>
		</Card>
	);
};
