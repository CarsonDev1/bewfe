import { BannerImage } from '@/services/banner-service';

export interface BannerImageWithFile extends BannerImage {
  file?: File;
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface BannerFormData {
  title: string;
  description?: string;
  type: 'hero' | 'sidebar' | 'header' | 'footer' | 'popup' | 'inline';
  status?: 'active' | 'inactive' | 'scheduled' | 'expired';
  content?: string;
  linkUrl?: string;
  openInNewTab?: boolean;
  buttonText?: string;
  order?: number;
  priority?: number;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  tags?: string[];
  targetDevice?: 'all' | 'desktop' | 'mobile' | 'tablet';
  seoTitle?: string;
  seoDescription?: string;
}

export interface BannerData {
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

export interface BannersResponse {
  data: BannerData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}