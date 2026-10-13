import { Badge, Table, type TableColumn } from "@openwarelabs/ui";

import { props as allProps } from "docs:props";

import type { PropDoc } from "./types";

const columns: Array<TableColumn<PropDoc>> = [
    {
        key: "name",
        header: "Prop",
        width: "20%",
        render: (prop) => (
            <span className="docs-prop__name">
                <code>{prop.name}</code>
                {prop.required ? (
                    <Badge size="sm" variant="active" className="docs-prop__required">
                        Required
                    </Badge>
                ) : null}
            </span>
        ),
    },
    { key: "type", header: "Type", width: "28%", render: (prop) => <code className="docs-prop__type">{prop.type}</code> },
    {
        key: "default",
        header: "Default",
        width: "14%",
        render: (prop) => (prop.default ? <code className="docs-prop__default">{prop.default}</code> : <span className="docs-prop__none">—</span>),
    },
    { key: "description", header: "Description", render: (prop) => <span className="docs-prop__description">{prop.description || "—"}</span> },
];

/** The props of one interface, read from the TypeScript source at build time. */
export function PropsTable({ name }: { name: string }) {
    const doc = allProps[name];
    if (!doc) return <p className="docs-text">No props found for {name}.</p>;
    return (
        <div className="docs-props">
            {doc.props.length ? <Table columns={columns} rows={doc.props} rowKey="name" caption={`${name} props`} hideCaption density="comfortable" /> : null}
            {doc.element ? (
                <p className="docs-props__extra">
                    Also takes every attribute of {doc.element === "element" ? "an HTML element" : <code>{`<${doc.element}>`}</code>}, such as{" "}
                    <code>className</code>, <code>id</code> and event handlers.
                </p>
            ) : null}
        </div>
    );
}

export function hasProps(name: string) {
    return Boolean(allProps[name]);
}
