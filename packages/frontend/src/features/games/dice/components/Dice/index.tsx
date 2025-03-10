'use client';

import { useEffect, useState, useRef } from 'react';
import './style.css';

interface DiceProps {
  value: number;
  rolling?: boolean;
  size?: 'small' | 'medium' | 'large';
  onRollEnd?: () => void;
  enhancedAnimation?: boolean;
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

export function Dice({ value, rolling, size = 'large', onRollEnd, enhancedAnimation = false }: DiceProps) {
  const [rotation, setRotation] = useState<DiceRotation>(INITIAL_ROTATION);
  const rotationRef = useRef(INITIAL_ROTATION);
  const animationRef = useRef<number>();
  const animationStepsRef = useRef(0);
  const targetRotationRef = useRef<DiceRotation>({ ...INITIAL_ROTATION });
  const prevValueRef = useRef<number>(value);
  // Добавляем флаг для отслеживания состояния анимации
  const isAnimatingRef = useRef<boolean>(false);

  // Анимация броска кубика
  const animate = () => {
    if (!rolling) {
      cancelAnimationFrame(animationRef.current!);
      isAnimatingRef.current = false; // Сбрасываем флаг анимации
      return;
    }

    // Защита от дублирования анимации
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      console.log('Начало анимации для кубика', value);
    }

    // Увеличиваем шаги анимации для отслеживания длительности
    animationStepsRef.current += 1;

    // Скорость вращения зависит от enhancedAnimation
    if (enhancedAnimation) {
      // Более быстрое и хаотичное вращение для мультиплеера
      rotationRef.current.x += 15;
      rotationRef.current.y += 18;
      rotationRef.current.z += 12;
    } else {
      // Стандартное вращение для игры с ботом
      rotationRef.current.x += 8;
      rotationRef.current.y += 10;
      rotationRef.current.z += 6;
    }

    setRotation({
      x: rotationRef.current.x,
      y: rotationRef.current.y,
      z: rotationRef.current.z
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Инициализация при первом рендере
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
    }

    if (rolling) {
      // Сохраняем целевое вращение для будущего использования
      targetRotationRef.current = { ...valueToRotation[value] };
      
      // Сбрасываем шаги анимации
      animationStepsRef.current = 0;
      
      // Начинаем анимацию
      animationRef.current = requestAnimationFrame(animate);
    } else if (value) {
      // Если включена улучшенная анимация и только что завершилась анимация броска
      if (enhancedAnimation && animationStepsRef.current > 0) {
        console.log('Finishing enhanced dice roll animation to value:', value);
        
        // Получаем целевое вращение для нового значения кубика
        const targetRotation = valueToRotation[value];
        console.log('Target rotation:', targetRotation);
        
        // Добавляем несколько полных оборотов для более зрелищной анимации
        const extraRotations = {
          x: targetRotation.x + 360 * 2, // 2 дополнительных оборота по X
          y: targetRotation.y + 360 * 3, // 3 дополнительных оборота по Y
          z: targetRotation.z + 360 * 1  // 1 дополнительный оборот по Z
        };
        
        // Устанавливаем конечную анимацию
        // Используем setTimeout для создания перехода между значениями
        setTimeout(() => {
          setRotation(extraRotations);
          
          // Затем устанавливаем конечную позицию без дополнительных оборотов
          setTimeout(() => {
            setRotation(targetRotation);
            
            // Сбрасываем счетчик шагов анимации
            animationStepsRef.current = 0;
            
            // Вызываем колбэк завершения анимации, если он передан
            if (onRollEnd) {
              onRollEnd();
            }
          }, 500); // Даем 500мс на завершение анимации
          
        }, 0);
      } else {
        // Стандартная анимация для игры с ботом
        console.log('Setting dice to value:', value);
        const targetRotation = valueToRotation[value];
        console.log('Target rotation:', targetRotation);
        setRotation(targetRotation);
        
        // Сбрасываем счетчик шагов анимации
        animationStepsRef.current = 0;
        
        // Вызываем колбэк завершения анимации, если он передан
        if (onRollEnd) {
          onRollEnd();
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rolling, value, onRollEnd, enhancedAnimation]);

  // Функция для рендеринга правильного количества точек для каждой грани
  const renderDots = (faceValue: number) => {
    if (faceValue === 1) {
      return null; // Для грани 1 точка добавляется через CSS ::after
    }
    
    if (faceValue === 2 || faceValue === 3) {
      return <div className="dot"></div>; // Третья точка для грани 3
    }
    
    // Для граней 4, 5, 6 создаем нужное количество точек
    const dots = [];
    for (let i = 0; i < faceValue; i++) {
      dots.push(<div key={i} className="dot"></div>);
    }
    return dots;
  };

  return (
    <div className={`dice-container ${size}`}>
      <div 
        className={`dice ${rolling ? 'rolling' : ''} ${enhancedAnimation ? 'enhanced-animation' : ''}`}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
        }}
      >
        <div className="face face-1"></div>
        <div className="face face-2"></div>
        <div className="face face-3">
          {value === 3 && <div className="dot"></div>}
        </div>
        <div className="face face-4">
          {value === 4 && Array.from({length: 4}).map((_, i) => <div key={i} className="dot"></div>)}
        </div>
        <div className="face face-5">
          {value === 5 && Array.from({length: 5}).map((_, i) => <div key={i} className="dot"></div>)}
        </div>
        <div className="face face-6">
          {value === 6 && Array.from({length: 6}).map((_, i) => <div key={i} className="dot"></div>)}
        </div>
      </div>
    </div>
  );
} 