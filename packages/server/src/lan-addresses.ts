import { networkInterfaces } from 'node:os';

export function lanAddresses(): string[] {
  const nets = networkInterfaces();
  const addresses: string[] = [];

  for (const entries of Object.values(nets)) {
    if (!entries) {
      continue;
    }

    for (const entry of entries) {
      if (entry.family === 'IPv4' && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }

  return addresses;
}
