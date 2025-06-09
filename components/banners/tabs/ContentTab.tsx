'use client';

import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { BannerFormData } from '@/components/banners/types';

interface ContentTabProps {
  form: UseFormReturn<BannerFormData>;
}

export const ContentTab: React.FC<ContentTabProps> = ({ form }) => {
  const { control, formState: { errors } } = form;

  return (
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
  );
};