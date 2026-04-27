// src/components/game/QRCode.jsx
import React, { useEffect, useRef } from 'react';

export default function QRCode({ url, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadQR = async () => {
      try {
        const qrcode = await import('qrcode');
        if (canvasRef.current) {
          await qrcode.toCanvas(canvasRef.current, url, {
            width: size,
            margin: 1,
            color: { dark: '#1a1a2e', light: '#ffffff' }
          });
        }
      } catch (err) {
        console.error('Failed to generate QR:', err);
      }
    };
    loadQR();
  }, [url, size]);

  return <canvas ref={canvasRef} className="rounded-lg inline-block" />;
}