'use client';

import { useState, useEffect } from 'react';

export const useImagePreview = () => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const openImagePreview = (images: any[], startIndex: number = 0) => {
    setPreviewImages(images);
    setCurrentPreviewIndex(startIndex);
    setIsPreviewOpen(true);
  };

  const closeImagePreview = () => {
    setIsPreviewOpen(false);
    setPreviewImages([]);
    setCurrentPreviewIndex(0);
  };

  const nextPreviewImage = () => {
    setCurrentPreviewIndex((prev) =>
      prev === previewImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevPreviewImage = () => {
    setCurrentPreviewIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1
    );
  };

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPreviewOpen) return;

      if (e.key === 'Escape') {
        closeImagePreview();
      } else if (e.key === 'ArrowRight') {
        nextPreviewImage();
      } else if (e.key === 'ArrowLeft') {
        prevPreviewImage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen, previewImages.length]);

  return {
    isPreviewOpen,
    previewImages,
    currentPreviewIndex,
    openImagePreview,
    closeImagePreview,
    nextPreviewImage,
    prevPreviewImage,
    setCurrentPreviewIndex,
  };
};

// utils/bannerHelpers.ts (Utility functions)
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'expired': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'hero': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'sidebar': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'header': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'footer': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'popup': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'inline': return 'bg-teal-100 text-teal-800 border-teal-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select an image file' };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'Image size must be less than 10MB' };
  }

  return { isValid: true };
};