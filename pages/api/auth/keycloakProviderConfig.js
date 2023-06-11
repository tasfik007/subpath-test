import KeycloakProvider from "next-auth/providers/keycloak";
import axios from "axios";

export const signOutCustom = function (token) {
  return axios.post(
    "".concat(
      process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER,
      "/protocol/openid-connect/logout"
    ),
    new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      client_secret: process.env.NEXTAUTH_KEYCLOAK_SECRET,
      refresh_token: token.refresh_token,
    })
  );
};

const refreshAccessToken = async (token) => {
  try {
    if (Date.now() > token.refreshTokenExpired) throw Error;
    const details = {
      client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      client_secret: process.env.NEXTAUTH_KEYCLOAK_SECRET,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    };
    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const url = `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/token`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: formBody,
    });
    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token,
      accessTokenExpired: Date.now() + (refreshedTokens.expires_in - 15) * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      refreshTokenExpired:
        Date.now() + (refreshedTokens.refresh_expires_in - 15) * 1000,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
};

export const keycloakProviderConfig = {
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.NEXTAUTH_KEYCLOAK_SECRET,
      issuer: process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.refresh_token = account.refresh_token;
        token.idToken = account.id_token;
        token.accessTokenExpired = (account.expired_at - 15) * 1000;
        token.refreshTokenExpired =
          Date.now() + (account.refresh_expires_in - 15) * 1000;
        token.user = user;
        return token;
      }

      if (Date.now() < token.accessTokenExpired) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user;
        session.error = token.error;
        session.accessToken = token.accessToken;
      }
      if (session?.error === "RefreshAccessTokenError") {
        signOutCustom(token);
        return null;
      }
      return session;
    },
    cookies: {
      sessionToken: {
        name:
          process.env.NODE_ENV === "production"
            ? `__Secure-next-auth.session-token`
            : `next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
  },
  events: {
    async signOut({ session, token }) {
      await signOutCustom(token);
    },
  },
};
