import React from 'react';
import './ConnectionStatusIndicator.css';

export type ConnectionStatus = 'connecting' | 'connected' | 'error';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
}

export function ConnectionStatusIndicator({ status }: ConnectionStatusIndicatorProps) {
  return (
    <div className={`connection-status ${status}`}>
      <div className="connection-indicator-dot"></div>
      <span>
        {(() => {
          switch (status) {
            case 'connecting':
              return 'Подключение...';
            case 'connected':
              return 'Подключено';
            case 'error':
              return 'Ошибка подключения';
            default:
              return '';
          }
        })()}
      </span>
    </div>
  );
} 