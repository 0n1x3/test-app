'use client';

import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, Sender, SenderArguments } from '@ton/core';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();

  const sender: Sender | null = tonConnectUI.account ? {
    address: Address.parse(tonConnectUI.account.address),
    send: async (args: SenderArguments) => {
      await tonConnectUI.sendTransaction({
        messages: [
          {
            address: args.to.toString(),
            amount: args.value.toString(),
            payload: args.body?.toBoc().toString('base64'),
          },
        ],
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
      });
    },
  } : null;

  return {
    tonConnectUI,
    sender: tonConnectUI.connected && tonConnectUI.account ? sender : null,
  };
}