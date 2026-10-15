import type { CSSProperties } from "react";

/** One file of the same media, for browsers to pick the first they can play. */
export interface MediaPlayerSource {
    /** The file's URL. */
    src: string;
    /** Its MIME type, such as "video/webm" or "audio/mpeg". It also tells the player whether it's audio or video. */
    type?: string;
}

/** A captions or subtitles file (WebVTT) for a video. */
export interface MediaPlayerTrack {
    /** The .vtt file's URL. */
    src: string;
    /** Its language, such as "en". */
    srcLang: string;
    /** Its name in the captions menu, such as "English". */
    label: string;
    /** Shows these captions from the start.
     * @default false */
    default?: boolean;
}

/** What a ref to a MediaPlayer can do. */
export interface MediaPlayerHandle {
    /** Starts playing. Resolves once it does; rejects if the browser blocks it (autoplay rules). */
    play(): Promise<void>;
    pause(): void;
    /** Goes to this many seconds in. */
    seek(time: number): void;
    /** The `<video>` or `<audio>` element, for anything else. */
    readonly media: HTMLMediaElement | null;
}

export interface MediaPlayerLabels {
    /** Names the player when there's no `title`. @default "Video player" or "Audio player" */
    player?: string;
    /** @default "Play" */
    play?: string;
    /** @default "Pause" */
    pause?: string;
    /** Names the timeline. @default "Seek" */
    seek?: string;
    /** @default "Volume" */
    volume?: string;
    /** @default "Mute" */
    mute?: string;
    /** @default "Unmute" */
    unmute?: string;
    /** Names the speed menu; its button shows the speed, like "1×". @default "Playback speed" */
    speed?: string;
    /** @default "Captions" */
    captions?: string;
    /** The captions menu's item that turns them off, when there's more than one language. @default "Off" */
    captionsOff?: string;
    /** @default "Full screen" */
    fullscreen?: string;
    /** @default "Exit full screen" */
    exitFullscreen?: string;
    /** @default "Picture in picture" */
    pictureInPicture?: string;
    /** Reads out where it is on the timeline. @default (time, duration) => `${time} of ${duration}`, as "1:05 of 3:40" */
    position?(time: string, duration: string): string;
}

export interface MediaPlayerProps {
    /** The file's URL, or several formats of it (`{ src, type }`), best first. */
    src: string | MediaPlayerSource[];
    /** Audio is a bar of controls; video is a picture with the controls over it. Left out, it's taken from the
     * source's type or file extension, and is video when it can't tell. */
    kind?: "audio" | "video";
    /** A picture shown before a video plays. */
    poster?: string;
    /** What's playing. It names the player for screen readers, and an audio player shows it above the controls. */
    title?: string;
    /** Captions or subtitles for a video. With one, the captions button turns them on and off; with more, it opens a
     * menu of languages. */
    tracks?: MediaPlayerTrack[];
    /** Starts playing as soon as it can. Browsers only allow this when it's `muted`, or after the person has
     * interacted with the page.
     * @default false */
    autoPlay?: boolean;
    /** Starts again from the beginning when it ends.
     * @default false */
    loop?: boolean;
    /** Starts muted.
     * @default false */
    muted?: boolean;
    /** The speeds in the speed menu; an empty list hides it.
     * @default [0.5, 0.75, 1, 1.25, 1.5, 2] */
    playbackRates?: number[];
    /** A video's shape, width over height.
     * @default 16 / 9 */
    ratio?: number;
    /** `minimal` keeps only play, the timeline and the time, for a small player or a short clip.
     * @default "full" */
    controls?: "full" | "minimal";
    /** How much to load before it plays: `metadata` is enough to show the length.
     * @default "metadata" */
    preload?: "none" | "metadata" | "auto";
    /** Called as it plays and when it's moved, with the time and the length in seconds. */
    onTimeUpdate?(time: number, duration: number): void;
    /** Called when it starts or stops playing. */
    onPlayingChange?(playing: boolean): void;
    /** Called when it reaches the end (not when it loops). */
    onEnded?(): void;
    /** The words it uses, for other languages. */
    labels?: MediaPlayerLabels;
    /** Names the player for screen readers, in place of `title`. */
    "aria-label"?: string;
    id?: string;
    className?: string;
    style?: CSSProperties;
}
