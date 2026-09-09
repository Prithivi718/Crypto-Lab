/**
 * DotGrid.jsx
 *
 * React Bits-style animated dot grid background.
 * Renders a canvas filled with evenly-spaced dots that ripple toward
 * the cursor's position using GSAP tweens.
 *
 * Design defaults follow the army palette:
 *   resting  → #4B5320  (dark olive)
 *   hover    → #929A68  (sage — ripple peak)
 *
 * Layering contract:
 *   position: absolute; inset: 0; z-index: 0; pointer-events: none
 *   (enforced by DotGrid.css — never blocks button clicks)
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './DotGrid.css';

function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return { r, g, b };
}

function lerpColor(a, b, t) {
    return {
        r: Math.round(a.r + (b.r - a.r) * t),
        g: Math.round(a.g + (b.g - a.g) * t),
        b: Math.round(a.b + (b.b - a.b) * t),
    };
}

function toRgbString({ r, g, b }, alpha = 1) {
    return `rgba(${r},${g},${b},${alpha})`;
}

export function DotGrid({
    dotColor = '#4B5320',   // army olive — resting
    dotColorHover = '#929A68',   // sage       — ripple peak
    dotSize = 2,
    dotSpacing = 28,
    rippleRadius = 90,
    rippleStrength = 1.0,
    className = '',
}) {
    const canvasRef = useRef(null);
    const stateRef = useRef({
        dots: [],
        mouse: { x: -9999, y: -9999 },
        tweens: [],
        raf: null,
        observer: null,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const rgbBase = hexToRgb(dotColor);
        const rgbHover = hexToRgb(dotColorHover);

        // ── Build dot grid ────────────────────────────────────────────────
        function buildGrid() {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            canvas.width = w;
            canvas.height = h;

            const cols = Math.ceil(w / dotSpacing);
            const rows = Math.ceil(h / dotSpacing);

            // Kill existing tweens before rebuilding
            stateRef.current.tweens.forEach(t => t.kill());

            const dots = [];
            for (let row = 0; row <= rows; row++) {
                for (let col = 0; col <= cols; col++) {
                    dots.push({
                        x: col * dotSpacing + dotSpacing / 2,
                        y: row * dotSpacing + dotSpacing / 2,
                        opacity: 0.18,   // resting alpha
                        scale: 1,
                    });
                }
            }
            stateRef.current.dots = dots;
            stateRef.current.tweens = [];
        }

        // ── Draw frame ────────────────────────────────────────────────────
        function draw() {
            const { dots } = stateRef.current;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            dots.forEach(dot => {
                const r = dotSize * dot.scale;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
                // Blend color based on opacity surge during ripple
                const t = Math.max(0, (dot.opacity - 0.18) / (rippleStrength - 0.18));
                const col = lerpColor(rgbBase, rgbHover, t);
                ctx.fillStyle = toRgbString(col, dot.opacity);
                ctx.fill();
            });
            stateRef.current.raf = requestAnimationFrame(draw);
        }

        // ── Ripple on mouse/touch move ─────────────────────────────────────
        function ripple(mouseX, mouseY) {
            const { dots, tweens } = stateRef.current;
            dots.forEach((dot, i) => {
                const dx = dot.x - mouseX;
                const dy = dot.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < rippleRadius) {
                    const strength = 1 - dist / rippleRadius;
                    // Kill existing tween for this dot to avoid stacking
                    if (tweens[i]) tweens[i].kill();
                    tweens[i] = gsap.to(dot, {
                        opacity: 0.18 + rippleStrength * strength,
                        scale: 1 + 0.45 * strength,
                        duration: 0.25,
                        ease: 'power2.out',
                        onComplete() {
                            gsap.to(dot, {
                                opacity: 0.18,
                                scale: 1,
                                duration: 0.6,
                                ease: 'power2.out',
                            });
                        },
                    });
                    stateRef.current.tweens = tweens;
                }
            });
        }

        // ── Event handlers ────────────────────────────────────────────────
        function onMouseMove(e) {
            const rect = canvas.getBoundingClientRect();
            ripple(e.clientX - rect.left, e.clientY - rect.top);
        }
        function onTouchMove(e) {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            ripple(touch.clientX - rect.left, touch.clientY - rect.top);
        }

        // Use the overlay parent for mouse tracking so events are captured
        // even though the canvas itself has pointer-events: none
        const parent = canvas.parentElement;

        // ── ResizeObserver ────────────────────────────────────────────────
        const ro = new ResizeObserver(() => {
            buildGrid();
        });
        ro.observe(canvas.parentElement);
        stateRef.current.observer = ro;

        // ── Mount ─────────────────────────────────────────────────────────
        buildGrid();
        stateRef.current.raf = requestAnimationFrame(draw);

        parent.addEventListener('mousemove', onMouseMove);
        parent.addEventListener('touchmove', onTouchMove, { passive: true });

        // ── Cleanup ───────────────────────────────────────────────────────
        return () => {
            cancelAnimationFrame(stateRef.current.raf);
            stateRef.current.tweens.forEach(t => t && t.kill());
            ro.disconnect();
            parent.removeEventListener('mousemove', onMouseMove);
            parent.removeEventListener('touchmove', onTouchMove);
        };
    }, [dotColor, dotColorHover, dotSize, dotSpacing, rippleRadius, rippleStrength]);

    return (
        <canvas
            ref={canvasRef}
            className={`dot-grid-canvas ${className}`}
            aria-hidden="true"
        />
    );
}
