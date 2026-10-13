import { useState, type Key } from "react";

import { Avatar, Badge, Button, Card, Menu, MenuItem, MenuLabel, Table, Tooltip, toast, type TableColumn } from "@openwarelabs/ui";
import { BellRing, ChevronDown, Mail, Trash2, UserPlus, X } from "lucide-react";

import "./TableBulkActions.css";

type Role = "Owner" | "Admin" | "Member" | "Guest";
type TwoFactor = "On" | "Off" | "Reminded";

interface Person {
    id: string;
    name: string | null;
    email: string;
    role: Role;
    twoFactor: TwoFactor | null;
    minutesAgo: number;
    lastActive: string;
}

const people: Person[] = [
    { id: "maya", name: "Maya Chen", email: "maya@example.com", role: "Owner", twoFactor: "On", minutesAgo: 0, lastActive: "Now" },
    { id: "tomas", name: "Tomás Reyes", email: "tomas@example.com", role: "Admin", twoFactor: "On", minutesAgo: 12, lastActive: "12 min ago" },
    { id: "priya", name: "Priya Nair", email: "priya@example.com", role: "Admin", twoFactor: "On", minutesAgo: 64, lastActive: "1 h ago" },
    { id: "jonas", name: "Jonas Berg", email: "jonas@example.com", role: "Member", twoFactor: "Off", minutesAgo: 190, lastActive: "3 h ago" },
    { id: "aiko", name: "Aiko Tanaka", email: "aiko@example.com", role: "Member", twoFactor: "On", minutesAgo: 1300, lastActive: "Yesterday" },
    { id: "sam", name: "Sam Okafor", email: "sam@example.com", role: "Member", twoFactor: "Off", minutesAgo: 2900, lastActive: "2 days ago" },
    { id: "lena", name: "Lena Fischer", email: "lena@example.com", role: "Member", twoFactor: "On", minutesAgo: 7300, lastActive: "5 days ago" },
    { id: "omar", name: "Omar Haddad", email: "omar@example.com", role: "Guest", twoFactor: "Off", minutesAgo: 30200, lastActive: "3 weeks ago" },
    { id: "ines", name: null, email: "ines@example.com", role: "Member", twoFactor: null, minutesAgo: 99998, lastActive: "Invited 2 days ago" },
    { id: "kofi", name: null, email: "kofi@example.com", role: "Guest", twoFactor: null, minutesAgo: 99999, lastActive: "Invited 5 days ago" },
];

const roleOrder: Record<Role, number> = { Owner: 0, Admin: 1, Member: 2, Guest: 3 };

const columns: Array<TableColumn<Person>> = [
    {
        key: "name",
        header: "Person",
        sortable: true,
        sortValue: (person) => person.name ?? person.email,
        render: (person) => (
            <span className="table-bulk-actions__person">
                {person.name ? (
                    <Avatar name={person.name} />
                ) : (
                    <span className="table-bulk-actions__invite-mark" aria-hidden="true">
                        <Mail size={14} />
                    </span>
                )}
                <span className="table-bulk-actions__person-text">
                    <span className="table-bulk-actions__name">{person.name ?? person.email}</span>
                    <span className="table-bulk-actions__email">{person.name ? person.email : "Hasn't accepted yet"}</span>
                </span>
            </span>
        ),
    },
    {
        key: "role",
        header: "Role",
        sortable: true,
        sortValue: (person) => roleOrder[person.role],
        render: (person) => <span className="table-bulk-actions__role">{person.role}</span>,
    },
    {
        key: "twoFactor",
        header: "Two-factor",
        render: (person) =>
            person.twoFactor === null ? (
                <span className="table-bulk-actions__muted">Not yet</span>
            ) : (
                <Badge size="sm" variant={person.twoFactor === "On" ? "success" : person.twoFactor === "Reminded" ? "active" : "warning"}>
                    {person.twoFactor === "Reminded" ? "Off, reminded" : person.twoFactor}
                </Badge>
            ),
    },
    {
        key: "lastActive",
        header: "Last active",
        align: "end",
        sortable: true,
        sortValue: (person) => person.minutesAgo,
        render: (person) => <span className="table-bulk-actions__muted">{person.lastActive}</span>,
    },
];

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

