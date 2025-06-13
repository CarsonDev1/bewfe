// Export Functions
export const exportToHTML = (editor: any) => {
  const html = editor?.getHTML() || '';
  const fullHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: 600; }
        img { max-width: 100%; height: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding-left: 1em; color: #666; font-style: italic; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;

  const blob = new Blob([fullHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `document-${new Date().toISOString().split('T')[0]}.html`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToMarkdown = (editor: any) => {
  let content = editor?.getHTML() || '';

  // Convert headings
  content = content.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/g, (match: string, level: string, text: string) => {
    return '#'.repeat(parseInt(level)) + ' ' + text.replace(/<[^>]*>/g, '') + '\n\n';
  });

  // Convert formatting
  content = content.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');
  content = content.replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**');
  content = content.replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*');
  content = content.replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*');
  content = content.replace(/<u[^>]*>(.*?)<\/u>/g, '_$1_');
  content = content.replace(/<s[^>]*>(.*?)<\/s>/g, '~~$1~~');
  content = content.replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`');

  // Convert blockquotes
  content = content.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, (match: string, text: string) => {
    return '> ' + text.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '\n> ').replace(/<[^>]*>/g, '').trim() + '\n\n';
  });
  // Convert code blocks
  content = content.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/g, (match: string, code: string) => {
    return '```\n' + code.replace(/<[^>]*>/g, '').trim() + '\n```\n\n';
  });

  // Convert links
  content = content.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');

  // Convert images
  content = content.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/g, '![$2]($1)');

  // Convert lists
  content = content.replace(/<ul[^>]*>/g, '').replace(/<\/ul>/g, '\n');
  content = content.replace(/<ol[^>]*>/g, '').replace(/<\/ol>/g, '\n');
  content = content.replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n');

  // Convert tables
  content = content.replace(/<table[^>]*>(.*?)<\/table>/g, (match: string, tableContent: string) => {
    let markdown = '\n';
    const rows = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/g) || [];

    rows.forEach((row, index) => {
      const cells = row.match(/<t[hd][^>]*>(.*?)<\/t[hd]>/g) || [];
      const cellContents = cells.map(cell => cell.replace(/<[^>]*>/g, '').trim());
      markdown += '| ' + cellContents.join(' | ') + ' |\n';

      if (index === 0) { // Header row
        markdown += '|' + cellContents.map(() => ' --- ').join('|') + '|\n';
      }
    });

    return markdown + '\n';
  });

  // Convert horizontal rules
  content = content.replace(/<hr[^>]*>/g, '\n---\n\n');
  // Convert paragraphs
  content = content.replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n');

  // Clean up remaining HTML tags
  content = content.replace(/<[^>]*>/g, '');

  // Clean up extra whitespace
  content = content.replace(/\n{3,}/g, '\n\n').trim();

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `document-${new Date().toISOString().split('T')[0]}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToWord = (editor: any) => {
  const content = editor?.getHTML() || '';
  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Document</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotPromptForConvert/>
            <w:DoNotShowInsertionsAndDeletions/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page { margin: 1in; }
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
          h1, h2, h3, h4, h5, h6 { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black; padding: 8px; }
          blockquote { border-left: 4px solid #ccc; padding-left: 16px; margin: 16px 0; font-style: italic; }
          code { background: #f0f0f0; padding: 2px 4px; font-family: 'Courier New', monospace; }
          pre { background: #f0f0f0; padding: 12px; font-family: 'Courier New', monospace; white-space: pre-wrap; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `;

  const blob = new Blob([wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `document-${new Date().toISOString().split('T')[0]}.doc`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = (editor: any) => {
  const content = editor?.getHTML() || '';
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>PDF Export</title>
          <style>
            @page { 
              margin: 1in; 
              size: A4;
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #000;
              font-size: 11pt;
            }
            h1, h2, h3, h4, h5, h6 { 
              page-break-after: avoid; 
              margin-top: 24px;
              margin-bottom: 12px;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              page-break-inside: avoid;
              margin: 12px 0;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold; 
            }
            img { 
              max-width: 100%; 
              height: auto; 
              page-break-inside: avoid; 
            }
            blockquote { 
              border-left: 4px solid #ccc; 
              margin: 16px 0; 
              padding-left: 16px; 
              font-style: italic; 
            }
            code { 
              background: #f4f4f4; 
              padding: 2px 4px; 
              border-radius: 3px; 
              font-family: 'Courier New', monospace;
            }
            pre { 
              background: #f4f4f4; 
              padding: 12px; 
              border-radius: 5px; 
              overflow-x: auto; 
              page-break-inside: avoid;
              font-family: 'Courier New', monospace;
              white-space: pre-wrap;
            }
            .page-break { 
              page-break-after: always; 
            }
            ul, ol {
              margin: 12px 0;
              padding-left: 24px;
            }
            li {
              margin-bottom: 4px;
            }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 48px;">
            <h1 style="margin: 0;">Document</h1>
            <p style="margin: 12px 0; color: #666;">Generated on ${new Date().toLocaleDateString('vi-VN')}</p>
          </div>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for images to load
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  }
};

export const printDocument = (editor: any) => {
  const content = editor?.getHTML() || '';
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Document</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 1in; color: #000; }
            table { border-collapse: collapse; width: 100%; margin: 1em 0; }
            th, td { border: 1px solid #000; padding: 8px; }
            th { background-color: #f0f0f0; font-weight: bold; }
            img { max-width: 100%; height: auto; page-break-inside: avoid; }
            blockquote { border-left: 4px solid #ccc; margin: 1em 0; padding-left: 1em; font-style: italic; }
            code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
            pre { background: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; page-break-inside: avoid; }
            h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

// Import Functions
export const importFromFile = (editor: any) => (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;

    if (file.type === 'text/html' || file.name.endsWith('.html')) {
      editor?.commands.setContent(content);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const htmlContent = content.replace(/\n/g, '<br>');
      editor?.commands.setContent(`<p>${htmlContent}</p>`);
    } else if (file.name.endsWith('.md')) {
      // Simple Markdown to HTML conversion
      let htmlContent = content;

      // Convert headings
      htmlContent = htmlContent.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
        const level = hashes.length;
        return `<h${level}>${text}</h${level}>`;
      });

      // Convert bold and italic
      htmlContent = htmlContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      htmlContent = htmlContent.replace(/\*(.+?)\*/g, '<em>$1</em>');
      htmlContent = htmlContent.replace(/`(.+?)`/g, '<code>$1</code>');

      // Convert links
      htmlContent = htmlContent.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

      // Convert paragraphs
      htmlContent = htmlContent.replace(/\n\n/g, '</p><p>');
      htmlContent = `<p>${htmlContent}</p>`;

      editor?.commands.setContent(htmlContent);
    }
  };

  reader.readAsText(file);

  // Reset file input
  if (event.target) {
    event.target.value = '';
  }
};

// Template Functions
export const getTemplate = (templateType: string): string => {
  switch (templateType) {
    case 'basic':
      return `
        <h2>Tiêu đề chính</h2>
        <p>Đoạn mở đầu giới thiệu về chủ đề bài viết...</p>
        
        <h3>Nội dung chính</h3>
        <p>Phát triển ý tưởng và cung cấp thông tin chi tiết...</p>
        
        <blockquote>
          <p>Một câu trích dẫn hoặc thông tin quan trọng</p>
        </blockquote>
        
        <h3>Kết luận</h3>
        <p>Tóm tắt và kết luận bài viết...</p>
      `;
    case 'with-image':
      return `
        <h2>Tiêu đề với hình ảnh</h2>
        <p>Giới thiệu về chủ đề...</p>
        
        <img src="https://via.placeholder.com/600x400/f0f0f0/666?text=Hình+minh+họa" alt="Hình minh họa" />
        
        <h3>Phân tích chi tiết</h3>
        <p>Nội dung phân tích dựa trên hình ảnh...</p>
      `;
    case 'with-table':
      return `
        <h2>Dữ liệu và thống kê</h2>
        <p>Giới thiệu về dữ liệu...</p>
        
        <table>
          <thead>
            <tr>
              <th>Tiêu đề 1</th>
              <th>Tiêu đề 2</th>
              <th>Tiêu đề 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dữ liệu 1</td>
              <td>Dữ liệu 2</td>
              <td>Dữ liệu 3</td>
            </tr>
          </tbody>
        </table>
        
        <p>Phân tích dữ liệu trong bảng...</p>
      `;
    case 'meeting-notes':
      return `
        <h2>📝 Meeting Notes - ${new Date().toLocaleDateString('vi-VN')}</h2>
        
        <h3>📅 Meeting Details</h3>
        <ul>
          <li><strong>Date:</strong> ${new Date().toLocaleDateString('vi-VN')}</li>
          <li><strong>Time:</strong> ${new Date().toLocaleTimeString('vi-VN')}</li>
          <li><strong>Attendees:</strong> </li>
          <li><strong>Location:</strong> </li>
        </ul>
        
        <h3>🎯 Agenda</h3>
        <ol>
          <li>Agenda item 1</li>
          <li>Agenda item 2</li>
          <li>Agenda item 3</li>
        </ol>
        
        <h3>📋 Discussion Points</h3>
        <p>Main discussion points...</p>
        
        <h3>✅ Action Items</h3>
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="false"><p>Action item 1</p></li>
          <li data-type="taskItem" data-checked="false"><p>Action item 2</p></li>
          <li data-type="taskItem" data-checked="false"><p>Action item 3</p></li>
        </ul>
        
        <h3>📝 Next Steps</h3>
        <p>Next meeting: </p>
      `;
    case 'report':
      return `
        <h1>📊 Báo cáo ${new Date().getFullYear()}</h1>
        
        <h2>📈 Executive Summary</h2>
        <p>Tóm tắt nội dung báo cáo...</p>
        
        <h2>🎯 Objectives</h2>
        <ul>
          <li>Mục tiêu 1</li>
          <li>Mục tiêu 2</li>
          <li>Mục tiêu 3</li>
        </ul>
        
        <h2>📊 Key Metrics</h2>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Q1</th>
              <th>Q2</th>
              <th>Q3</th>
              <th>Q4</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Revenue</td>
              <td>$100K</td>
              <td>$120K</td>
              <td>$140K</td>
              <td>$160K</td>
            </tr>
          </tbody>
        </table>
        
        <h2>🎯 Recommendations</h2>
        <p>Khuyến nghị và next steps...</p>
      `;
    default:
      return '';
  }
};

// Utility Functions
export const insertSymbol = (editor: any, symbol: string) => {
  editor?.chain().focus().insertContent(symbol).run();
};

export const insertDateTime = (editor: any) => {
  const now = new Date();
  const dateTime = now.toLocaleString('vi-VN');
  editor?.chain().focus().insertContent(dateTime).run();
};

export const insertPageBreak = (editor: any) => {
  const pageBreak = '<div class="page-break" style="page-break-after: always; height: 2px; background: linear-gradient(90deg, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%); margin: 2em 0; position: relative; border-radius: 1px;"></div>';
  editor?.chain().focus().insertContent(pageBreak).run();
};

export const insertTable = (editor: any) => {
  const rows = window.prompt('Number of rows:', '3');
  const cols = window.prompt('Number of columns:', '3');

  if (rows && cols) {
    editor?.chain().focus().insertTable({
      rows: parseInt(rows),
      cols: parseInt(cols),
      withHeaderRow: true
    }).run();
  }
};

export const addLink = (editor: any) => {
  const previousUrl = editor?.getAttributes('link').href;
  const url = window.prompt('URL:', previousUrl);

  if (url === null) return;

  if (url === '') {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

export const clearFormatting = (editor: any) => {
  editor?.chain().focus().clearNodes().unsetAllMarks().run();
};

export const selectAll = (editor: any) => {
  editor?.chain().focus().selectAll().run();
};

export const copyToClipboard = async (editor: any) => {
  const html = editor?.getHTML() || '';
  await navigator.clipboard.writeText(html);
};

export const pasteFromClipboard = async (editor: any) => {
  try {
    const text = await navigator.clipboard.readText();
    editor?.chain().focus().insertContent(text).run();
  } catch (error) {
    console.error('Failed to paste:', error);
  }
};

export const searchAndReplace = (editor: any, searchTerm: string) => {
  if (!searchTerm) return;

  const content = editor?.getHTML() || '';
  const replaceTerm = window.prompt('Replace with:', '');
  if (replaceTerm !== null) {
    const newContent = content.replace(new RegExp(searchTerm, 'gi'), replaceTerm);
    editor?.commands.setContent(newContent);
  }
};