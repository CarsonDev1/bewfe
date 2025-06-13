export interface EditorWrapperProps {
  value: string;
  onChange: (content: string) => void;
  isFullScreen: boolean;
  uploadImage: (file: File) => Promise<any>;
}

export interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'primary' | 'danger';
}

export interface ToolbarSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  placeholder?: string;
  width?: string;
}

export interface ToolbarDropdownProps {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  align?: 'left' | 'right';
}

export interface ColorPickerProps {
  onColorSelect: (color: string) => void;
  currentColor?: string;
}

export interface EditorToolbarProps {
  editor: any;
  showSearch: boolean;
  searchTerm: string;
  isPreviewMode: boolean;
  wordCount: number;
  isFullScreen: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onSearchToggle: () => void;
  onSearchTermChange: (term: string) => void;
  onPreviewToggle: () => void;
  onImageUpload: () => void;
  onExportHTML: () => void;
  onExportMarkdown: () => void;
  onExportWord: () => void;
  onExportPDF: () => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPrint: () => void;
  onCopyToClipboard: () => void;
  onPasteFromClipboard: () => void;
  onInsertTemplate: (type: string) => void;
  onInsertTable: () => void;
  onInsertSymbol: (symbol: string) => void;
  onInsertDateTime: () => void;
  onInsertPageBreak: () => void;
  onAddLink: () => void;
  onClearFormatting: () => void;
  onSelectAll: () => void;
  onSearchAndReplace: () => void;
}