# Test SubPath in nextJs with next-auth

This project is set up to test subpath in NextAuth.js with an authentication provider with two options: GitHub and Keycloak. To run the project with GitHub as the provider, you need to configure the following environment variables in the .env file:

## GitHub Provider

- `NEXT_PUBLIC_BASE_PATH`: The base URL path of your application.
- `NEXTAUTH_URL`: The URL of your application.

Additionally, you need to provide the following GitHub-specific environment variables:

- `GITHUB_CLIENT_ID`: Your GitHub client ID obtained from the GitHub Developer Settings.
- `GITHUB_CLIENT_SECRET`: Your GitHub client secret obtained from the GitHub Developer Settings.

## Keycloak Provider

If you want to use Keycloak as the authentication provider, you will need to comment above-mentioned two keys and uncomment the following environment variables and provide their values:

- `# NEXTAUTH_SECRET`: A secret key used for secure session encryption. You can generate a random value for this.
- `# NEXTAUTH_JWT_SIGNING_PRIVATE_KEY`: A private key used for signing JSON Web Tokens (JWTs). Again, generate a secure random value for this.
- `# NEXTAUTH_KEYCLOAK_SECRET`: A secret key specific to Keycloak. Generate a secure random value for this as well.

You also need to provide the following public environment variables specific to Keycloak:

- `# NEXT_PUBLIC_KEYCLOAK_ISSUER`: The issuer URL of your Keycloak server.
- `# NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`: The client ID registered in Keycloak.

Make sure to configure the required environment variables based on the chosen provider before running the project.

## Running the Project

To run the project, follow these steps:

1. Clone the repository.
2. Install the project dependencies using your preferred package manager (`npm install` or `yarn install`).
3. Configure the required environment variables based on the authentication provider you choose.
4. Run the project using the appropriate command (`npm run dev` or `yarn dev`).

That's it! You should now be able to run the project with either GitHub or Keycloak as the authentication provider. Enjoy!