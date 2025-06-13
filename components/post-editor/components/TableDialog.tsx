import React, { useState, useEffect } from 'react';
import { X, Table as TableIcon, Grid, Plus, Minus } from 'lucide-react';

interface TableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number, withHeader: boolean) => void;
}

export const TableDialog: React.FC<TableDialogProps> = ({
  isOpen,
  onClose,
  onInsert
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);
  const [selectedCells, setSelectedCells] = useState({ rows: 3, cols: 3 });
  const [isInserting, setIsInserting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRows(3);
      setCols(3);
      setWithHeader(true);
      setSelectedCells({ rows: 3, cols: 3 });
      setIsInserting(false);
    }
  }, [isOpen]);

  const handleInsert = () => {
    if (isInserting) return; // Prevent double insertion
    setIsInserting(true);
    onInsert(rows, cols, withHeader);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInserting) {
      handleInsert();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleCellHover = (row: number, col: number) => {
    if (isInserting) return; // Don't update when inserting
    setSelectedCells({ rows: row + 1, cols: col + 1 });
    setRows(row + 1);
    setCols(col + 1);
  };

  const handleCellClick = (row: number, col: number) => {
    if (isInserting) return; // Prevent multiple clicks

    const newRows = row + 1;
    const newCols = col + 1;
    setRows(newRows);
    setCols(newCols);
    setSelectedCells({ rows: newRows, cols: newCols });
    setIsInserting(true);

    // Visual feedback before inserting
    setTimeout(() => {
      onInsert(newRows, newCols, withHeader);
      onClose();
    }, 150); // Small delay for visual feedback
  };

  const renderTableGrid = () => {
    const maxRows = 10;  // Increased from 8 to 10
    const maxCols = 10;  // Increased from 8 to 10
    const grid = [];

    for (let row = 0; row < maxRows; row++) {
      const rowCells = [];
      for (let col = 0; col < maxCols; col++) {
        const isSelected = row < selectedCells.rows && col < selectedCells.cols;
        const isInCurrentSelection = isSelected && !isInserting;
        const isConfirming = isSelected && isInserting;

        rowCells.push(
          <div
            key={`${row}-${col}`}
            className={`w-5 h-5 border cursor-pointer transition-all duration-200 ${isConfirming
              ? 'bg-green-500 border-green-600 animate-pulse' // Confirming state
              : isInCurrentSelection
                ? 'bg-purple-500 border-purple-600 hover:bg-purple-600' // Selected state
                : 'bg-white border-gray-300 hover:bg-purple-100 hover:border-purple-400' // Default state
              }`}
            onMouseEnter={() => handleCellHover(row, col)}
            onClick={() => handleCellClick(row, col)}
          />
        );
      }
      grid.push(
        <div key={row} className="flex">
          {rowCells}
        </div>
      );
    }

    return grid;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TableIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Insert Table</h3>
              <p className="text-sm text-gray-500">Choose table size and options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Visual Grid Selector */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Grid className="w-4 h-4" />
              Table Size
            </label>
            <div className="flex flex-col items-center space-y-3">
              <div
                className="inline-block p-2 border border-gray-200 rounded-lg bg-gray-50"
                onMouseLeave={() => setSelectedCells({ rows, cols })}
              >
                {renderTableGrid()}
              </div>
              <p className="text-sm text-gray-600">
                {selectedCells.rows} × {selectedCells.cols} table
              </p>
            </div>
          </div>

          {/* Manual Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rows
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    const newRows = Math.max(1, rows - 1);
                    setRows(newRows);
                    setSelectedCells({ rows: newRows, cols });
                  }}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rows}
                  onChange={(e) => {
                    const newRows = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
                    setRows(newRows);
                    setSelectedCells({ rows: newRows, cols });
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-16 h-8 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newRows = Math.min(20, rows + 1);
                    setRows(newRows);
                    setSelectedCells({ rows: newRows, cols });
                  }}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Columns
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    const newCols = Math.max(1, cols - 1);
                    setCols(newCols);
                    setSelectedCells({ rows, cols: newCols });
                  }}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={cols}
                  onChange={(e) => {
                    const newCols = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
                    setCols(newCols);
                    setSelectedCells({ rows, cols: newCols });
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-16 h-8 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newCols = Math.min(20, cols + 1);
                    setCols(newCols);
                    setSelectedCells({ rows, cols: newCols });
                  }}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Table Options
            </label>
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${withHeader
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-gray-400'
              }`}>
              <input
                type="checkbox"
                checked={withHeader}
                onChange={(e) => setWithHeader(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${withHeader
                ? 'border-purple-500 bg-purple-500'
                : 'border-gray-300'
                }`}>
                {withHeader && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <span className="font-medium text-sm">Include Header Row</span>
                <p className="text-xs text-gray-500">First row will be styled as table headers</p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isInserting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={isInserting}
            className={`px-6 py-2 rounded-lg transition-all shadow-sm font-medium ${isInserting
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
          >
            {isInserting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Insert Table'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};