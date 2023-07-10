import NextAuth from 'next-auth';
import {githubProviderConfig} from "./githubProviderConfig";

export default NextAuth(githubProviderConfig);
