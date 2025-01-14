'use client';

import { useEffect, useState, useRef } from 'react';
import './style.css';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  size?: 'small' | 'large';
}

type DiceRotation = {
  x: number;
  y: number;
  z: number;
};

// Начальный поворот для лучшего 3D-вида
const INITIAL_ROTATION: DiceRotation = { x: 15, y: -15, z: 0 };

// Правильные углы для каждой грани (добавляем начальный поворот)
const valueToRotation: Record<number, DiceRotation> = {
  1: { x: INITIAL_ROTATION.x, y: INITIAL_ROTATION.y, z: 0 },
  2: { x: INITIAL_ROTATION.x, y: INITIAL_ROTATION.y - 90, z: 0 },
  3: { x: INITIAL_ROTATION.x - 90, y: INITIAL_ROTATION.y, z: 0 },
  4: { x: INITIAL_ROTATION.x + 90, y: INITIAL_ROTATION.y, z: 0 },
  5: { x: INITIAL_ROTATION.x, y: INITIAL_ROTATION.y + 90, z: 0 },
  6: { x: INITIAL_ROTATION.x + 180, y: INITIAL_ROTATION.y, z: 0 }
};

export function Dice({ value, isRolling, size = 'large' }: DiceProps) {
  const [rotation, setRotation] = useState<DiceRotation>(INITIAL_ROTATION);
  const rotationRef = useRef(INITIAL_ROTATION);
  const animationRef = useRef<number>();

  const animate = () => {
    if (!isRolling) {
      cancelAnimationFrame(animationRef.current!);
      return;
    }

    rotationRef.current.x += 8;
    rotationRef.current.y += 10;
    rotationRef.current.z += 6;

    setRotation({
      x: rotationRef.current.x,
      y: rotationRef.current.y,
      z: rotationRef.current.z
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRolling) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (value) {
      const targetRotation = valueToRotation[value];
      
      // Плавный переход к конечному положению
      setRotation({
        x: targetRotation.x,
        y: targetRotation.y,
        z: targetRotation.z
      });
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRolling, value]);

  return (
    <div className={`dice-container ${size}`}>
      <div 
        className={`dice ${isRolling ? 'rolling' : ''}`}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
        }}
      >
        <div className="face face-1 front"></div>
        <div className="face face-2 right"></div>
        <div className="face face-3 back"></div>
        <div className="face face-4 left"></div>
        <div className="face face-5 top"></div>
        <div className="face face-6 bottom"></div>
      </div>
    </div>
  );
} 