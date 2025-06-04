'use client';

import { useRef } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Loader2 } from 'lucide-react';
import { PostFormData } from '../types/postTypes';
import { toast } from 'sonner';

interface FeaturedImageSectionProps {
	watch: UseFormWatch<PostFormData>;
	setValue: UseFormSetValue<PostFormData>;
	uploadImageMutation: {
		mutate: (file: File) => void;
		isPending: boolean;
	};
}

export const FeaturedImageSection = ({ watch, setValue, uploadImageMutation }: FeaturedImageSectionProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const watchedFeaturedImage = watch('featuredImage');


	const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Vui lòng chọn tệp hình ảnh');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error('Kích thước hình ảnh phải nhỏ hơn 5MB');
			return;
		}

		uploadImageMutation.mutate(file);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Hình ảnh đại diện</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					<input
						type='file'
						ref={fileInputRef}
						onChange={handleImageUpload}
						accept='image/*'
						className='hidden'
					/>

					{watchedFeaturedImage ? (
						<div className='relative'>
							<img
								src={watchedFeaturedImage}
								alt='Hình đại diện'
								className='w-full h-40 object-cover rounded-lg'
							/>
							<Button
								type='button'
								variant='destructive'
								size='sm'
								className='absolute top-2 right-2'
								onClick={() => setValue('featuredImage', '')}
							>
								<X className='h-4 w-4' />
							</Button>
						</div>
					) : (
						<Button
							type='button'
							variant='outline'
							className='w-full h-40 border-dashed'
							onClick={() => fileInputRef.current?.click()}
							disabled={uploadImageMutation.isPending}
						>
							<div className='text-center'>
								{uploadImageMutation.isPending ? (
									<>
										<Loader2 className='mx-auto h-8 w-8 mb-2 animate-spin' />
										<div>Đang tải lên...</div>
									</>
								) : (
									<>
										<Upload className='mx-auto h-8 w-8 mb-2' />
										<div>Tải lên hình ảnh</div>
									</>
								)}
							</div>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
