import { createHash, createHmac } from 'crypto';

export class TelegramInitData {
  private readonly data: Map<string, string>;
  private readonly hash: string;

  constructor(initData: string) {
    const params = new URLSearchParams(initData);
    this.hash = params.get('hash') || '';
    
    // Создаем новую Map без hash параметра
    this.data = new Map();
    params.forEach((value, key) => {
      if (key !== 'hash') {
        this.data.set(key, value);
      }
    });
  }

  validate(botToken: string): boolean {
    const checkString = Array.from(this.data.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    console.log('Debug validation:', {
      dataEntries: Array.from(this.data.entries()),
      checkString,
      hash: this.hash
    });

    const secretKey = createHash('sha256')
      .update(botToken)
      .digest();

    const generatedHash = createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    return this.hash === generatedHash;
  }
} 