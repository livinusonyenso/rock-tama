import { forwardAuthRequest } from "@/lib/server/auth-gateway";

/** Same-origin gateway to the Express auth API (D-134): register, login, logout and me only. */
type Context = { params: Promise<{ action: string }> };

async function handle(request: Request, { params }: Context) {
  return forwardAuthRequest(request, (await params).action);
}

export { handle as GET, handle as POST };
