import { useRef } from "react";

import {
    Button,
    Card,
    QRCode,
    Snippet,
    Stack,
    Text,
    qrCodeToDataURL,
    qrCodeToSVG,
} from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "QRCode",
    category: "Data display",
    description:
        "A QR code drawn as one SVG path, for sharing a link, setting up two-factor authentication or pairing a device. The encoder is built in: no dependencies.",
    source: "components/QRCode/QRCode.tsx",
    imports: ["QRCode", "encodeQR", "qrCodeToDataURL", "qrCodeToSVG"],
    props: ["QRCodeProps", "QROptions", "QRCodeDataURLOptions"],
    notes: [
        'It\'s one image with an accessible name: give it a label that says where it leads ("QR code for openware.dev"). Left out, it\'s made from the link\'s host or short text.',
        "It stays near black on near white in the dark theme too. Scanners need a light ground and strong contrast, and most can't read a light code on a dark one. If you change the colours, keep the modules dark.",
        "Keep the quiet zone (margin) at 4 modules unless the code sits on a plain light ground, and print it at least 2 cm wide.",
        "Always show what it encodes another way too, such as the link or the 2FA key as text: not everyone can scan.",
        "A logo clears the modules under it and raises the level to H, which can lose 30% and still scan.",
        "encodeQR(text, { level, minVersion }) returns the modules as rows of booleans, if you'd rather draw them yourself.",
    ],
    related: ["Image", "Snippet", "CopyButton"],
    since: "0.15.0",
};

/** A link to share. The label says where it leads. */
export function Basic() {
    return (
        <Stack gap="sm" align="center">
            <QRCode value="https://openware.dev" label="QR code for openware.dev" />
            <Text variant="caption" tone="muted">
                openware.dev
            </Text>
        </Stack>
    );
}

/** Setting up two-factor authentication: the otpauth:// link as a code, and the key as text for people who can't scan it. */
export function TwoFactorSetup() {
    const secret = "JBSWY3DPEHPK3PXP";
    return (
        <Card style={{ width: 340, maxWidth: "100%" }}>
            <Stack gap="md">
                <Stack gap="xs">
                    <Text variant="label">Set up your authenticator app</Text>
                    <Text variant="caption" tone="muted">
                        Scan this code with an app like 1Password or Google Authenticator.
                    </Text>
                </Stack>
                <QRCode
                    value={`otpauth://totp/Openware:ada@openware.dev?secret=${secret}&issuer=Openware`}
                    label="QR code to add Openware to your authenticator app"
                    size={176}
                    style={{ marginInline: "auto" }}
                />
                <Stack gap="xs">
                    <Text variant="caption" tone="muted">
                        Can't scan it? Enter this key instead:
                    </Text>
                    <Snippet value={secret} prompt={null} />
                </Stack>
            </Stack>
        </Card>
    );
}

/** size is in pixels. Higher levels survive more damage, but make a denser code. */
export function SizesAndLevels() {
    return (
        <Stack gap="lg" align="center">
            <Stack direction="row" gap="lg" align="end" wrap>
                {[96, 128, 160].map((size) => (
                    <QRCode
                        key={size}
                        value="https://openware.dev"
                        size={size}
                        label={`QR code for openware.dev, ${size} pixels`}
                    />
                ))}
            </Stack>
            <Stack direction="row" gap="lg" wrap>
                {(["L", "M", "Q", "H"] as const).map((level) => (
                    <Stack key={level} gap="xs" align="center">
                        <QRCode
                            value="https://openware.dev/docs/components"
                            level={level}
                            size={112}
                            margin={2}
                            label={`Level ${level}`}
                        />
                        <Text variant="caption" tone="muted">
                            Level {level}
                        </Text>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );
}

const logo = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#312c7e"/><circle cx="20" cy="20" r="9" fill="none" stroke="#d4a72c" stroke-width="5"/></svg>',
)}`;

/** A logo in the middle. The modules under it are cleared and the level is raised to H, so it still scans. rounded softens the modules. */
export function WithLogo() {
    return (
        <Stack direction="row" gap="lg" wrap justify="center">
            <QRCode
                value="https://openware.dev/join"
                image={logo}
                size={176}
                label="QR code for openware.dev/join"
            />
            <QRCode
                value="https://openware.dev/join"
                image={logo}
                size={176}
                rounded
                label="QR code for openware.dev/join, rounded"
            />
        </Stack>
    );
}

/** Pass a ref, then qrCodeToDataURL makes a PNG and qrCodeToSVG the SVG markup, with the colours written in. */
export function Download() {
    const ref = useRef<SVGSVGElement>(null);
    const save = (href: string, name: string) => {
        const link = document.createElement("a");
        link.href = href;
        link.download = name;
        link.click();
    };
    return (
        <Stack gap="md" align="center">
            <QRCode
                ref={ref}
                value="https://openware.dev/invite/7f3k2"
                label="QR code for your invite link"
            />
            <Stack direction="row" gap="sm">
                <Button
                    size="sm"
                    onClick={async () => save(await qrCodeToDataURL(ref.current!), "invite.png")}
                >
                    Download PNG
                </Button>
                <Button
                    size="sm"
                    onClick={() => {
                        const svg = new Blob([qrCodeToSVG(ref.current!)], { type: "image/svg+xml" });
                        save(URL.createObjectURL(svg), "invite.svg");
                    }}
                >
                    Download SVG
                </Button>
            </Stack>
        </Stack>
    );
}
