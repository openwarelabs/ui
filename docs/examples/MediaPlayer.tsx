import { useRef, useState } from "react";

import { Button, Card, MediaPlayer, Stack, Text, type MediaPlayerHandle } from "@openwarelabs/ui";
import { Pause, Play } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

import { useDemoMedia } from "./MediaPlayer.media";

export const meta: DocMeta = {
    title: "MediaPlayer",
    category: "Data display",
    description:
        "Plays audio or video with controls made of the library's own buttons, sliders and menus: play, a timeline that shows what's loaded, volume, speed, captions, picture in picture and full screen.",
    source: "components/MediaPlayer/MediaPlayer.tsx",
    imports: ["MediaPlayer"],
    props: ["MediaPlayerProps", "MediaPlayerSource", "MediaPlayerTrack", "MediaPlayerHandle", "MediaPlayerLabels"],
    keyboard: [
        ["Space or K", "Plays or pauses (on a button, Space presses the button)."],
        ["Left or Right", "Goes back or forward 5 seconds, on the timeline too."],
        ["J or L", "Goes back or forward 10 seconds."],
        ["Up or Down", "Turns the volume up or down; on the volume slider, the arrows move it."],
        ["M", "Mutes or unmutes."],
        ["F", "Goes full screen, or back (video)."],
        ["C", "Turns captions on or off (video with tracks)."],
    ],
    notes: [
        "The browser's own <video> or <audio> does the playing, without its controls; the keys work while focus is anywhere in the player, and clicking the picture plays or pauses.",
        "It's a group named by title (or aria-label). The timeline is a slider read as “1:05 of 3:40”, and the buttons say what they'll do: Play or Pause, Mute or Unmute.",
        "A video's controls fade out while it plays and the pointer is still, and come back with any movement or key. They never hide while focus is in them.",
        "Captions are drawn by the browser from WebVTT tracks, and rise above the controls while those show (in Chromium and Safari). With several languages, the captions button opens a menu.",
        "Picture in picture and full screen only show where the browser supports them. With reduced motion, the controls appear and disappear without fading.",
        "A recording from MediaRecorder (a voice note, say) gets its length worked out when it loads, so its timeline works.",
        "The clips on this page are made in the browser (a tune rendered to a WAV, a canvas recorded to a WebM), so the docs carry no media files. In your app, pass your files' URLs.",
    ],
    related: ["AspectRatio", "Slider", "Carousel"],
    since: "0.16.0",
};

/** A podcast episode: artwork and details in a Card, with an audio player under them. */
export function Podcast() {
    // useDemoMedia makes short clips in the browser for this page; pass your own files' URLs.
    const { episode } = useDemoMedia();
    return (
        <Card padding="md" style={{ width: 480, maxWidth: "100%" }}>
            <Stack gap="md">
                <Stack direction="row" gap="md" align="center">
                    <div
                        aria-hidden="true"
                        style={{
                            width: 64,
                            height: 64,
                            flexShrink: 0,
                            borderRadius: "var(--ow-radius-lg)",
                            background: "linear-gradient(135deg, var(--ow-chart-1), var(--ow-chart-5))",
                        }}
                    />
                    <Stack gap="2xs">
                        <Text variant="caption" tone="muted">
                            Field Notes · Episode 12
                        </Text>
                        <Text variant="label">Listening to the night sky</Text>
                    </Stack>
                </Stack>
                <MediaPlayer kind="audio" src={episode ?? []} aria-label="Episode 12: Listening to the night sky" />
            </Stack>
        </Card>
    );
}

/** A video with a poster and captions in two languages, so the captions button opens a menu. */
export function VideoWithCaptions() {
    // useDemoMedia makes short clips in the browser for this page; pass your own files' URLs.
    const { video, poster, captions } = useDemoMedia();
    return (
        <MediaPlayer
            kind="video"
            src={video ? [{ src: video, type: "video/webm" }] : []}
            poster={poster}
            title="Northern lights over the hills"
            tracks={[
                { src: captions.english, srcLang: "en", label: "English", default: true },
                { src: captions.french, srcLang: "fr", label: "Français" },
            ]}
            style={{ width: "100%", maxWidth: 640, marginInline: "auto" }}
        />
    );
}
VideoWithCaptions.layout = { fill: true };

/** controls="minimal" keeps play, the timeline and the time: here, a voice note and a small clip. */
export function MinimalControls() {
    // useDemoMedia makes short clips in the browser for this page; pass your own files' URLs.
    const { note, video, poster } = useDemoMedia();
    return (
        <Stack gap="lg" style={{ width: 320, maxWidth: "100%" }}>
            <MediaPlayer kind="audio" controls="minimal" src={note ?? []} title="Voice note from Seán" />
            <MediaPlayer kind="video" controls="minimal" src={video ?? []} poster={poster} aria-label="Clip" />
        </Stack>
    );
}

const chapters = [
    { title: "The first light", time: 0 },
    { title: "Bands across the sky", time: 3 },
    { title: "Fading out", time: 6 },
];

/** Driven from outside through its ref: chapters seek and play, and the page follows the time and the playing state. */
export function ControlledByRef() {
    // useDemoMedia makes short clips in the browser for this page; pass your own files' URLs.
    const { video, poster } = useDemoMedia();
    const player = useRef<MediaPlayerHandle>(null);
    const [time, setTime] = useState(0);
    const [playing, setPlaying] = useState(false);
    const current = [...chapters].reverse().find((chapter) => time >= chapter.time);
    return (
        <Stack gap="md" style={{ width: 480, maxWidth: "100%" }}>
            <MediaPlayer
                ref={player}
                kind="video"
                src={video ?? []}
                poster={poster}
                title="Northern lights, in chapters"
                onTimeUpdate={setTime}
                onPlayingChange={setPlaying}
            />
            <Stack direction="row" gap="sm" wrap>
                <Button
                    variant="primary"
                    size="sm"
                    startIcon={playing ? <Pause size={16} /> : <Play size={16} />}
                    onClick={() => (playing ? player.current?.pause() : player.current?.play().catch(() => undefined))}
                >
                    {playing ? "Pause" : "Play"}
                </Button>
                {chapters.map((chapter) => (
                    <Button
                        key={chapter.time}
                        aria-current={chapter === current || undefined}
                        variant={chapter === current ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => {
                            player.current?.seek(chapter.time);
                            player.current?.play().catch(() => undefined);
                        }}
                    >
                        {chapter.title}
                    </Button>
                ))}
            </Stack>
        </Stack>
    );
}
ControlledByRef.layout = { align: "start" as const };
