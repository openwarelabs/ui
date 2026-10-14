import { Newsletter01 } from "@openwarelabs/blocks";

/** The changelog goes out on the first Tuesday of each month. */
function nextIssueDate(from = new Date()) {
    for (let offset = 0; offset < 2; offset += 1) {
        const date = new Date(from.getFullYear(), from.getMonth() + offset, 1);
        while (date.getDay() !== 2) date.setDate(date.getDate() + 1);
        if (date > from) {
            const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
            return `${weekday} ${date.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
        }
    }
    return "";
}

export function NewsletterInline() {
    return (
        <Newsletter01
            eyebrow="Changelog"
            title="What shipped this month"
            description="One email on the first Tuesday of the month: what's new in Acme, what's coming next, and one longer note on working with agents."
            submitLabel="Subscribe"
            // Stands in for the request to your mailing list.
            onSubmit={() => new Promise((resolve) => window.setTimeout(resolve, 700))}
            note="Unsubscribe in one click. We never share your address."
            successTitle="You're on the list"
            successDescription={(email) => `The next changelog goes to ${email} on ${nextIssueDate()}.`}
        />
    );
}
