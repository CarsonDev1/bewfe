'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ImageIcon, X } from 'lucide-react';
import { BannerImageWithFile } from './types';

interface ImageListProps {
  images: BannerImageWithFile[];
  setImages: React.Dispatch<React.SetStateAction<BannerImageWithFile[]>>;
}

export const ImageList: React.FC<ImageListProps> = ({ images, setImages }) => {
  const updateImageDetails = (index: number, field: keyof BannerImageWithFile, value: string | number) => {
    setImages(prev => prev.map((img, i) =>
      i === index ? { ...img, [field]: value } : img
    ));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
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
  );
};
