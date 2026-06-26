import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mitsurutopup.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/api",
        "/api/*",
        "/dashboard",
        "/dashboard/*",
        "/checkout",
        "/checkout/*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
