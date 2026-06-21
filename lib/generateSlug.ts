export function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[''`]/g, "")           // remove apostrophes
    .replace(/[^a-z0-9]+/g, "-")    // non-alphanumeric → dash
    .replace(/^-+|-+$/g, "")        // trim leading/trailing dashes
    .slice(0, 60);
}
