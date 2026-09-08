/**
 * IntroLogoTransition.jsx
 * 
 * Executes the dynamic FLIP transition of the SecureNet logo from the center viewport
 * to the exact bounding box of the brand logo in the existing Navbar.
 */

import React, { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';

export function IntroLogoTransition({ startRect, targetRect, onComplete }) {
    const [transformStyle, setTransformStyle] = useState({
        position: 'fixed',
        left: `${startRect?.left ?? 0}px`,
        top: `${startRect?.top ?? 0}px`,
        width: `${startRect?.width ?? 120}px`,
        height: `${startRect?.height ?? 120}px`,
        zIndex: 10000,
        transform: 'translate3d(0px, 0px, 0px) scale(1)',
        transition: 'none',
        pointerEvents: 'none'
    });

    useEffect(() => {
        if (!startRect || !targetRect) {
            onComplete?.();
            return;
        }

        const startCenterX = startRect.left + startRect.width / 2;
        const startCenterY = startRect.top + startRect.height / 2;

        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        const deltaX = targetCenterX - startCenterX;
        const deltaY = targetCenterY - startCenterY;
        const scale = targetRect.width / startRect.width || 0.4;

        // Trigger animation in next frame
        const timer = setTimeout(() => {
            setTransformStyle({
                position: 'fixed',
                left: `${startRect.left}px`,
                top: `${startRect.top}px`,
                width: `${startRect.width}px`,
                height: `${startRect.height}px`,
                zIndex: 10000,
                transform: `translate3d(${deltaX}px, ${deltaY}px, 0px) scale(${scale})`,
                transition: 'transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)',
                pointerEvents: 'none'
            });
        }, 50);

        const completeTimer = setTimeout(() => {
            onComplete?.();
        }, 1100);

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [startRect, targetRect, onComplete]);

    return (
        <img
            src={logo}
            alt="Transitioning SecureNet Logo"
            style={transformStyle}
        />
    );
}
