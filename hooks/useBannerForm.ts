'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { BannerFormData, BannerImageWithFile } from '../components/banners/types';
import { createBanner, CreateBannerRequest } from '@/services/banner-service';

const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  type: z.enum(['hero', 'sidebar', 'header', 'footer', 'popup', 'inline']),
  status: z.enum(['active', 'inactive', 'scheduled', 'expired']).optional(),
  content: z.string().optional(),
  linkUrl: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid URL'),
  openInNewTab: z.boolean().optional(),
  buttonText: z.string().optional(),
  order: z.number().min(0).optional(),
  priority: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  targetDevice: z.enum(['all', 'desktop', 'mobile', 'tablet']).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const useBannerForm = (onSuccess?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<BannerImageWithFile[]>([]);

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'hero',
      status: 'active',
      content: '',
      linkUrl: '',
      openInNewTab: false,
      buttonText: '',
      order: 0,
      priority: 0,
      startDate: '',
      endDate: '',
      categories: [],
      tags: [],
      targetDevice: 'all',
      seoTitle: '',
      seoDescription: '',
    },
  });

  const onSubmit = async (data: BannerFormData) => {
    setIsSubmitting(true);

    try {
      // Check if any images are still uploading
      const uploadingImages = images.filter(img => img.isUploading);
      if (uploadingImages.length > 0) {
        toast.error('Please wait for all images to finish uploading');
        setIsSubmitting(false);
        return;
      }

      // Prepare banner data
      const bannerData: CreateBannerRequest = {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        content: data.content,
        linkUrl: data.linkUrl,
        openInNewTab: data.openInNewTab,
        buttonText: data.buttonText,
        order: data.order,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        categories: data.categories,
        tags: data.tags,
        targetDevice: data.targetDevice,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        images: images.map(img => ({
          url: img.url,
          filename: img.filename,
          alt: img.alt,
          title: img.title,
          width: img.width,
          height: img.height,
          size: img.size,
          order: img.order,
        })),
      };

      await createBanner(bannerData);

      toast.success('Banner created successfully');

      // Reset form and state
      form.reset();
      setImages([]);

      // Call success callback
      onSuccess?.();

    } catch (error: any) {
      console.error('Failed to create banner:', error);

      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create banner';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    images,
    setImages,
    isSubmitting,
    onSubmit,
  };
};
