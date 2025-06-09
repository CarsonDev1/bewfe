'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBanner,
  updateBanner,
  deleteBanner,
  getBanners,
  CreateBannerRequest,
  UpdateBannerRequest,
  Banner as BannerType,
} from '@/services/banner-service';

// Import your existing components
import { ImagePreviewModal } from './ImagePreviewModal';
import { BannerFormDialog } from './BannerFormDialog';
import { BannerTable } from './BannerTable';
import { SearchAndFilters } from './SearchAndFilters';
import { Pagination } from './Pagination';
import { BannerFormData, BannerImageWithFile } from './types';

// Validation Schema
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

const Banner = () => {
  // State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerType | null>(null);
  const [images, setImages] = useState<BannerImageWithFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(20);

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<BannerType | null>(null);

  // Image preview states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  // Query client
  const queryClient = useQueryClient();

  // Form
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

  // Data fetching
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

  // Create Banner Mutation
  const createBannerMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      toast.success('Banner created successfully');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      handleCloseCreate();
    },
    onError: (error: any) => {
      console.error('Failed to create banner:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create banner';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    },
  });

  // Update Banner Mutation
  const updateBannerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerRequest }) =>
      updateBanner(id, data),
    onSuccess: () => {
      toast.success('Banner updated successfully');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      handleCloseEdit();
    },
    onError: (error: any) => {
      console.error('Failed to update banner:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update banner';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    },
  });

  // Delete Banner Mutation
  const deleteBannerMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      toast.success('Banner deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsDeleteDialogOpen(false);
      setBannerToDelete(null);
    },
    onError: (error: any) => {
      console.error('Failed to delete banner:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete banner';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    },
  });

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Image preview functions
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

  // Delete functions
  const handleDeleteBanner = (banner: BannerType) => {
    console.log('🗑️ Delete banner requested:', banner.id, banner.title);
    setBannerToDelete(banner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBanner = async () => {
    if (!bannerToDelete) return;

    console.log('🗑️ Confirming delete for banner:', bannerToDelete.id);
    try {
      await deleteBannerMutation.mutateAsync(bannerToDelete.id);
    } catch (error) {
      console.error('❌ Delete failed:', error);
    }
  };

  const cancelDeleteBanner = () => {
    console.log('🗑️ Delete cancelled');
    setIsDeleteDialogOpen(false);
    setBannerToDelete(null);
  };

  // ENHANCED Edit banner function - Fixed with better debugging
  const handleEditBanner = (banner: BannerType) => {
    console.log('🎯 handleEditBanner called with banner:', {
      id: banner.id,
      title: banner.title,
      currentEditState: isEditOpen
    });

    try {
      // First set the editing banner
      setEditingBanner(banner);
      console.log('🎯 Set editingBanner to:', banner.id);

      // Prepare form data with all fields
      const formData = {
        title: banner.title || '',
        description: banner.description || '',
        type: banner.type,
        status: banner.status || 'active',
        content: banner.content || '',
        linkUrl: banner.linkUrl || '',
        openInNewTab: banner.openInNewTab ?? false,
        buttonText: banner.buttonText || '',
        order: banner.order ?? 0,
        priority: banner.priority ?? 0,
        startDate: banner.startDate || '',
        endDate: banner.endDate || '',
        categories: banner.categories || [],
        tags: banner.tags || [],
        targetDevice: banner.targetDevice || 'all',
        seoTitle: banner.seoTitle || '',
        seoDescription: banner.seoDescription || '',
      };

      console.log('🎯 Form data prepared:', formData);

      // Reset form with new data
      form.reset(formData);
      console.log('🎯 Form reset with data');

      // Set images from banner
      const bannerImages: BannerImageWithFile[] = (banner.images || []).map((img, index) => ({
        ...img,
        isUploading: false,
        uploadProgress: 100,
        order: img.order ?? index,
      }));

      setImages(bannerImages);
      console.log('🎯 Images set:', bannerImages.length, 'images');

      // Force open the edit dialog
      setTimeout(() => {
        setIsEditOpen(true);
        console.log('🎯 Edit dialog opened via setTimeout');
      }, 0);

    } catch (error) {
      console.error('❌ Error in handleEditBanner:', error);
      toast.error('Failed to load banner data for editing');
    }
  };

  // Close functions
  const handleCloseEdit = () => {
    console.log('🎯 Closing edit dialog');
    setIsEditOpen(false);
    setEditingBanner(null);
    form.reset();
    setImages([]);
  };

  const handleCloseCreate = () => {
    console.log('🎯 Closing create dialog');
    setIsCreateOpen(false);
    form.reset();
    setImages([]);
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

  // Submit form
  const onSubmit = async (data: BannerFormData) => {
    console.log('🎯 Form submitted for:', editingBanner ? 'UPDATE' : 'CREATE');

    try {
      // Check uploading images
      const uploadingImages = images.filter(img => img.isUploading);
      if (uploadingImages.length > 0) {
        toast.error('Please wait for all images to finish uploading');
        return;
      }

      // Prepare images
      const bannerImages = images.map((img, index) => ({
        url: img.url || '',
        filename: img.filename || '',
        alt: img.alt || data.title,
        title: img.title || data.title,
        width: img.width || 0,
        height: img.height || 0,
        size: img.size || 0,
        order: img.order ?? index,
      }));

      if (editingBanner) {
        // Update existing banner
        const updateData: UpdateBannerRequest = {
          ...data,
          images: bannerImages,
        };

        console.log('🎯 Updating banner:', editingBanner.id, updateData);
        await updateBannerMutation.mutateAsync({
          id: editingBanner.id,
          data: updateData
        });

      } else {
        // Create new banner
        const createData: CreateBannerRequest = {
          ...data,
          images: bannerImages,
        };

        console.log('🎯 Creating banner:', createData);
        await createBannerMutation.mutateAsync(createData);
      }

    } catch (error: any) {
      console.error('❌ Submit error:', error);
    }
  };

  const isSubmitting = createBannerMutation.isPending || updateBannerMutation.isPending;

  // Debug logs
  useEffect(() => {
    console.log('🔍 Edit dialog state changed:', {
      isEditOpen,
      editingBanner: editingBanner?.id,
      formValues: form.getValues()
    });
  }, [isEditOpen, editingBanner]);

  return (
    <>
      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        images={previewImages}
        currentIndex={currentPreviewIndex}
        onClose={closeImagePreview}
        onNext={nextPreviewImage}
        onPrev={prevPreviewImage}
        onIndexChange={setCurrentPreviewIndex}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the banner "{bannerToDelete?.title}"?
              This action cannot be undone and will permanently remove the banner and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteBanner} disabled={deleteBannerMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBanner}
              disabled={deleteBannerMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteBannerMutation.isPending ? 'Deleting...' : 'Delete Banner'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Banners</h1>
            <p className="text-muted-foreground">Manage your website banners</p>
          </div>

          {/* Create Button */}
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            console.log('🎯 Create dialog onOpenChange:', open);
            setIsCreateOpen(open);
            if (!open) {
              handleCloseCreate();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                console.log('🎯 Create button clicked');
                setIsCreateOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Banner
              </Button>
            </DialogTrigger>
            <BannerFormDialog
              isOpen={isCreateOpen}
              onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (!open) handleCloseCreate();
              }}
              form={form}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              images={images}
              setImages={setImages}
              title="Create New Banner"
              submitText={isSubmitting ? 'Creating...' : 'Create Banner'}
            />
          </Dialog>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Banner Table */}
        <BannerTable
          data={bannersData?.data || []}
          isLoading={isLoadingBanners}
          error={bannersError}
          onImagePreview={openImagePreview}
          onEditBanner={handleEditBanner}
          onDeleteBanner={handleDeleteBanner}
        />

        {/* Edit Dialog - SEPARATE Dialog for Edit */}
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            console.log('🎯 Edit dialog onOpenChange called:', open);
            if (!open) {
              handleCloseEdit();
            } else {
              setIsEditOpen(true);
            }
          }}
        >
          <BannerFormDialog
            isOpen={isEditOpen}
            onOpenChange={(open) => {
              console.log('🎯 BannerFormDialog onOpenChange (edit):', open);
              if (!open) {
                handleCloseEdit();
              }
            }}
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            images={images}
            setImages={setImages}
            title={`Edit Banner: ${editingBanner?.title || 'Loading...'}`}
            submitText={isSubmitting ? 'Updating...' : 'Update Banner'}
          />
        </Dialog>

        {/* Pagination */}
        {bannersData?.pagination && (
          <Pagination
            pagination={bannersData.pagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
};

export default Banner;