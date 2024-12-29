'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useTestContract } from '@/hooks/useTestContract';
import { SafeArea } from './SafeArea';
import { PageTransition } from './PageTransition';

export function WithdrawPage() {
  const router = useRouter();
  const { sender } = useTonConnect();
  const { contractBalance } = useTestContract();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const availableBalance = Number(contractBalance || 0) / 1e9;
  const minWithdraw = 2;

  return (
    <SafeArea>
      <PageTransition>
        <div className="page-container">
          <div className="withdraw-page">
            <div className="withdraw-container">
              {/* Заголовок */}
              <div className="withdraw-header">
                <button 
                  onClick={() => router.back()}
                  className="back-button"
                >
                  ←
                </button>
                <h1 className="text-2xl font-bold">Withdraw</h1>
              </div>

              {/* Предупреждение */}
              <div className="warning-box">
                <span className="text-yellow-500">⚠️</span>
                <p className="text-sm">
                  Withdrawals are made only to an external TON wallet (e.g. TonSpace, Tonkeeper, Tonhub, MyTonWallet). 
                  Do not attempt to withdraw funds to your exchange platform account, this feature will be available later.
                </p>
              </div>

              {/* Форма вывода */}
              <div className="withdraw-form">
                {/* Адрес */}
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <div className="input-container">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter address"
                      className="form-input"
                    />
                    <button className="paste-button">
                      Paste
                    </button>
                  </div>
                </div>

                {/* Сумма */}
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <div className="input-container">
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter your amount"
                      className="form-input"
                    />
                    <span className="currency-label">TON</span>
                    <button className="max-button">
                      Max
                    </button>
                  </div>
                </div>

                {/* Информация */}
                <div className="info-container">
                  <div className="min-amount">
                    {minWithdraw} TON minimum
                  </div>
                  <div className="available-balance">
                    Available {availableBalance.toFixed(2)} TON
                  </div>
                </div>

                {/* Кнопка отправки */}
                <button 
                  className="next-button"
                  disabled={!sender || !address || !amount}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </SafeArea>
  );
} 