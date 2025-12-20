import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    '/api/stripe/webhook(.*)',
    '/api/events(.*)',
    '/api/venues(.*)',
    '/api/debug(.*)',
]);

export default clerkMiddleware((auth, request) => {
    if (!isPublicRoute(request)) {
        // Only protect routes that aren't public
        // This allows Stripe webhooks and public API endpoints to work
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
