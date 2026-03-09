import { auth } from "@clerk/nextjs/server";

// This function can be used in server components and api routes to get the user id of the currently logged in user, if there is no user logged in it will throw an error, this is useful because it ensures that the user is authenticated before accessing any protected resources.
// -- Note: This function should only be used in server components and api routes, it should not be used in client components because it will throw an error when trying to access the user id on the client side, for client components use the useUser hook from @clerk/nextjs instead.
// Auth is a class that includes protect() method, that can be used to checks if the user is authenticated, and to check if the user is authorized.
export async function requireUserId() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}
