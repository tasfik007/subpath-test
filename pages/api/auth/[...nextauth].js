import NextAuth from 'next-auth';
import {keycloakProviderConfig} from "./keycloakProviderConfig";
import {githubProviderConfig} from "./githubProviderConfig";

export default NextAuth(githubProviderConfig);
// export default NextAuth(keycloakProviderConfig);
