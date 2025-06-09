'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { BannerFormTabs } from './BannerFormTabs';
import { BannerFormData, BannerImageWithFile } from './types';

interface BannerFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<BannerFormData>;
  onSubmit: (data: BannerFormData) => Promise<void>;
  isSubmitting: boolean;
  images: BannerImageWithFile[];
  setImages: React.Dispatch<React.SetStateAction<BannerImageWithFile[]>>;
  title: string;
  submitText: string;
}

export const BannerFormDialog: React.FC<BannerFormDialogProps> = ({
  isOpen,
  onOpenChange,
  form,
  onSubmit,
  isSubmitting,
  images,
  setImages,
  title,
  submitText,
}) => {
  console.log('🔍 BannerFormDialog render - isOpen:', isOpen, 'title:', title);

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BannerFormTabs
          form={form}
          images={images}
          setImages={setImages}
        />

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
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
                {submitText}
              </>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};