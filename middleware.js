import {NextResponse} from "next/server";


const checkAuthorization = async (req) => {
  return req.headers.get('cookie')?.includes('next-auth.session-token');
}

export const middleware = async (req) => {
  if(req.nextUrl.pathname.startsWith("/home")) {
    const isAuthorized = await checkAuthorization(req);
    if(isAuthorized) {
      return req.next;
    }
    const url = req.nextUrl.clone();
    url.pathname = `/unauthorized`;
    url.basePath = "/mst"
    url.search = "";
    return NextResponse.redirect(url);
  } else return req.next;
};
