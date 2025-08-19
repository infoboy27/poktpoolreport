import { z } from 'zod';

const envSchema = z.object({
  // Auth
  APP_LOGIN_EMAIL: z.string().email(),
  APP_LOGIN_PASSWORD: z.string().min(1),
  
  // Branding
  BRAND_NAME: z.string().default('PoktPool'),
  BRAND_PRIMARY_HEX: z.string().regex(/^#[0-9A-F]{6}$/i).default('#1F4DD9'),
  BRAND_SECONDARY_HEX: z.string().regex(/^#[0-9A-F]{6}$/i).default('#0A1633'),
  BRAND_LIGHT_HEX: z.string().regex(/^#[0-9A-F]{6}$/i).default('#EAF0FF'),
  BRAND_DARK_HEX: z.string().regex(/^#[0-9A-F]{6}$/i).default('#040915'),
  BRAND_CONVERT_MICRO_UNITS: z.string().default('false').transform(val => val === 'true'),
  
  // Poktpooldb
  POKTPOOLDB_HOST: z.string().min(1),
  POKTPOOLDB_PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  POKTPOOLDB_NAME: z.string().min(1),
  POKTPOOLDB_USER: z.string().min(1),
  POKTPOOLDB_PASSWORD: z.string().min(1),
  
  // Waxtrax
  WAXTRAX_HOST: z.string().min(1),
  WAXTRAX_PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  WAXTRAX_NAME: z.string().min(1),
  WAXTRAX_USER: z.string().min(1),
  WAXTRAX_PASSWORD: z.string().min(1),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
});

// Create a safe env object for build time
export const env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    // For build time, return defaults
    return {
      APP_LOGIN_EMAIL: 'admin@poktpool.com',
      APP_LOGIN_PASSWORD: 'change_me',
      BRAND_NAME: 'PoktPool',
      BRAND_PRIMARY_HEX: '#1F4DD9',
      BRAND_SECONDARY_HEX: '#0A1633',
      BRAND_LIGHT_HEX: '#EAF0FF',
      BRAND_DARK_HEX: '#040915',
      BRAND_CONVERT_MICRO_UNITS: false,
      POKTPOOLDB_HOST: 'localhost',
      POKTPOOLDB_PORT: 5432,
      POKTPOOLDB_NAME: 'poktpooldb',
      POKTPOOLDB_USER: 'postgres_chadmin',
      POKTPOOLDB_PASSWORD: 'placeholder',
      WAXTRAX_HOST: 'localhost',
      WAXTRAX_PORT: 5432,
      WAXTRAX_NAME: 'waxtrax',
      WAXTRAX_USER: 'vultradmin',
      WAXTRAX_PASSWORD: 'placeholder',
      NEXTAUTH_SECRET: 'build-time-secret',
      NEXTAUTH_URL: 'http://localhost:3006',
    };
  }
})();
