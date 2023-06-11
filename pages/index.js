import Head from 'next/head';
import React from 'react';
import {
    signIn,
    signOut,
    useSession
} from "next-auth/react";
import Link from 'next/link';
import {useRouter} from "next/router";

const  home = () => {
    const router = useRouter();

    const {data: session} = useSession();

    return (
        <div>
            <Head>
                <title>SubPath Test</title>
            </Head>

            <main>

                {!session && <>
                    <h1>You are not signed in</h1> <br/>
                    <button onClick={signIn}>Sign in</button>
                </>}

                {session && <>
                    <h1>Signed in as {session.user.name} </h1> <br/>
                    <button onClick={() => router.push("/app")}>Go to APP</button> <br/>
                    <button onClick={signOut}>Sign out</button>
                </>}

            </main>
        </div>
    )
}

export default home;
