import { Address } from '@ton/core';

export const formatTonAmount = (amount: number): string => {
  return amount.toFixed(2);
};

export const formatAddress = (address: string): string => {
  try {
    const addr = Address.parse(address);
    const userFriendly = addr.toFriendly();
    return `${userFriendly.slice(0, 6)}...${userFriendly.slice(-4)}`;
  } catch {
    return address;
  }
}; 