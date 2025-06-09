'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ImageIcon,
  Link,
  ExternalLink,
  Eye,
  EyeOff,
  MousePointer,
  Monitor,
  Smartphone,
  Tablet,
  MoreHorizontal,
  ArrowUpDown,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Copy
} from 'lucide-react';
import { Banner as BannerType } from '@/services/banner-service';

interface BannerTableProps {
  data: BannerType[];
  isLoading: boolean;
  error: any;
  onImagePreview: (images: any[], startIndex: number) => void;
  onEditBanner: (banner: BannerType) => void;
  onDeleteBanner: (banner: BannerType) => void;
}

export const BannerTable: React.FC<BannerTableProps> = ({
  data,
  isLoading,
  error,
  onImagePreview,
  onEditBanner,
  onDeleteBanner,
}) => {
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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You can add a toast notification here
      console.log(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleBannerStatus = (banner: BannerType) => {
    // This would be implemented to call an API to toggle status
    console.log('Toggle status for banner:', banner.id);
    // You can add this functionality later
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading banners...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-center py-12 text-red-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Failed to load banners</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No banners found</h3>
            <p className="text-sm">Click "Create Banner" to add your first banner.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
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
              {data.map((banner) => (
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
                            onImagePreview(banner.images, 0);
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
                        <DropdownMenuItem onClick={() => {
                          // Add view details functionality later if needed
                          console.log('View details for banner:', banner.id);
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => {
                          console.log('🎯 Edit button clicked for banner:', banner);
                          onEditBanner(banner);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Banner
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {banner.linkUrl && (
                          <DropdownMenuItem onClick={() => {
                            copyToClipboard(banner.linkUrl!, 'Link URL');
                          }}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => {
                          copyToClipboard(banner.id, 'Banner ID');
                        }}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy ID
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => toggleBannerStatus(banner)}>
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

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => {
                            console.log('🗑️ Delete button clicked for banner:', banner);
                            onDeleteBanner(banner);
                          }}
                        >
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
      </CardContent>
    </Card>
  );
};