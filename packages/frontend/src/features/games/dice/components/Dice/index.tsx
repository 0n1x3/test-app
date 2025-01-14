'use client';

import { useEffect, useState } from 'react';
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

type ValueToRotation = {
  [key: number]: DiceRotation;
};

export function Dice({ value, isRolling, size = 'large' }: DiceProps) {
  const [rotation, setRotation] = useState<DiceRotation>({ x: 0, y: 0, z: 0 });

  // Маппинг значений на повороты куба
  const valueToRotation: ValueToRotation = {
    1: { x: 0, y: 0, z: 0 },
    2: { x: -90, y: 0, z: 0 },
    3: { x: 0, y: 90, z: 0 },
    4: { x: 0, y: -90, z: 0 },
    5: { x: 90, y: 0, z: 0 },
    6: { x: 180, y: 0, z: 0 }
  };

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setRotation({
          x: Math.random() * 360,
          y: Math.random() * 360,
          z: Math.random() * 360
        });
      }, 50);

      return () => clearInterval(interval);
    } else if (value) {
      setRotation(valueToRotation[value]);
    }
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