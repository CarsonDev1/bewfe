'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BannerFormData, BannerImageWithFile } from './types';
import { BasicInfoTab } from '@/components/banners/tabs/BasicInfoTab';
import { ImagesTab } from '@/components/banners/tabs/ImagesTab';
import { ContentTab } from '@/components/banners/tabs/ContentTab';
import { SettingsTab } from '@/components/banners/tabs/SettingsTab';

interface BannerFormTabsProps {
  form: UseFormReturn<BannerFormData>;
  images: BannerImageWithFile[];
  setImages: React.Dispatch<React.SetStateAction<BannerImageWithFile[]>>;
}

export const BannerFormTabs: React.FC<BannerFormTabsProps> = ({
  form,
  images,
  setImages,
}) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <BasicInfoTab form={form} />
      <ImagesTab images={images} setImages={setImages} />
      <ContentTab form={form} />
      <SettingsTab form={form} />
    </Tabs>
  );
};