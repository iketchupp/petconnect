export const siteConfig = {
  name: 'PetConnect',
  description: 'A PetConnect egy kisállat örökbefogadásra alkalmas weboldal. ',
  url: new URL(process.env.NEXT_PUBLIC_URL!),
};

export type SiteConfig = typeof siteConfig;
