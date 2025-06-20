import { defineMiddleware } from "astro:middleware";
import { siteConfig } from "./config/site";

export const onRequest = defineMiddleware(async (context, next) => {
  // Allow access to the maintenance page itself
  if (context.url.pathname === "/maintenance") {
    return next();
  }

  // Check if maintenance mode is enabled
  if (siteConfig.maintenanceMode) {
    return context.redirect("/maintenance");
  }

  // Continue with normal request processing
  return next();
});
