'use client';

import { useState } from 'react';
import { Control, Controller, UseFormGetValues, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { PostFormData } from '../types/postTypes';
import { toast } from 'sonner';

interface SEOSectionProps {
	control: Control<PostFormData>;
	getValues: UseFormGetValues<PostFormData>;
	setValue: UseFormSetValue<PostFormData>;
	watch: UseFormWatch<PostFormData>;
}

export const SEOSection = ({ control, getValues, setValue, watch }: SEOSectionProps) => {
	const [newKeyword, setNewKeyword] = useState('');
	const watchedSeoKeywords = watch('seoKeywords');

	const handleAddKeyword = () => {
		if (newKeyword.trim()) {
			const currentKeywords = getValues('seoKeywords') || [];
			if (!currentKeywords.includes(newKeyword.trim())) {
				setValue('seoKeywords', [...currentKeywords, newKeyword.trim()]);
				setNewKeyword('');
			} else {
				toast.error('Từ khóa đã tồn tại');
			}
		}
	};

	const handleRemoveKeyword = (index: number) => {
		const currentKeywords = getValues('seoKeywords') || [];
		setValue(
			'seoKeywords',
			currentKeywords.filter((_, i) => i !== index)
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Cài đặt SEO</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div>
					<Label htmlFor='seoTitle'>Tiêu đề SEO</Label>
					<Controller
						name='seoTitle'
						control={control}
						render={({ field }) => <Input {...field} placeholder='Tiêu đề tối ưu SEO...' />}
					/>
				</div>

				<div>
					<Label htmlFor='seoDescription'>Mô tả SEO</Label>
					<Controller
						name='seoDescription'
						control={control}
						render={({ field }) => <Textarea {...field} placeholder='Mô tả meta SEO...' rows={3} />}
					/>
				</div>

				<div className='flex flex-col gap-3'>
					<Label htmlFor='seoKeywords'>Từ khóa SEO</Label>
					<div className='flex items-center gap-2'>
						<Input
							value={newKeyword}
							onChange={(e) => setNewKeyword(e.target.value)}
							placeholder='Thêm từ khóa...'
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									handleAddKeyword();
								}
							}}
						/>
						<Button
							type='button'
							onClick={handleAddKeyword}
							className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200'
						>
							Thêm
						</Button>
					</div>
					<div className='flex flex-wrap gap-2'>
						{(watchedSeoKeywords || []).map((keyword, index) => (
							<Badge key={index} variant='secondary' className='p-2'>
								{keyword}
								<button
									type='button'
									onClick={() => handleRemoveKeyword(index)}
									className='ml-2 hover:text-red-500'
								>
									<X className='h-3 w-3' />
								</button>
							</Badge>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
