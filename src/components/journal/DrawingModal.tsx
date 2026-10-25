import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, Paintbrush, Eraser, Undo2 } from 'lucide-react';

interface DrawingModalProps {
  initialDrawingUrl?: string;
  onSaveDrawing: (dataUrl: string) => void;
  onClose: () => void;
}

export const DrawingModal: React.FC<DrawingModalProps> = ({
  initialDrawingUrl,
  onSaveDrawing,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1d4ed8');
  const [lineWidth, setLineWidth] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [history, setHistory] = useState<ImageData[]>([]);

  const colors = [
    '#1d4ed8', // Deep blue
    '#0284c7', // Sky blue
    '#0d9488', // Teal
    '#16a34a', // Green
    '#d97706', // Amber
    '#dc2626', // Red
    '#9333ea', // Purple
    '#e11d48', // Rose
    '#374151', // Charcoal dark
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background initially
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (initialDrawingUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState();
      };
      img.src = initialDrawingUrl;
    } else {
      saveState();
    }
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, imageData]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current state
    const previousState = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    ctx.putImageData(previousState, 0, 0);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveDrawing(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fdfbf7] rounded-3xl max-w-xl w-full p-6 shadow-2xl border-2 border-amber-300 relative animate-page-flip">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ebdcd0] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-book text-xl font-bold text-[#3d2b1f]">
                Онлайн-холст для рисунка
              </h3>
              <p className="text-xs text-[#8c7365]">Нарисуй свой ответ прямо здесь</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="touch-none bg-white rounded-2xl border-2 border-[#ebdcd0] overflow-hidden mb-4 shadow-inner">
          <canvas
            ref={canvasRef}
            width={550}
            height={380}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-auto cursor-crosshair block"
          />
        </div>

        {/* Drawing Controls */}
        <div className="space-y-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Color Palette */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(c);
                    setTool('pen');
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                    color === c && tool === 'pen' ? 'scale-125 ring-2 ring-offset-2 ring-amber-800' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>

            {/* Tools */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200">
              <button
                type="button"
                onClick={() => setTool('pen')}
                className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${
                  tool === 'pen' ? 'bg-amber-100 text-amber-900' : 'text-stone-600'
                }`}
              >
                <Paintbrush className="w-4 h-4" />
                <span>Кисть</span>
              </button>
              <button
                type="button"
                onClick={() => setTool('eraser')}
                className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${
                  tool === 'eraser' ? 'bg-amber-100 text-amber-900' : 'text-stone-600'
                }`}
              >
                <Eraser className="w-4 h-4" />
                <span>Ластик</span>
              </button>
            </div>
          </div>

          {/* Line Width Slider & Action Buttons */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <span className="font-bold text-[#5c473a]">Толщина:</span>
              <input
                type="range"
                min={2}
                max={20}
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={history.length <= 1}
                className="p-1.5 rounded-lg bg-white border border-amber-200 text-stone-700 hover:bg-amber-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                title="Отменить последний штрих"
              >
                <Undo2 className="w-4 h-4" />
                <span>Отмена</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer flex items-center gap-1"
                title="Очистить всё"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Очистить</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#8c7365] hover:bg-stone-100 cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Сохранить рисунок</span>
          </button>
        </div>
      </div>
    </div>
  );
};
