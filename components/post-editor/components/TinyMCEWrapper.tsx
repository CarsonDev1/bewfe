'use client';

import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface EditorWrapperProps {
	value: string;
	onChange: (content: string) => void;
	isFullScreen: boolean;
	uploadImage: (file: File) => Promise<any>;
}

export const EditorWrapper = ({ value, onChange, isFullScreen, uploadImage }: EditorWrapperProps) => {
	const [mounted, setMounted] = useState(false);
	const [Editor, setEditor] = useState<any>(null);
	const editorRef = useRef<any>(null);

	useEffect(() => {
		const loadEditor = async () => {
			try {
				const tinymce = await import('@tinymce/tinymce-react');
				setEditor(() => tinymce.Editor);
				setMounted(true);
			} catch (error) {
				console.error('Failed to load TinyMCE:', error);
				setMounted(true);
			}
		};

		loadEditor();
	}, []);

	if (!mounted) {
		return (
			<div className='h-96 bg-gray-100 animate-pulse rounded-md flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	if (!Editor) {
		return (
			<Textarea
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
				className='min-h-96'
				placeholder='Nhập nội dung bài viết...'
			/>
		);
	}

	const editorConfig = {
		height: isFullScreen ? '80vh' : 500,
		menubar: true,
		plugins: [
			'anchor',
			'autolink',
			'charmap',
			'codesample',
			'emoticons',
			'image',
			'link',
			'lists',
			'media',
			'searchreplace',
			'table',
			'visualblocks',
			'wordcount',
			'checklist',
			'mediaembed',
			'casechange',
			'formatpainter',
			'pageembed',
			'powerpaste',
			'advtable',
			'advcode',
			'editimage',
			'advtemplate',
			'mentions',
			'tableofcontents',
			'footnotes',
			'autocorrect',
			'typography',
			'inlinecss',
			'markdown',
			'importword',
			'exportword',
			'exportpdf',
			'fullscreen',
			'preview',
			'code',
			'help',
			'insertdatetime',
			'nonbreaking',
			'pagebreak',
			'paste',
			'tabfocus',
			'template',
			'textpattern',
			'hr',
		],
		toolbar: [
			'undo redo | fullscreen preview | blocks fontfamily fontsize',
			'bold italic underline strikethrough | forecolor backcolor | align lineheight',
			'checklist numlist bullist indent outdent | link image media table',
			'codesample blockquote hr pagebreak | emoticons charmap | searchreplace',
			'formatpainter removeformat | code wordcount | help',
		].join(' | '),

		skin: 'oxide',
		content_css: 'default',
		content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        font-size: 14px; 
        line-height: 1.6; 
        color: #333;
        max-width: none;
      }
      h1, h2, h3, h4, h5, h6 { 
        color: #2d3748; 
        margin-top: 1.5em; 
        margin-bottom: 0.5em; 
        font-weight: 600;
      }
      h1 { font-size: 2.25em; }
      h2 { font-size: 1.875em; }
      h3 { font-size: 1.5em; }
      h4 { font-size: 1.25em; }
      h5 { font-size: 1.125em; }
      h6 { font-size: 1em; }
      p { margin-bottom: 1em; }
      a { color: #3182ce; text-decoration: none; }
      a:hover { text-decoration: underline; }
      blockquote { 
        border-left: 4px solid #e2e8f0; 
        margin: 1.5em 0; 
        padding-left: 1.5em; 
        color: #718096; 
        font-style: italic;
      }
      code { 
        background: #f7fafc; 
        padding: 0.25em 0.5em; 
        border-radius: 4px; 
        font-size: 0.875em; 
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }
      pre { 
        background: #1a202c; 
        color: #e2e8f0;
        padding: 1.5em; 
        border-radius: 8px; 
        overflow-x: auto;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        line-height: 1.5;
      }
      table { 
        border-collapse: collapse; 
        width: 100%; 
        margin: 1.5em 0; 
        border: 1px solid #e2e8f0;
      }
      th, td { 
        border: 1px solid #e2e8f0; 
        padding: 12px; 
        text-align: left; 
      }
      th { 
        background: #f7fafc; 
        font-weight: 600; 
      }
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      ul, ol {
        padding-left: 2em;
        margin: 1em 0;
      }
      li {
        margin-bottom: 0.5em;
      }
    `,

		font_family_formats: [
			'Arial=arial,helvetica,sans-serif',
			'Times New Roman=times new roman,times,serif',
			'Georgia=georgia,serif',
			'Verdana=verdana,sans-serif',
			'Courier New=courier new,courier,monospace',
			'Tahoma=tahoma,sans-serif',
			'Trebuchet MS=trebuchet ms,sans-serif',
			'Impact=impact,sans-serif',
		].join('; '),

		font_size_formats: '8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 32px 36px 48px 72px',

		image_advtab: true,
		image_uploadtab: true,
		file_picker_types: 'image',
		automatic_uploads: true,
		paste_data_images: true,

		images_upload_handler: async (blobInfo: any) => {
			return new Promise((resolve, reject) => {
				const file = blobInfo.blob();
				uploadImage(file)
					.then((response: any) => {
						if (response.url) {
							resolve(response.url);
						} else {
							reject('Không thể tải ảnh lên');
						}
					})
					.catch((error: any) => {
						reject('Lỗi tải ảnh: ' + error.message);
					});
			});
		},

		paste_as_text: false,
		paste_auto_cleanup_on_paste: true,
		paste_remove_styles_if_webkit: false,
		paste_merge_formats: true,
		smart_paste: true,

		table_default_attributes: { border: '1' },
		table_default_styles: {
			'border-collapse': 'collapse',
			width: '100%',
		},
		table_responsive_width: true,

		link_default_protocol: 'https',
		link_assume_external_targets: true,
		link_context_toolbar: true,

		codesample_languages: [
			{ text: 'HTML/XML', value: 'markup' },
			{ text: 'JavaScript', value: 'javascript' },
			{ text: 'CSS', value: 'css' },
			{ text: 'PHP', value: 'php' },
			{ text: 'Ruby', value: 'ruby' },
			{ text: 'Python', value: 'python' },
			{ text: 'Java', value: 'java' },
			{ text: 'C', value: 'c' },
			{ text: 'C#', value: 'csharp' },
			{ text: 'C++', value: 'cpp' },
		],

		templates: [
			{
				title: 'Bài viết cơ bản',
				description: 'Template cơ bản cho bài viết',
				content: `
          <h2>Tiêu đề chính</h2>
          <p>Đoạn mở đầu giới thiệu về chủ đề bài viết...</p>
          
          <h3>Nội dung chính</h3>
          <p>Phát triển ý tưởng và cung cấp thông tin chi tiết...</p>
          
          <blockquote>
            <p>Một câu trích dẫn hoặc thông tin quan trọng</p>
          </blockquote>
          
          <h3>Kết luận</h3>
          <p>Tóm tắt và kết luận bài viết...</p>
        `,
			},
			{
				title: 'Bài viết có hình ảnh',
				description: 'Template với hình ảnh minh họa',
				content: `
          <h2>Tiêu đề với hình ảnh</h2>
          <p>Giới thiệu về chủ đề...</p>
          
          <p><img src="https://via.placeholder.com/600x400/f0f0f0/666?text=Hình+minh+họa" alt="Hình minh họa" style="width: 100%; max-width: 600px;" /></p>
          
          <h3>Phân tích chi tiết</h3>
          <p>Nội dung phân tích dựa trên hình ảnh...</p>
        `,
			},
			{
				title: 'Bài viết có bảng',
				description: 'Template với bảng dữ liệu',
				content: `
          <h2>Dữ liệu và thống kê</h2>
          <p>Giới thiệu về dữ liệu...</p>
          
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #dee2e6; padding: 12px;">Tiêu đề 1</th>
                <th style="border: 1px solid #dee2e6; padding: 12px;">Tiêu đề 2</th>
                <th style="border: 1px solid #dee2e6; padding: 12px;">Tiêu đề 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #dee2e6; padding: 12px;">Dữ liệu 1</td>
                <td style="border: 1px solid #dee2e6; padding: 12px;">Dữ liệu 2</td>
                <td style="border: 1px solid #dee2e6; padding: 12px;">Dữ liệu 3</td>
              </tr>
            </tbody>
          </table>
          
          <p>Phân tích dữ liệu trong bảng...</p>
        `,
			},
		],

		browser_spellcheck: true,
		contextmenu: 'link image table',
		placeholder: 'Bắt đầu viết nội dung bài viết của bạn...',
		resize: 'both',
		statusbar: true,

		setup: (editor: any) => {
			editor.on('init', () => {
				editorRef.current = editor;
			});
		},

		branding: false,
		language: 'vi',
	};

	return (
		<div className={`tinymce-container ${isFullScreen ? 'fullscreen-editor' : ''}`}>
			<Editor
				apiKey='1h1h01p48rexzbjsj0pbq5jv01cgy2srguriuatuwcq2odfk'
				value={value || ''}
				onEditorChange={(content: string) => {
					onChange(content);
				}}
				init={editorConfig}
			/>
		</div>
	);
};
