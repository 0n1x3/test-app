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
  6: { x: 180, y: 0, z: 0 },                  // Задняя грань (6)
  2: { x: 0, y: -90, z: 0 },                  // Правая грань (2)
  5: { x: 0, y: 90, z: 0 },                   // Левая грань (5)
  3: { x: -90, y: 0, z: 0 },                  // Верхняя грань (3)
  4: { x: 90, y: 0, z: 0 }                    // Нижняя грань (4)
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
      console.log('Setting dice to value:', value);
      const targetRotation = valueToRotation[value];
      console.log('Target rotation:', targetRotation);
      
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