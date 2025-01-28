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

// Обновляем маппинг значений на углы поворота
const valueToRotation: Record<number, DiceRotation> = {
  1: { x: 0, y: 0, z: 0 },                    // Передняя грань (1)
  2: { x: 0, y: -90, z: 0 },                  // Правая грань (2)
  3: { x: -90, y: 0, z: 0 },                  // Верхняя грань (3)
  4: { x: 90, y: 0, z: 0 },                   // Нижняя грань (4)
  5: { x: 0, y: 90, z: 0 },                   // Левая грань (5)
  6: { x: 180, y: 0, z: 0 }                   // Задняя грань (6)
};

export function Dice({ value, isRolling, size = 'large' }: DiceProps) {
  const [rotation, setRotation] = useState<DiceRotation>(INITIAL_ROTATION);
  const rotationRef = useRef(INITIAL_ROTATION);
  const animationRef = useRef<number>();

  const renderDots = (faceValue: number) => {
    if (faceValue === 5) {
      return (
        <>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </>
      );
    }
    if (faceValue === 6) {
      return (
        <>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </>
      );
    }
    return null;
  };

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
      console.log('Setting dice to value:', value);
      const targetRotation = valueToRotation[value];
      console.log('Target rotation:', targetRotation);
      
      setRotation(targetRotation);
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
        <div className="face face-1"></div>
        <div className="face face-2"></div>
        <div className="face face-3">
          <div className="center-dot"></div>
        </div>
        <div className="face face-4"></div>
        <div className="face face-5">
          {renderDots(5)}
        </div>
        <div className="face face-6">
          {renderDots(6)}
        </div>
      </div>
    </div>
  );
} 