import { Newsletter02 } from "@openwarelabs/blocks";
import { Text } from "@openwarelabs/ui";
import { Mail } from "lucide-react";

export function NewsletterCard() {
    return (
        <Newsletter02
            icon={<Mail size={20} />}
            title="Get the next post by email"
            description="Field notes on shipping software with agents, from the people who build Acme. A new post every other Thursday, about a six-minute read."
            submitLabel="Subscribe"
            // Stands in for the request to your mailing list.
            onSubmit={() => new Promise((resolve) => window.setTimeout(resolve, 700))}
            successTitle="Check your inbox"
            successDescription={(email) => `We've sent a link to ${email}. Open it to confirm, and the next post comes to you.`}
            authors={["Clara Novak", "Jonas Berg", "Sam Okafor"]}
            authorsNote={
                <>
                    <Text as="strong" variant="label" tone="soft">
                        Clara, Jonas and Sam
                    </Text>{" "}
                    write it for 9,400 readers.
                </>
            }
            archiveLink={{ label: "Read past posts", href: "#" }}
        />
    );
}
