import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;

  // JANGAN gate "/" — BIANG KEROK
  if (nextUrl.pathname === "/login" && req.auth) {
    return Response.redirect(new URL("/", nextUrl));
  }

  // BIARKAN /admin lewat
  // Auth SESUNGGUHNYA ADA DI SERVER PAGE
  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
