import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";


async function createAuthClient() {
    const authClient = await AuthClient.create();
    return authClient;
}

async function getAuthClient() {
}

export const createAgent = async () => {
    const host = process.env.NEXT_PUBLIC_IC_HOST || "http://localhost:4943"
    const httpAgent = new HttpAgent({
        host: host,
    })
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
        try {
            await httpAgent.fetchRootKey(); // Required for local development
        } catch (error) {
            console.error("Failed to fetch root key:", error);
        }
    }

    return httpAgent
}


