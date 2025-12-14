export function formatUrl(url: string, maxLength: number = 60): string {
  if (url.length <= maxLength) {
    return url;
  }
  
  const start = url.substring(0, maxLength / 2 - 3);
  const end = url.substring(url.length - maxLength / 2 + 3);
  return `${start}...${end}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getVerdictColor(verdict: 'safe' | 'suspicious' | 'dangerous'): string {
  switch (verdict) {
    case 'safe':
      return 'text-accent-safe';
    case 'suspicious':
      return 'text-accent-suspicious';
    case 'dangerous':
      return 'text-accent-dangerous';
    default:
      return 'text-text-secondary';
  }
}

export function getVerdictBgColor(verdict: 'safe' | 'suspicious' | 'dangerous'): string {
  switch (verdict) {
    case 'safe':
      return 'bg-accent-safe/10';
    case 'suspicious':
      return 'bg-accent-suspicious/10';
    case 'dangerous':
      return 'bg-accent-dangerous/10';
    default:
      return 'bg-background-secondary';
  }
}

