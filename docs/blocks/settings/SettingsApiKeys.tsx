import { Settings03, type Settings03Key } from "@openwarelabs/blocks";
import { Link, toast } from "@openwarelabs/ui";

const keys: Settings03Key[] = [
    {
        id: "k1",
        name: "CI deploys",
        prefix: "acme_3f9a2c7d",
        access: "Read and write",
        createdBy: "Siobhan Murphy",
        created: "12 Mar 2026",
        lastUsed: "2 hours ago",
    },
    { id: "k2", name: "Status page", prefix: "acme_81be04c2", access: "Read only", createdBy: "Declan Walsh", created: "3 Jun 2026", lastUsed: "Yesterday" },
    { id: "k3", name: "Release bot", prefix: "acme_c47d19ea", access: "Read and write", createdBy: "Aoife O'Sullivan", created: "28 Aug 2026" },
    {
        id: "k4",
        name: "Quarterly export",
        prefix: "acme_0b6e55f1",
        access: "Read only",
        createdBy: "Róisín O'Brien",
        created: "2 Jan 2026",
        lastUsed: "3 months ago",
    },
];

const accessOptions = [
    { value: "Read only", label: "Read only", description: "See projects, deploys and runs." },
    { value: "Read and write", label: "Read and write", description: "Also start deploys and agent runs." },
];

const expiryOptions = [
    { value: "30", label: "In 30 days" },
    { value: "90", label: "In 90 days" },
    { value: "365", label: "In a year" },
    { value: "never", label: "Never" },
];

/** Random letters and digits, for the sample key. A real key comes from your server. */
function randomText(length: number, alphabet: string) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function SettingsApiKeys() {
    return (
        <Settings03
            title="API keys"
            description="Keys let scripts and CI use the Acme API on behalf of this workspace. Treat them like passwords."
            keys={keys}
            accessOptions={accessOptions}
            expiryOptions={expiryOptions}
            defaultExpiry="90"
            // Stands in for your server, which makes the key and sends back the whole of it once.
            onCreateKey={({ name, access }) => {
                const prefix = `acme_${randomText(8, "0123456789abcdef")}`;
                const secret = randomText(32, "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789");
                return { key: { id: prefix, name, prefix, access, createdBy: "Siobhan Murphy", created: "Today" }, secret: `${prefix}_${secret}` };
            }}
            onRevokeKey={async (key) => {
                await new Promise((resolve) => window.setTimeout(resolve, 700));
                toast(`Revoked ${key.name}`, { description: "Requests with it now get a 401." });
            }}
            note={
                <>
                    Use a separate key for each place you use one, so you can revoke it without breaking the rest. <Link href="#">Read the API guide</Link>
                </>
            }
            labels={{
                createDescription: "The key works for every project in Acme. You'll see it once, straight after you create it.",
                emptyDescription: "Create one to use the Acme API from a script or your CI.",
            }}
        />
    );
}
