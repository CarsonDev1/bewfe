'use client';

import React from 'react';
import { BannerImage } from '@/services/banner-service';

interface ImagePreviewModalProps {
  isOpen: boolean;
  images: BannerImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onIndexChange: (index: number) => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onIndexChange,
}) => {
  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: 'black',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid #333'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            zIndex: 10,
            transition: 'background-color 0.2s'
          }}
        >
          ✕
        </button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            zIndex: 10
          }}>
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Main Image */}
        <div style={{
          width: '100%',
          height: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px 80px 20px'
        }}>
          <img
            src={currentImage?.url}
            alt={currentImage?.alt || 'Preview'}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '50px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                transition: 'background-color 0.2s'
              }}
            >
              ‹
            </button>
            <button
              onClick={onNext}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '50px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                transition: 'background-color 0.2s'
              }}
            >
              ›
            </button>
          </>
        )}

        {/* Image Info Footer */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: '40px 20px 20px 20px',
          color: 'white'
        }}>
          {currentImage?.title && (
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              {currentImage.title}
            </h3>
          )}
          {currentImage?.alt && (
            <p style={{
              fontSize: '14px',
              color: '#ccc',
              marginBottom: '12px',
              margin: '0 0 12px 0'
            }}>
              {currentImage.alt}
            </p>
          )}
          <div style={{
            display: 'flex',
            gap: '20px',
            fontSize: '12px',
            color: '#999',
            flexWrap: 'wrap'
          }}>
            <span>📐 {currentImage?.width} × {currentImage?.height}</span>
            <span>📦 {Math.round((currentImage?.size || 0) / 1024)} KB</span>
            <span>📄 {currentImage?.filename}</span>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '12px',
            borderRadius: '8px',
            maxWidth: '80%',
            overflowX: 'auto'
          }}>
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                style={{
                  width: '60px',
                  height: '60px',
                  border: index === currentIndex ? '2px solid white' : '2px solid transparent',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  flexShrink: 0
                }}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Thumbnail ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};