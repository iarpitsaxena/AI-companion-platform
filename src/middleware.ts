import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The below regex is used to match all the routes that need authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/companions(.*)",
  "/chat(.*)",
  "/notes(.*)",
  "/todos(.*)",
  "/history(.*)",
  "/analytics(.*)",
  "/profile(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// The below regex is used to exclude static files and api routes from the middleware
// This is important because we don't want to run the middleware on every request, only on the ones that need authentication, js(?!on) is used so that the middleware will run on json files but not on js files, this is important because we want to run the middleware on api routes that end with .json but not on static js files
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
