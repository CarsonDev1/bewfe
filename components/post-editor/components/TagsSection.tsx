'use client';

import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TagsSectionProps {
	selectedTags: string[];
	onTagToggle: (tagId: string) => void;
	tagsData?: {
		data: Array<{
			id: string;
			name: string;
			color?: string;
		}>;
	};
}

export const TagsSection = ({ selectedTags, onTagToggle, tagsData }: TagsSectionProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Thẻ</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-2 max-h-48 overflow-y-auto'>
					{tagsData?.data?.map((tag) => (
						<div key={tag.id} className='flex items-center space-x-2'>
							<input
								type='checkbox'
								id={`tag-${tag.id}`}
								checked={selectedTags.includes(tag.id)}
								onChange={() => onTagToggle(tag.id)}
								className='rounded'
							/>
							<Label htmlFor={`tag-${tag.id}`} className='flex-1'>
								{tag.name}
							</Label>
							{tag.color && (
								<div className='w-4 h-4 rounded-full' style={{ backgroundColor: tag.color }} />
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};
