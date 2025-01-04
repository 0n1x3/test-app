'use client';

import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from '@ton/ton';
import { useEffect, useState } from 'react';

export function useTonClient() {
  const [client, setClient] = useState<TonClient | null>(null);

  useEffect(() => {
    async function init() {
      const endpoint = await getHttpEndpoint({ network: "testnet" });
      setClient(new TonClient({ endpoint }));
    }
    init();
  }, []);

  return {
    client
  };
} 