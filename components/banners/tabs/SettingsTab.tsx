'use client';

import React, { useState } from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Target, Search, Plus, X } from 'lucide-react';
import { BannerFormData } from '@/components/banners/types';

interface SettingsTabProps {
  form: UseFormReturn<BannerFormData>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ form }) => {
  const { control, watch, setValue } = form;
  const [categoryInput, setCategoryInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const watchedCategories = watch('categories') || [];
  const watchedTags = watch('tags') || [];

  const addCategory = () => {
    if (categoryInput.trim() && !watchedCategories.includes(categoryInput.trim())) {
      setValue('categories', [...watchedCategories, categoryInput.trim()]);
      setCategoryInput('');
    }
  };

  const removeCategory = (category: string) => {
    setValue('categories', watchedCategories.filter(c => c !== category));
  };

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setValue('tags', watchedTags.filter(t => t !== tag));
  };

  return (
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
  );
};
