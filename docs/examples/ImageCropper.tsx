import { useRef, useState } from "react";

import {
    Avatar,
    Button,
    Field,
    FileDropZone,
    Form,
    ImageCropper,
    Input,
    Stack,
    Text,
    toast,
    type ImageCrop,
    type ImageCropperHandle,
} from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "ImageCropper",
    category: "Pickers",
    description:
        "Crops a picture by moving and zooming it under a fixed frame, for a profile picture or a banner. The cropped image comes out through a ref, or with a Form.",
    source: "components/ImageCropper/ImageCropper.tsx",
    imports: ["ImageCropper"],
    props: ["ImageCropperProps", "ImageCrop", "ImageCropperOutput", "ImageCropperLabels", "ImageCropperHandle"],
    keyboard: [
        ["Tab", "Moves to the frame, then to the zoom slider."],
        ["Arrow keys", "Move the picture under the frame by a pixel; with Shift, by ten."],
        ["+ or -", "Zoom in or out from the frame, by a tenth."],
        ["Arrows, Home, End on the slider", "Change the zoom, as any Slider."],
    ],
    notes: [
        "The frame is a focusable group named \"Crop the picture\" and described by how to use it with the keys. The zoom slider is labelled \"Zoom\" and reads its value as a percentage; a zoom by the keys, the wheel or a pinch is also read out.",
        "Drag the picture to move it; the crop stays within the picture. The wheel and a pinch zoom around the pointer, the slider and the keys around the centre.",
        "The crop is in the picture's own pixels, so it's the same whatever size the frame is drawn at. Zoom 1 is the picture just covering the frame; with aspect the frame keeps its shape as it shrinks on a narrow screen.",
        "shape=\"circle\" only shades the corners of the preview: the output is still a rectangle, to round where it's shown, as Avatar does. A JPEG output has its empty space (below a zoom of 1) filled white.",
        "Nothing is rendered on each move. getCroppedImage() draws the crop into a canvas when you ask, and with a name, as the form is sent. A picture from another origin needs crossOrigin and a server that allows it, or the canvas can't be read.",
        "Only the frame takes touch-action: none, so the page still scrolls around it.",
    ],
    related: ["FileDropZone", "Avatar", "Image"],
    since: "0.18.0",
};

/** A sample photo drawn as an SVG, so the examples load nothing over the network. */
function photo(sky: [string, string], sun: string, hills: [string, string]) {
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="1200" height="800" fill="url(#sky)"/><circle cx="820" cy="380" r="90" fill="${sun}"/><path d="M0 520 C 240 420 420 450 620 520 S 1000 450 1200 500 V800 H0Z" fill="${hills[0]}"/><path d="M0 640 C 300 560 560 600 800 660 S 1100 620 1200 630 V800 H0Z" fill="${hills[1]}"/><circle cx="330" cy="470" r="70" fill="${sun}" opacity="0.9"/><path d="M250 640 Q 330 540 410 640 Z" fill="${hills[1]}"/></svg>`,
    )}`;
}

const dusk = photo(["#1e2a4a", "#c9a46b"], "#f4e3c1", ["#2b3a5c", "#141c30"]);
const noon = photo(["#8fb8de", "#e6eff7"], "#fff4cf", ["#7aa77f", "#46704f"]);

/** A profile picture: drop a photo (or keep the sample), move and zoom it in the round frame, then Save puts the crop in an Avatar. */
export function ProfilePicture() {
    const cropper = useRef<ImageCropperHandle>(null);
    const [source, setSource] = useState<string | File>(dusk);
    const [saved, setSaved] = useState<string>();

    async function save() {
        const blob = await cropper.current?.getCroppedImage({ width: 256, height: 256 });
        if (!blob) return;
        if (saved) URL.revokeObjectURL(saved);
        setSaved(URL.createObjectURL(blob));
    }

    return (
        <Stack gap="lg" style={{ width: 320, maxWidth: "100%" }}>
            <FileDropZone accept="image/*" hint="PNG or JPG, up to 5 MB." maxSize={5 * 1024 * 1024} onFiles={([file]) => file && setSource(file)} />
            <ImageCropper ref={cropper} src={source} aspect={1} shape="circle" width={320} />
            <Stack direction="row" gap="md" align="center" justify="between">
                <Stack direction="row" gap="sm" align="center">
                    <Avatar name="Aoife Byrne" src={saved} size="xl" />
                    <Text variant="caption" tone="muted">
                        {saved ? "Saved at 256 by 256." : "Not saved yet."}
                    </Text>
                </Stack>
                <Button variant="primary" onClick={save}>
                    Save
                </Button>
            </Stack>
        </Stack>
    );
}
ProfilePicture.layout = { align: "start" as const };

/** A 16:9 banner with the thirds grid. The crop is controlled here and shown beneath, in the picture's pixels. */
export function Banner() {
    const [crop, setCrop] = useState<ImageCrop>();
    return (
        <Stack gap="md" style={{ width: 420, maxWidth: "100%" }}>
            <ImageCropper src={noon} aspect={16 / 9} showGrid width={420} maxZoom={3} crop={crop} onCropChange={setCrop} />
            <Text variant="caption" tone="muted">
                {crop
                    ? `Crop: ${Math.round(crop.width)} × ${Math.round(crop.height)} at (${Math.round(crop.x)}, ${Math.round(crop.y)}) of 1200 × 800.`
                    : "Drag the picture or zoom to change the crop."}
            </Text>
        </Stack>
    );
}
Banner.layout = { align: "start" as const };

/** In a Form: the cropped image is made as the form is sent, and sent under its name as a JPEG data URL. */
export function InAForm() {
    return (
        <Form
            style={{ width: 320, maxWidth: "100%" }}
            onSubmit={(values) =>
                toast.success("Profile saved", {
                    description: `${values.displayName}'s picture is ${Math.round(String(values.picture).length / 1024)} KB.`,
                })
            }
        >
            <Field label="Display name">
                <Input name="displayName" defaultValue="Cian Murphy" autoComplete="nickname" required />
            </Field>
            <Field label="Profile picture" hint="Move and zoom the photo to fit the circle.">
                <ImageCropper
                    name="picture"
                    src={dusk}
                    aspect={1}
                    shape="circle"
                    width={320}
                    defaultZoom={1.4}
                    output={{ width: 512, height: 512, type: "image/jpeg", quality: 0.85 }}
                />
            </Field>
            <Button type="submit" variant="primary">
                Save profile
            </Button>
        </Form>
    );
}
InAForm.layout = { align: "start" as const };
