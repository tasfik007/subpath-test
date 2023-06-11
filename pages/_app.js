import '../styles/globals.css'
import {SessionProvider} from "next-auth/react";

function MyApp({ Component, pageProps }) {
    return (
        <SessionProvider session={pageProps.session} basePath={`/${process.env.NEXT_PUBLIC_BASEPATH}/api/auth`}>
            <Component {...pageProps} />
        </SessionProvider>
    )
}

export default MyApp
