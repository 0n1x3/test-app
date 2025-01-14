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
        <div className="face front">
          <span className="dot center"></span>
        </div>
        <div className="face right">
          <span className="dot top right"></span>
          <span className="dot bottom left"></span>
        </div>
        <div className="face back">
          <span className="dot top right"></span>
          <span className="dot center"></span>
          <span className="dot bottom left"></span>
        </div>
        <div className="face left">
          <span className="dot top left"></span>
          <span className="dot top right"></span>
          <span className="dot bottom left"></span>
          <span className="dot bottom right"></span>
        </div>
        <div className="face top">
          <span className="dot top left"></span>
          <span className="dot top right"></span>
          <span className="dot center"></span>
          <span className="dot bottom left"></span>
          <span className="dot bottom right"></span>
        </div>
        <div className="face bottom">
          <span className="dot top left"></span>
          <span className="dot top right"></span>
          <span className="dot middle left"></span>
          <span className="dot middle right"></span>
          <span className="dot bottom left"></span>
          <span className="dot bottom right"></span>
        </div>
      </div>
    </div>
  );
} 