import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Default to showing above, center aligned
            let top = rect.top - 10; // 10px spacing
            let left = rect.left + rect.width / 2;

            // Simple boundary check (can be expanded)
            if (top < 50) {
                // If too close to top, show below
                top = rect.bottom + 10;
            }

            setCoords({ top, left });
        }
    };

    useEffect(() => {
        if (isVisible) {
            updatePosition();
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isVisible]);

    return (
        <div
            ref={triggerRef}
            className="relative flex items-center group cursor-help"
            onMouseEnter={() => {
                updatePosition();
                setIsVisible(true);
            }}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && createPortal(
                <div
                    className="fixed z-[9999] w-48 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-xl border border-gray-700 animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        transform: 'translate(-50%, -100%)', // Default anchor: bottom-center of tooltip to target
                    }}
                >
                    <p className="whitespace-normal leading-relaxed text-center">{content}</p>
                    {/* Arrow (Optional - simplified for Portal) */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-gray-900" />
                </div>,
                document.body
            )}
        </div>
    );
}
