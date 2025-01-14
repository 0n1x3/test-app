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

// Правильные углы для каждой грани
const valueToRotation: Record<number, DiceRotation> = {
  1: { x: 0, y: 0, z: 0 },         // Передняя грань (1)
  2: { x: 0, y: -90, z: 0 },       // Правая грань (2)
  3: { x: -90, y: 0, z: 0 },       // Верхняя грань (3)
  4: { x: 90, y: 0, z: 0 },        // Нижняя грань (4)
  5: { x: 0, y: 90, z: 0 },        // Левая грань (5)
  6: { x: 180, y: 0, z: 0 }        // Задняя грань (6)
};

export function Dice({ value, isRolling, size = 'large' }: DiceProps) {
  const [rotation, setRotation] = useState<DiceRotation>({ x: 0, y: 0, z: 0 });
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  const animationRef = useRef<number>();

  const animate = () => {
    if (!isRolling) {
      cancelAnimationFrame(animationRef.current!);
      return;
    }

    // Плавное вращение во время броска
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
      // Начинаем анимацию броска
      animationRef.current = requestAnimationFrame(animate);
    } else if (value) {
      // Плавно переходим к конечному положению
      const targetRotation = valueToRotation[value];
      
      // Добавляем дополнительные обороты для более естественного завершения
      const finalRotation = {
        x: targetRotation.x + Math.floor(rotationRef.current.x / 360) * 360,
        y: targetRotation.y + Math.floor(rotationRef.current.y / 360) * 360,
        z: targetRotation.z + Math.floor(rotationRef.current.z / 360) * 360
      };

      setRotation(finalRotation);
      rotationRef.current = finalRotation;
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
        <div className="face back">
          <span className="dot top left"></span>
          <span className="dot top right"></span>
          <span className="dot center"></span>
          <span className="dot bottom left"></span>
          <span className="dot bottom right"></span>
          <span className="dot center"></span>
        </div>
        <div className="face right">
          <span className="dot top left"></span>
          <span className="dot top right"></span>
          <span className="dot bottom left"></span>
        </div>
        <div className="face left">
          <span className="dot top left"></span>
          <span className="dot top right"></span>
          <span className="dot center"></span>
          <span className="dot bottom left"></span>
          <span className="dot bottom right"></span>
        </div>
        <div className="face top">
          <span className="dot top left"></span>
          <span className="dot top right"></span>
        </div>
        <div className="face bottom">
          <span className="dot top left"></span>
          <span className="dot top right"></span>
          <span className="dot bottom left"></span>
          <span className="dot bottom right"></span>
        </div>
      </div>
    </div>
  );
} 