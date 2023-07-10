import {NextResponse} from "next/server";

export const middleware = (req) => {
  if(req.nextUrl.pathname.startsWith("/home")) {
    const isAuthorized = req.cookies.has("next-auth.session-token");
    // if authorized proceed with the response
    if(isAuthorized) {
      return NextResponse.next();
    }
    // if not authorized redirect to the login page
    return NextResponse.redirect(new URL('/mst', req.url));
  }
};
