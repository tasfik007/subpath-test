import '../styles/globals.css'
import {SessionProvider} from "next-auth/react";

function MyApp({ Component, pageProps }) {
    const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;
    return (
        <SessionProvider session={pageProps.session} basePath={BASE_PATH ? `/${BASE_PATH}/api/auth` : undefined}>
            <Component {...pageProps} />
        </SessionProvider>
    )
}

export default MyApp
