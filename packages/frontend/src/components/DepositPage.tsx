'use client';

import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useRouter } from 'next/navigation';
import { CONTRACT_ADDRESS } from '@/config';
import { SafeArea } from './SafeArea';
import { PageTransition } from './PageTransition';

export function DepositPage() {
  const { sender } = useTonConnect();
  const router = useRouter();
  const walletAddress = CONTRACT_ADDRESS;

  return (
    <SafeArea>
      <PageTransition>
        <div className="deposit-page">
          <div className="deposit-container">
            {/* Заголовок */}
            <div className="deposit-header">
              <button 
                onClick={() => router.back()}
                className="back-button"
              >
                ←
              </button>
              <h1 className="text-2xl font-bold">Deposit</h1>
            </div>

            {/* Предупреждение */}
            <div className="warning-box">
              <span className="text-yellow-500">⚠️</span>
              <p className="text-sm">Send only TON to this address. Sending other assets may result in permanent loss.</p>
            </div>

            {/* Адрес кошелька */}
            <div className="space-y-2 mb-6">
              <label className="text-sm text-gray-400">Wallet address</label>
              <div className="address-box">
                <span className="font-mono text-sm break-all">{walletAddress}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  className="copy-button"
                >
                  📋
                </button>
              </div>
            </div>

            {/* QR код */}
            <div className="mb-6">
              <div className="text-center text-sm text-gray-400 mb-2">Scan to deposit</div>
              <div className="qr-box flex items-center justify-center">
                <span className="text-gray-600">QR Code</span>
              </div>
            </div>

            {/* Кнопка подключения */}
            <div className="flex justify-center">
              <TonConnectButton />
            </div>
          </div>
        </div>
      </PageTransition>
    </SafeArea>
  );
} 