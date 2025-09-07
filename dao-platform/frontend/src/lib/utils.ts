import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, length = 4): string {
  if (!address) return '';
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

export function formatNumber(value: number | bigint): string {
  if (typeof value === 'bigint') {
    value = Number(value);
  }
  
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  
  return value.toLocaleString();
}

export function formatTokenAmount(amount: bigint, decimals = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  
  if (remainder === 0n) {
    return whole.toString();
  }
  
  const decimal = remainder.toString().padStart(decimals, '0');
  const trimmed = decimal.replace(/0+$/, '');
  
  return `${whole}.${trimmed}`;
}

export function parseTokenAmount(amount: string, decimals = 18): bigint {
  const parts = amount.split('.');
  const whole = BigInt(parts[0] || 0);
  const decimal = parts[1] || '';
  
  const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals);
  const decimalBigInt = BigInt(paddedDecimal);
  
  return whole * BigInt(10 ** decimals) + decimalBigInt;
}

export function calculatePercentage(part: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Number((part * 100n) / total);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

export function timeRemaining(endDate: Date): string {
  const seconds = Math.floor((endDate.getTime() - Date.now()) / 1000);
  
  if (seconds <= 0) return 'Ended';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}