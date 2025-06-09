'use client';

import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ImageList } from '@/components/banners/ImageList';
import { BannerImageWithFile } from '@/components/banners/types';
import { uploadBannerImage } from '@/services/banner-service';
import { toast } from 'sonner';

interface ImagesTabProps {
  images: BannerImageWithFile[];
  setImages: React.Dispatch<React.SetStateAction<BannerImageWithFile[]>>;
}

export const ImagesTab: React.FC<ImagesTabProps> = ({ images, setImages }) => {
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
      setImages(prev => prev.slice(0, -1));
    }
  };

  return (
    <TabsContent value="images" className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label>Upload Single Image</Label>
          <div className="mt-2 size-72 flex justify-center items-center w-full shadow-lg">
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
              className="w-full h-full"
              onClick={() => document.getElementById('single-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
          </div>
        </div>
      </div>

      <ImageList images={images} setImages={setImages} />
    </TabsContent>
  );
};