'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  Link,
  Settings,
  Search,
  Calendar,
  Target,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  MousePointer,
  Monitor,
  Smartphone,
  Tablet,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  BannerImage,
  CreateBannerRequest,
  createBanner,
  getBanners,
  uploadBannerImage,
  uploadBannerImages
} from '@/services/banner-service';
import { useQuery } from '@tanstack/react-query';

// Fixed Validation Schema - make it consistent with the service interface
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

type BannerFormData = z.infer<typeof bannerSchema>;

interface BannerImageWithFile extends BannerImage {
  file?: File;
  isUploading?: boolean;
  uploadProgress?: number;
}

// Banner data type from API
interface BannerData {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  status: string;
  images: BannerImage[];
  content?: string;
  linkUrl?: string;
  openInNewTab: boolean;
  buttonText?: string;
  order: number;
  priority: number;
  clickCount: number;
  viewCount: number;
  categories: string[];
  tags: string[];
  targetDevice: string;
  authorId: {
    username: string;
    displayName: string;
    avatar: string;
    fullName: string;
    id: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

interface BannersResponse {
  data: BannerData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const Banner = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<BannerImageWithFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [pageSize, setPageSize] = useState(20);

  // Image preview states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<BannerImage[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const {
    data: bannersData,
    isLoading: isLoadingBanners,
    error: bannersError,
    refetch: refetchBanners,
  } = useQuery({
    queryKey: ['banners', currentPage, searchTerm, pageSize],
    queryFn: () =>
      getBanners({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
      }),
  });

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

  const { control, handleSubmit, reset, formState: { errors }, watch, setValue } = form;

  const watchedCategories = watch('categories') || [];
  const watchedTags = watch('tags') || [];

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
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

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Image preview functions
  const openImagePreview = (images: BannerImage[], startIndex: number = 0) => {
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

  // Debug: Log state changes
  useEffect(() => {
    // Optional: Keep for debugging if needed
    // console.log('Preview state changed:', { isPreviewOpen, previewImages: previewImages.length });
  }, [isPreviewOpen, previewImages, currentPreviewIndex]);

  // Add keyboard event listener
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

  // Debug: Log every render - removed for production

  // Handle single image upload
  const handleSingleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Add to images with uploading state
    const tempImage: BannerImageWithFile = {
      url: '',
      filename: file.name,
      alt: '',
      title: '',
      width: 0,
      height: 0,
      size: file.size,
      order: images.length,
      file,
      isUploading: true,
      uploadProgress: 0,
    };

    setImages(prev => [...prev, tempImage]);

    try {
      const uploadResult = await uploadBannerImage(file);

      // Update the image with upload result
      setImages(prev => prev.map((img, index) =>
        index === prev.length - 1 ? {
          ...img,
          url: uploadResult.url,
          filename: uploadResult.filename,
          width: uploadResult.width,
          height: uploadResult.height,
          size: uploadResult.size,
          isUploading: false,
          uploadProgress: 100,
        } : img
      ));

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');

      // Remove failed upload
      setImages(prev => prev.slice(0, -1));
    }
  };

  // Handle multiple images upload
  const handleMultipleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Validate files
    const invalidFiles = fileArray.filter(file =>
      !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} files are invalid (not images or too large)`);
      return;
    }

    // Add temp images with uploading state
    const tempImages: BannerImageWithFile[] = fileArray.map((file, index) => ({
      url: '',
      filename: file.name,
      alt: '',
      title: '',
      width: 0,
      height: 0,
      size: file.size,
      order: images.length + index,
      file,
      isUploading: true,
      uploadProgress: 0,
    }));

    setImages(prev => [...prev, ...tempImages]);

    try {
      const uploadResult = await uploadBannerImages(fileArray);

      // Replace temp images with real images
      setImages(prev => {
        // Keep old images (before temp ones)
        const oldImages = prev.slice(0, prev.length - fileArray.length);

        // Create new images from upload result
        const newUploadedImages = uploadResult.images.map((result, index) => ({
          url: result.url,
          filename: result.filename,
          alt: '',
          title: '',
          width: result.width,
          height: result.height,
          size: result.size,
          order: oldImages.length + index,
          isUploading: false,
          uploadProgress: 100,
        }));

        return [...oldImages, ...newUploadedImages];
      });

      toast.success(`${uploadResult.uploadedCount} images uploaded successfully`);

      if (uploadResult.errors && uploadResult.errors.length > 0) {
        toast.warning(`${uploadResult.errors.length} images failed to upload`);
      }
    } catch (error) {
      console.error('Multiple upload failed:', error);
      toast.error('Failed to upload images');

      // Remove failed uploads
      setImages(prev => prev.slice(0, -(fileArray.length)));
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Update image details
  const updateImageDetails = (index: number, field: keyof BannerImage, value: string | number) => {
    setImages(prev => prev.map((img, i) =>
      i === index ? { ...img, [field]: value } : img
    ));
  };

  // Add category
  const addCategory = () => {
    if (categoryInput.trim() && !watchedCategories.includes(categoryInput.trim())) {
      setValue('categories', [...watchedCategories, categoryInput.trim()]);
      setCategoryInput('');
    }
  };

  // Remove category
  const removeCategory = (category: string) => {
    setValue('categories', watchedCategories.filter(c => c !== category));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setValue('tags', watchedTags.filter(t => t !== tag));
  };

  // Submit form
  const onSubmit: SubmitHandler<BannerFormData> = async (data) => {
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

      const result = await createBanner(bannerData);

      toast.success('Banner created successfully');

      // Reset form and refresh data
      reset();
      setImages([]);
      setIsCreateOpen(false);
      refetchBanners();

    } catch (error: any) {
      console.error('Failed to create banner:', error);

      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create banner';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* IMAGE PREVIEW MODAL */}
      {isPreviewOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={closeImagePreview}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: 'black',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid #333'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {previewImages.length > 0 ? (
              <>
                {/* Close Button */}
                <button
                  onClick={closeImagePreview}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    zIndex: 10,
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e: any) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e: any) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                  ✕
                </button>

                {/* Image Counter */}
                {previewImages.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    zIndex: 10
                  }}>
                    {currentPreviewIndex + 1} / {previewImages.length}
                  </div>
                )}

                {/* Main Image */}
                <div style={{
                  width: '100%',
                  height: '90vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 20px 80px 20px'
                }}>
                  <img
                    src={previewImages[currentPreviewIndex]?.url}
                    alt={previewImages[currentPreviewIndex]?.alt || 'Preview'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                    onLoad={() => {/* Image loaded successfully */ }}
                    onError={(e) => console.log('Image failed to load:', e)}
                  />
                </div>

                {/* Navigation Arrows */}
                {previewImages.length > 1 && (
                  <>
                    <button
                      onClick={prevPreviewImage}
                      style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '50px',
                        height: '50px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e: any) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                      onMouseLeave={(e: any) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextPreviewImage}
                      style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '50px',
                        height: '50px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e: any) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                      onMouseLeave={(e: any) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Image Info Footer */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: '40px 20px 20px 20px',
                  color: 'white'
                }}>
                  {previewImages[currentPreviewIndex]?.title && (
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      margin: '0 0 8px 0'
                    }}>
                      {previewImages[currentPreviewIndex].title}
                    </h3>
                  )}
                  {previewImages[currentPreviewIndex]?.alt && (
                    <p style={{
                      fontSize: '14px',
                      color: '#ccc',
                      marginBottom: '12px',
                      margin: '0 0 12px 0'
                    }}>
                      {previewImages[currentPreviewIndex].alt}
                    </p>
                  )}
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '12px',
                    color: '#999',
                    flexWrap: 'wrap'
                  }}>
                    <span>
                      📐 {previewImages[currentPreviewIndex]?.width} × {previewImages[currentPreviewIndex]?.height}
                    </span>
                    <span>
                      📦 {Math.round((previewImages[currentPreviewIndex]?.size || 0) / 1024)} KB
                    </span>
                    <span>
                      📄 {previewImages[currentPreviewIndex]?.filename}
                    </span>
                  </div>
                </div>

                {/* Thumbnail Navigation */}
                {previewImages.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: '12px',
                    borderRadius: '8px',
                    maxWidth: '80%',
                    overflowX: 'auto'
                  }}>
                    {previewImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPreviewIndex(index)}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: index === currentPreviewIndex ? '2px solid white' : '2px solid transparent',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `Thumbnail ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                width: '400px',
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>
                No images to display
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Banners</h1>
            <p className="text-muted-foreground">Manage your website banners</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Banner
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Banner</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <div>
                              <Input
                                {...field}
                                placeholder="Enter banner title"
                                className={errors.title ? 'border-red-500' : ''}
                              />
                              {errors.title && (
                                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>

                      <div>
                        <Label htmlFor="type">Type *</Label>
                        <Controller
                          name="type"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select banner type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hero">Hero</SelectItem>
                                <SelectItem value="sidebar">Sidebar</SelectItem>
                                <SelectItem value="header">Header</SelectItem>
                                <SelectItem value="footer">Footer</SelectItem>
                                <SelectItem value="popup">Popup</SelectItem>
                                <SelectItem value="inline">Inline</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Enter banner description"
                            rows={3}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Controller
                          name="status"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div>
                        <Label htmlFor="order">Order</Label>
                        <Controller
                          name="order"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              value={field.value || 0}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          )}
                        />
                      </div>

                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Controller
                          name="priority"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              value={field.value || 0}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Images Tab */}
                  <TabsContent value="images" className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label>Upload Single Image</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSingleImageUpload(e.target.files)}
                            className="hidden"
                            id="single-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('single-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <Label>Upload Multiple Images</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleMultipleImagesUpload(e.target.files)}
                            className="hidden"
                            id="multiple-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('multiple-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Images
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Images List */}
                    <div className="space-y-4">
                      {images.map((image, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Image Preview */}
                              <div className="w-20 h-20 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                {image.isUploading ? (
                                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                ) : image.url ? (
                                  <img
                                    src={image.url}
                                    alt={image.alt || 'Banner image'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                )}
                              </div>

                              {/* Image Details */}
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Alt Text</Label>
                                  <Input
                                    value={image.alt}
                                    onChange={(e) => updateImageDetails(index, 'alt', e.target.value)}
                                    placeholder="Image description"
                                    disabled={image.isUploading}
                                  />
                                </div>
                                <div>
                                  <Label>Title</Label>
                                  <Input
                                    value={image.title}
                                    onChange={(e) => updateImageDetails(index, 'title', e.target.value)}
                                    placeholder="Image title"
                                    disabled={image.isUploading}
                                  />
                                </div>
                                <div>
                                  <Label>Order</Label>
                                  <Input
                                    type="number"
                                    value={image.order}
                                    onChange={(e) => updateImageDetails(index, 'order', parseInt(e.target.value) || 0)}
                                    min="0"
                                    disabled={image.isUploading}
                                  />
                                </div>
                                <div>
                                  <Label>Size</Label>
                                  <Input
                                    value={`${Math.round(image.size / 1024)}KB ${image.width}x${image.height}`}
                                    disabled
                                    className="text-sm text-gray-500"
                                  />
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-2">
                                {image.isUploading ? (
                                  <div className="flex items-center gap-2 text-sm text-blue-600">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading...
                                  </div>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label htmlFor="content">HTML Content</Label>
                      <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Enter HTML content for the banner"
                            rows={6}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkUrl">Link URL</Label>
                        <Controller
                          name="linkUrl"
                          control={control}
                          render={({ field }) => (
                            <div>
                              <Input
                                {...field}
                                placeholder="https://example.com"
                                className={errors.linkUrl ? 'border-red-500' : ''}
                              />
                              {errors.linkUrl && (
                                <p className="text-sm text-red-500 mt-1">{errors.linkUrl.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>

                      <div>
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Controller
                          name="buttonText"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Learn More"
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Controller
                        name="openInNewTab"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label>Open link in new tab</Label>
                    </div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-6">
                    {/* Scheduling */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Scheduling
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Controller
                              name="startDate"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="datetime-local"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <Label htmlFor="endDate">End Date</Label>
                            <Controller
                              name="endDate"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="datetime-local"
                                />
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Targeting */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Targeting
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="targetDevice">Target Device</Label>
                          <Controller
                            name="targetDevice"
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Devices</SelectItem>
                                  <SelectItem value="desktop">Desktop Only</SelectItem>
                                  <SelectItem value="mobile">Mobile Only</SelectItem>
                                  <SelectItem value="tablet">Tablet Only</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        {/* Categories */}
                        <div>
                          <Label>Categories</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              value={categoryInput}
                              onChange={(e) => setCategoryInput(e.target.value)}
                              placeholder="Add category"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                            />
                            <Button type="button" onClick={addCategory}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {watchedCategories.map((category) => (
                              <Badge key={category} variant="secondary">
                                {category}
                                <button
                                  type="button"
                                  onClick={() => removeCategory(category)}
                                  className="ml-2"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Tags */}
                        <div>
                          <Label>Tags</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              placeholder="Add tag"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            />
                            <Button type="button" onClick={addTag}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {watchedTags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-2"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* SEO */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Search className="w-5 h-5" />
                          SEO
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="seoTitle">SEO Title</Label>
                          <Controller
                            name="seoTitle"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="SEO optimized title"
                              />
                            )}
                          />
                        </div>

                        <div>
                          <Label htmlFor="seoDescription">SEO Description</Label>
                          <Controller
                            name="seoDescription"
                            control={control}
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                placeholder="SEO meta description"
                                rows={3}
                              />
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Banner'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search banners..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch('')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="pageSize" className="text-sm text-gray-600">
                Show:
              </Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Banner Table */}
        <Card>
          <CardContent className="p-0">
            {isLoadingBanners ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading banners...</span>
              </div>
            ) : bannersError ? (
              <div className="flex items-center justify-center py-12 text-red-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Failed to load banners</span>
              </div>
            ) : !bannersData?.data || bannersData.data.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No banners found</h3>
                <p className="text-sm">
                  {searchTerm ? 'No banners match your search criteria.' : 'Click "Create Banner" to add your first banner.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Image</TableHead>
                      <TableHead className="min-w-[200px]">
                        <Button variant="ghost" className="h-auto p-0 font-semibold">
                          Title <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead className="text-center">Views</TableHead>
                      <TableHead className="text-center">Clicks</TableHead>
                      <TableHead className="min-w-[150px]">Author</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bannersData.data.map((banner) => (
                      <TableRow key={banner.id} className="group">
                        {/* Image */}
                        <TableCell>
                          <div className="relative">
                            <div
                              className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (banner.images && banner.images.length > 0) {
                                  openImagePreview(banner.images, 0);
                                }
                              }}
                            >
                              {banner.images && banner.images.length > 0 ? (
                                <img
                                  src={banner.images[0].url}
                                  alt={banner.images[0].alt || banner.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            {banner.images && banner.images.length > 1 && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {banner.images.length}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Title */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm line-clamp-1">{banner.title}</div>
                            {banner.description && (
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {banner.description}
                              </div>
                            )}
                            {banner.linkUrl && (
                              <div className="flex items-center gap-1 text-xs">
                                <Link className="w-3 h-3 text-gray-400" />
                                <a
                                  href={banner.linkUrl}
                                  target={banner.openInNewTab ? '_blank' : '_self'}
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate max-w-[150px]"
                                >
                                  {banner.linkUrl}
                                </a>
                                {banner.openInNewTab && (
                                  <ExternalLink className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            )}
                            {banner.buttonText && (
                              <div className="text-xs text-gray-600">
                                Button: <span className="font-medium">{banner.buttonText}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Badge className={getTypeColor(banner.type)} variant="outline">
                            {banner.type}
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge className={getStatusColor(banner.status)} variant="outline">
                            {banner.status}
                          </Badge>
                        </TableCell>

                        {/* Device */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getDeviceIcon(banner.targetDevice)}
                            <span className="text-sm capitalize">{banner.targetDevice}</span>
                          </div>
                        </TableCell>

                        {/* Views */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{banner.viewCount}</span>
                          </div>
                        </TableCell>

                        {/* Clicks */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MousePointer className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{banner.clickCount}</span>
                          </div>
                        </TableCell>

                        {/* Author */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img
                              src={banner.authorId.avatar}
                              alt={banner.authorId.displayName}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">
                                {banner.authorId.displayName}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                @{banner.authorId.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Created */}
                        <TableCell>
                          <div className="text-sm">{formatDate(banner.createdAt)}</div>
                          <div className="text-xs text-gray-500">
                            Order: {banner.order} | Priority: {banner.priority}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Banner
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link className="w-4 h-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {banner.status === 'active' ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Banner
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* Enhanced Pagination Footer */}
          {bannersData?.pagination && bannersData.pagination.total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing{' '}
                  <span className="font-medium">
                    {((currentPage - 1) * bannersData.pagination.limit) + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * bannersData.pagination.limit, bannersData.pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{bannersData.pagination.total}</span>{' '}
                  results
                </div>

                {bannersData.pagination.pages > 1 && (
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {bannersData.pagination.pages}
                  </div>
                )}
              </div>

              {bannersData.pagination.pages > 1 && (
                <div className="flex items-center gap-2">
                  {/* First Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="hidden sm:flex"
                  >
                    First
                  </Button>

                  {/* Previous Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const totalPages = bannersData.pagination.pages;
                      const current = currentPage;
                      const pages = [];

                      if (totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Always show first page
                        pages.push(1);

                        if (current > 4) {
                          pages.push('...');
                        }

                        // Show pages around current page
                        const start = Math.max(2, current - 1);
                        const end = Math.min(totalPages - 1, current + 1);

                        for (let i = start; i <= end; i++) {
                          if (i !== 1 && i !== totalPages) {
                            pages.push(i);
                          }
                        }

                        if (current < totalPages - 3) {
                          pages.push('...');
                        }

                        // Always show last page
                        if (totalPages > 1) {
                          pages.push(totalPages);
                        }
                      }

                      return pages.map((page, index) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400">
                              ...
                            </span>
                          );
                        }

                        return (
                          <Button
                            key={page}
                            variant={page === current ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page as number)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      });
                    })()}
                  </div>

                  {/* Next Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === bannersData.pagination.pages}
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Last Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(bannersData.pagination.pages)}
                    disabled={currentPage === bannersData.pagination.pages}
                    className="hidden sm:flex"
                  >
                    Last
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default Banner;