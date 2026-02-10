import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Verify the caller is an authenticated admin user.
 * Returns the session if valid, or a JSON 401 Response if not.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return {
      authorized: false,
      response: Response.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 },
      ),
    };
  }

  return { authorized: true, session };
}
