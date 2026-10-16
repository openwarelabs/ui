import { Field, Fieldset, Input } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Fieldset",
    category: "Primitives",
    description:
        "Groups related controls under a legend: an address, a pair of dates, a set of options.",
    source: "components/Checkbox/Checkbox.tsx",
    notes: ["It's a native fieldset, so disabled turns off every control inside it at once."],
    related: ["Field", "CheckboxGroup", "RadioGroup"],
};

/** A legend, a description and the controls. */
export function Basic() {
    return (
        <div style={{ width: 420, maxWidth: "100%" }}>
            <Fieldset legend="Billing address" description="Shown on your invoices.">
                <Field label="Street">
                    <Input defaultValue="Bahnhofstrasse 1" />
                </Field>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "120px minmax(0, 1fr)",
                        gap: "var(--ow-space-md)",
                    }}
                >
                    <Field label="Postcode">
                        <Input defaultValue="8001" />
                    </Field>
                    <Field label="City">
                        <Input defaultValue="Zürich" />
                    </Field>
                </div>
            </Fieldset>
        </div>
    );
}
Basic.layout = { align: "start" as const };

/** disabled turns off everything inside. */
export function Disabled() {
    return (
        <div style={{ width: 420, maxWidth: "100%" }}>
            <Fieldset legend="API key" description="Your organisation manages this." disabled>
                <Field label="Key">
                    <Input defaultValue="sk-•••••••••••• 4f2a" />
                </Field>
            </Fieldset>
        </div>
    );
}
Disabled.layout = { align: "start" as const };
