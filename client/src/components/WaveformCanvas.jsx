import React, { useRef, useEffect } from 'react';

export default function WaveformCanvas({ analyser, isRecording }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set internal resolution for sharpness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 320 * dpr;
    canvas.height = 320 * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser ? analyser.frequencyBinCount : 0;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      let amplitude = 0;
      if (analyser && isRecording) {
        analyser.getByteFrequencyData(dataArray);
        // Average top frequencies for amplitude
        let sum = 0;
        for (let i = 0; i < 20; i++) sum += dataArray[i];
        amplitude = sum / 20 / 255; // 0 to 1
      }

      ctx.clearRect(0, 0, 320, 320);
      
      const cx = 160;
      const cy = 160;
      phaseRef.current += 0.05 + amplitude * 0.1;

      // Draw 3 layered waves
      const drawWave = (offset, opacity, scale, speedMult) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 200, 83, ${opacity})`;
        ctx.lineWidth = 2 + amplitude * 3;
        ctx.lineCap = 'round';

        const points = 80;
        const radius = 70 + amplitude * 40 * scale;
        
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          
          // Add sine deformation
          const wave = Math.sin(angle * 4 + phaseRef.current * speedMult + offset) * (10 + amplitude * 30);
          const r = radius + wave;
          
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Add a subtle glow
        if (opacity > 0.4) {
           ctx.shadowBlur = 15 * amplitude;
           ctx.shadowColor = 'rgba(0, 200, 83, 0.5)';
        } else {
           ctx.shadowBlur = 0;
        }
      };

      if (isRecording) {
        drawWave(0, 0.8, 1, 1);
        drawWave(Math.PI * 0.5, 0.4, 0.8, -1.2);
        drawWave(Math.PI, 0.2, 1.2, 0.8);
      } else {
        // Static circle when idle
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 200, 83, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 320, height: 320 }}
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-700 ease-in-out`}
    />
  );
}