export function TableBulkActions() {
    const [rows, setRows] = useState(people);
    // Two people are selected to start with, so the bar shows; clear them to see the table on its own.
    const [selected, setSelected] = useState<Key[]>(["jonas", "sam"]);

    const chosen = rows.filter((person) => selected.includes(person.id));
    // The owner's role and membership can't be changed from here.
    const changeable = chosen.filter((person) => person.role !== "Owner");
    const ownerNote = chosen.length > changeable.length ? "Maya Chen is the owner, so she stays as she is." : undefined;
    const withoutTwoFactor = chosen.filter((person) => person.twoFactor === "Off");

    const setRole = (role: Role) => {
        const ids = changeable.map((person) => person.id);
        setRows((current) => current.map((person) => (ids.includes(person.id) ? { ...person, role } : person)));
        toast.success(
            `${plural(ids.length, "person", "people")} ${ids.length === 1 ? "is" : "are"} now ${role === "Admin" ? "an admin" : `a ${role.toLowerCase()}`}`,
            { description: ownerNote },
        );
    };

    const remind = () => {
        const ids = withoutTwoFactor.map((person) => person.id);
        setRows((current) => current.map((person) => (ids.includes(person.id) ? { ...person, twoFactor: "Reminded" } : person)));
        toast.success(`Sent ${plural(ids.length, "reminder")} to turn on two-factor`);
    };

    const remove = () => {
        const before = rows;
        const ids = changeable.map((person) => person.id);
        setRows((current) => current.filter((person) => !ids.includes(person.id)));
        setSelected([]);
        toast(`Removed ${plural(ids.length, "person", "people")} from Acme`, {
            description: ownerNote ?? "They lose access straight away. Their work stays.",
            action: { label: "Undo", onClick: () => setRows(before) },
        });
    };

    const invited = rows.filter((person) => person.name === null).length;

    return (
        <section className="table-bulk-actions" aria-labelledby="table-bulk-actions-title">
            <div className="table-bulk-actions__inner">
                <div className="table-bulk-actions__header">
                    <div>
                        <h2 id="table-bulk-actions-title" className="table-bulk-actions__title">
                            Members
                        </h2>
                        <p className="table-bulk-actions__lead">Everyone in the Acme workspace, and what they can do in it.</p>
                    </div>
                    <Button
                        variant="primary"
                        startIcon={<UserPlus size={16} />}
                        onClick={() => toast("Invite people by email", { description: "They join as members unless you choose otherwise." })}
                    >
                        Invite people
                    </Button>
                </div>

                <Card padding="none" className="table-bulk-actions__card">
                    {chosen.length ? (
                        <div className="table-bulk-actions__bar" role="region" aria-label="Selected people">
                            <span className="table-bulk-actions__selected" aria-live="polite">
                                {chosen.length} selected
                            </span>
                            <div className="table-bulk-actions__actions">
                                <Menu
                                    label="Change role"
                                    trigger={
                                        <Button size="sm" endIcon={<ChevronDown size={14} />} disabled={!changeable.length}>
                                            Change role
                                        </Button>
                                    }
                                >
                                    <MenuLabel>Make {changeable.length === 1 ? "them" : "them all"}</MenuLabel>
                                    {(["Admin", "Member", "Guest"] as const).map((role) => (
                                        <MenuItem key={role} icon={<span className="table-bulk-actions__menu-spacer" />} onSelect={() => setRole(role)}>
                                            {role}
                                        </MenuItem>
                                    ))}
                                </Menu>
                                <Button size="sm" startIcon={<BellRing size={14} />} disabled={!withoutTwoFactor.length} onClick={remind}>
                                    Remind about two-factor
                                </Button>
                                <Button size="sm" variant="danger" startIcon={<Trash2 size={14} />} disabled={!changeable.length} onClick={remove}>
                                    Remove
                                </Button>
                            </div>
                            <span className="table-bulk-actions__clear">
                                <Tooltip label="Clear selection">
                                    <Button size="sm" variant="ghost" iconOnly aria-label="Clear selection" onClick={() => setSelected([])}>
                                        <X size={16} />
                                    </Button>
                                </Tooltip>
                            </span>
                        </div>
                    ) : (
                        <div className="table-bulk-actions__top">
                            <span>
                                <strong>{plural(rows.length - invited, "person", "people")}</strong>
                                {invited ? ` and ${plural(invited, "invitation")} waiting` : ""}
                            </span>
                            <span className="table-bulk-actions__hint">Select people to change their role or remove them together.</span>
                        </div>
                    )}

                    <Table
                        caption="Members"
                        hideCaption
                        columns={columns}
                        rows={rows}
                        selectionMode="multiple"
                        selectedKeys={selected}
                        onSelectionChange={setSelected}
                        defaultSort={{ key: "role", direction: "ascending" }}
                    />
                </Card>
            </div>
        </section>
    );
}
