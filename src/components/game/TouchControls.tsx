import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowUp, Hand, RotateCcw, RotateCw } from 'lucide-react';
import { InteractiveTarget } from '../../game/types';

interface TouchControlsProps {
  onMovementChange: (forward: number, right: number, jump: boolean) => void;
  onInteract: () => void;
  onRotateCamera: (deltaAngle: number) => void;
  activeTarget: InteractiveTarget | null;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMovementChange,
  onInteract,
  onRotateCamera,
  activeTarget,
}) => {
  const joystickRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchIdRef = useRef<number | null>(null);

  // Desktop keyboard controls
  const keysPressed = useRef<{ [k: string]: boolean }>({});
  const isJumping = useRef<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;

      // Russian keyboard layout support (ц, ы, ф, в, у)
      if (key === 'ц') keysPressed.current['w'] = true;
      if (key === 'ы') keysPressed.current['s'] = true;
      if (key === 'ф') keysPressed.current['a'] = true;
      if (key === 'в') keysPressed.current['d'] = true;
      if (key === 'у') keysPressed.current['e'] = true;

      if (e.key === ' ' || e.code === 'Space') {
        isJumping.current = true;
        e.preventDefault();
      }
      if (key === 'e' || key === 'у') {
        onInteract();
      }
      if (key === 'q' || key === 'й' || e.key === 'ArrowLeft') {
        onRotateCamera(-0.08);
      }
      if (key === 'r' || key === 'к' || e.key === 'ArrowRight') {
        onRotateCamera(0.08);
      }
      updateFromKeyboard();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = false;
      if (key === 'ц') keysPressed.current['w'] = false;
      if (key === 'ы') keysPressed.current['s'] = false;
      if (key === 'ф') keysPressed.current['a'] = false;
      if (key === 'в') keysPressed.current['d'] = false;

      if (e.key === ' ' || e.code === 'Space') {
        isJumping.current = false;
      }
      updateFromKeyboard();
    };

    const updateFromKeyboard = () => {
      let forward = 0;
      let right = 0;

      if (keysPressed.current['w'] || keysPressed.current['arrowup'] || keysPressed.current['ц']) forward -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown'] || keysPressed.current['ы']) forward += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft'] || keysPressed.current['ф']) right -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright'] || keysPressed.current['в']) right += 1;

      onMovementChange(forward, right, isJumping.current);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInteract, onRotateCamera, onMovementChange]);

  // Touch joystick handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    handleTouchMove(e);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystickRef.current || touchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const maxRadius = rect.width / 2 - 10;
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const dist = Math.hypot(dx, dy);

        let clampedX = dx;
        let clampedY = dy;
        if (dist > maxRadius) {
          clampedX = (dx / dist) * maxRadius;
          clampedY = (dy / dist) * maxRadius;
        }

        setKnobPos({ x: clampedX, y: clampedY });

        const forward = clampedY / maxRadius;
        const right = clampedX / maxRadius;
        onMovementChange(forward, right, isJumping.current);
        break;
      }
    }
  }, [onMovementChange]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        onMovementChange(0, 0, isJumping.current);
        break;
      }
    }
  }, [onMovementChange]);

  const handleJumpPress = () => {
    isJumping.current = true;
    onMovementChange(knobPos.y / 50, knobPos.x / 50, true);
    setTimeout(() => {
      isJumping.current = false;
      onMovementChange(knobPos.y / 50, knobPos.x / 50, false);
    }, 160);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top right camera rotation controls */}
      <div className="flex justify-end gap-2 pointer-events-auto">
        <button
          onClick={() => onRotateCamera(-0.35)}
          className="p-2.5 bg-slate-900/60 hover:bg-slate-800/80 active:scale-95 text-slate-200 border border-white/10 rounded-xl shadow-md touch-btn backdrop-blur-sm"
          aria-label="Повернуть камеру влево"
          title="Повернуть камеру влево"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => onRotateCamera(0.35)}
          className="p-2.5 bg-slate-900/60 hover:bg-slate-800/80 active:scale-95 text-slate-200 border border-white/10 rounded-xl shadow-md touch-btn backdrop-blur-sm"
          aria-label="Повернуть камеру вправо"
          title="Повернуть камеру вправо"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom controls row */}
      <div className="flex items-end justify-between w-full pb-2">
        {/* Translucent Virtual Joystick (Left) */}
        <div
          ref={joystickRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/40 border border-white/15 shadow-xl relative pointer-events-auto flex items-center justify-center touch-none backdrop-blur-[2px]"
        >
          {/* Subtle concentric inner guide ring */}
          <div className="w-14 h-14 rounded-full border border-dashed border-white/15 pointer-events-none" />
          
          {/* Sleek draggable thumbstick */}
          <div
            className={`w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500/80 to-indigo-500/80 shadow-md border border-white/40 absolute transition-transform pointer-events-none ${
              isDragging ? 'duration-75 scale-95 ring-2 ring-sky-400/40' : 'duration-200 ease-out'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          />
        </div>

        {/* Action Controls (Right) */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Contextual Interaction Button */}
          {activeTarget && (
            <button
              onClick={onInteract}
              className="px-4 py-3 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 active:scale-95 text-white font-bold rounded-2xl shadow-xl border border-amber-300/80 flex items-center gap-2 touch-btn animate-bounce"
            >
              <Hand className="w-4 h-4 text-amber-200" />
              <span className="text-xs sm:text-sm font-fun tracking-wide">{activeTarget.prompt}</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 bg-black/40 text-[9px] rounded border border-white/20 font-mono">E</kbd>
            </button>
          )}

          {/* Refined Circular Jump Button (ПРЫЖОК) */}
          <button
            onTouchStart={handleJumpPress}
            onClick={handleJumpPress}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500/80 to-teal-700/80 active:scale-90 text-white shadow-xl border border-emerald-300/60 flex flex-col items-center justify-center touch-btn backdrop-blur-sm"
            aria-label="Прыжок"
          >
            <ArrowUp className="w-6 h-6 stroke-[3]" />
            <span className="text-[10px] font-black font-fun uppercase tracking-wider mt-0.5">ПРЫЖОК</span>
          </button>
        </div>
      </div>
    </div>
  );
};
