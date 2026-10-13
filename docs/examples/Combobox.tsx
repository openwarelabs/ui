import { useState } from "react";

import { Combobox, Field } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Combobox",
    category: "Choices",
    description:
        "A text field that suggests options as you type, for picking from a long list: a country, a repository, a person.",
    source: "components/Combobox/Combobox.tsx",
    props: ["ComboboxProps", "ComboboxOption"],
    keyboard: [
        ["Down", "Opens the list, or moves down it."],
        ["Up", "Moves up the list."],
        ["Enter", "Picks the highlighted option."],
        [
            "Escape",
            "Closes the list and puts back the chosen option's name; a second Escape clears the field.",
        ],
    ],
    notes: [
        'The field has role="combobox" with aria-autocomplete="list"; the highlighted option is announced as you move.',
        "Leaving the field without picking puts back the last chosen option, unless allowCustomValue is on.",
    ],
    related: ["Select", "SearchField"],
};

const countries = [
    { value: "ie", label: "Ireland" },
    { value: "ch", label: "Switzerland" },
    { value: "br", label: "Brazil" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "pt", label: "Portugal" },
    { value: "es", label: "Spain" },
    { value: "nl", label: "Netherlands" },
    { value: "it", label: "Italy" },
    { value: "se", label: "Sweden" },
];

/** Type to filter; matches anywhere in the name. */
export function Basic() {
    const [country, setCountry] = useState("ie");
    return (
        <div style={{ width: 300, maxWidth: "100%" }}>
            <Field label="Country">
                <Combobox
                    options={countries}
                    value={country}
                    onChange={setCountry}
                    placeholder="Search countries"
                />
            </Field>
        </div>
    );
}

/** Descriptions are searched too. */
export function WithDescriptions() {
    return (
        <div style={{ width: 340, maxWidth: "100%" }}>
            <Field label="Repository">
                <Combobox
                    placeholder="Search repositories"
                    options={[
                        {
                            value: "open-seo",
                            label: "openwarelabs/open-seo",
                            description: "SEO audits for small sites",
                        },
                        {
                            value: "open-paste",
                            label: "openwarelabs/open-paste",
                            description: "A paste bin you host",
                        },
                        {
                            value: "open-palette",
                            label: "openwarelabs/open-palette",
                            description: "Colour palettes from photos",
                        },
                        {
                            value: "cleaner",
                            label: "openwarelabs/cleaner",
                            description: "Checks a repo's conventions",
                        },
                    ]}
                />
            </Field>
        </div>
    );
}

/** allowCustomValue keeps whatever was typed, for tags and labels that may not exist yet. */
export function CustomValue() {
    const [label, setLabel] = useState("");
    return (
        <div style={{ width: 300, maxWidth: "100%" }}>
            <Field label="Label" hint={label ? `Value: ${label}` : "Pick one, or type a new one."}>
                <Combobox
                    allowCustomValue
                    value={label}
                    onChange={setLabel}
                    placeholder="bug, feature…"
                    options={[
                        { value: "bug", label: "bug" },
                        { value: "feature", label: "feature" },
                        { value: "design", label: "design" },
                    ]}
                />
            </Field>
        </div>
    );
}
