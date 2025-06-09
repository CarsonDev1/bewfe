import api from '@/lib/axiosInstance';

export interface BannerImage {
  url: string;
  filename: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  size: number;
  order: number;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  type: 'hero' | 'sidebar' | 'header' | 'footer' | 'popup' | 'inline';
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  images: BannerImage[];
  content?: string;
  linkUrl?: string;
  openInNewTab: boolean;
  buttonText?: string;
  order: number;
  priority: number;
  startDate?: string;
  endDate?: string;
  categories: string[];
  tags: string[];
  targetDevice: 'all' | 'desktop' | 'mobile' | 'tablet';
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  clickCount: number;
  viewCount: number;
  authorId: any;
}

// Fixed: Make CreateBannerRequest match the Zod schema (all optional except title and type)
export interface CreateBannerRequest {
  title: string;
  description?: string;
  type: 'hero' | 'sidebar' | 'header' | 'footer' | 'popup' | 'inline';
  status?: 'active' | 'inactive' | 'scheduled' | 'expired';
  images?: BannerImage[];
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

// New interface for updating banners
export interface UpdateBannerRequest {
  title?: string;
  description?: string;
  type?: 'hero' | 'sidebar' | 'header' | 'footer' | 'popup' | 'inline';
  status?: 'active' | 'inactive' | 'scheduled' | 'expired';
  images?: BannerImage[];
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

export interface CreateBannerResponse {
  data: Banner;
  message: string;
}

export interface UpdateBannerResponse {
  data: Banner;
  message: string;
}

export interface GetBannersParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'hero' | 'sidebar' | 'header' | 'footer' | 'popup' | 'inline';
  status?: 'active' | 'inactive' | 'scheduled' | 'expired';
  authorId?: string;
  sortBy?: 'createdAt' | 'title' | 'priority' | 'order' | 'viewCount' | 'clickCount';
  sortOrder?: 'asc' | 'desc';
}

export interface GetBannersResponse {
  data: Banner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UploadBannerImageResponse {
  message: string;
  url: string;
  filename: string;
  width: number;
  height: number;
  size: number;
  responsive: {
    small: string;
    medium: string;
    large: string;
    original: string;
  };
}

export interface UploadBannerImagesResponse {
  message: string;
  uploadedCount: number;
  totalFiles: number;
  images: {
    url: string;
    filename: string;
    width: number;
    height: number;
    size: number;
    order: number;
    responsive: {
      small: string;
      medium: string;
      large: string;
      original: string;
    };
  }[];
  errors: {
    index: number;
    filename: string;
    error: string;
  }[];
}

export const createBanner = async (data: CreateBannerRequest): Promise<CreateBannerResponse> => {
  const response = await api.post('/banners', data);
  return response.data;
};

export const getBanners = async (params?: GetBannersParams): Promise<GetBannersResponse> => {
  const response = await api.get('/banners', { params });
  return response.data;
};

// New function to update a banner
export const updateBanner = async (id: string, data: UpdateBannerRequest): Promise<UpdateBannerResponse> => {
  const response = await api.patch(`/banners/${id}`, data);
  return response.data;
};

export const uploadBannerImage = async (file: File): Promise<UploadBannerImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload/banner-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadBannerImages = async (files: File[]): Promise<UploadBannerImagesResponse> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/upload/banner-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};