import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";


async function createAuthClient() {
    const authClient = await AuthClient.create();
    return authClient;
}

export const createAgent = () => {
    const httpAgent = new HttpAgent({
        host: process.env.NEXT_PUBLIC_IC_HOST || "http://localhost:4943",
    })
    httpAgent.fetchRootKey(); // ✅ Required for local development

    // if (process.env.NODE_ENV !== "production") {
    //     httpAgent.fetchRootKey(); // ✅ Required for local development
    // }
    return httpAgent
}


