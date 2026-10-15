// Docs only: short clips made in the browser for the MediaPlayer page, so the docs ship no media files and load nothing
// over the network. Audio is rendered with an OfflineAudioContext into a WAV; video is a canvas animation recorded with
// MediaRecorder (it takes as long to record as it lasts, so the poster shows meanwhile); captions are WebVTT text.
import { useEffect, useState } from "react";

const width = 640;
const height = 360;
const clipSeconds = 9;

/** A WAV file from mono samples between -1 and 1. */
function wav(samples: Float32Array, rate: number): Blob {
    const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
    const text = (at: number, value: string) => [...value].forEach((char, i) => view.setUint8(at + i, char.charCodeAt(0)));
    text(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    text(8, "WAVEfmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    text(36, "data");
    view.setUint32(40, samples.length * 2, true);
    samples.forEach((sample, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true));
    return new Blob([view], { type: "audio/wav" });
}

/** A soft tune of sine notes on a pentatonic scale, `seconds` long. */
async function tune(seconds: number, beat: number, seed: number): Promise<string> {
    const rate = 16000;
    const context = new OfflineAudioContext(1, rate * seconds, rate);
    const scale = [0, 2, 4, 7, 9, 12, 14, 16];
    for (let i = 0, t = 0; t < seconds - beat; i++, t += beat) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = 220 * 2 ** (scale[(i * seed + (i >> 2)) % scale.length]! / 12);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.8);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(t);
        oscillator.stop(t + beat * 2);
    }
    const buffer = await context.startRendering();
    return URL.createObjectURL(wav(buffer.getChannelData(0), rate));
}

/** One frame of the video: a night sky with drifting bands of light, and the time in the corner. */
function draw(context: CanvasRenderingContext2D, time: number) {
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#0b1226");
    sky.addColorStop(1, "#1e2a4a");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    for (let band = 0; band < 3; band++) {
        context.beginPath();
        for (let x = 0; x <= width; x += 16) {
            const y = 120 + band * 40 + Math.sin(x / 90 + time * (0.8 + band * 0.3) + band) * 30;
            if (x === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.strokeStyle = ["#5eead4", "#a3e635", "#c9a46b"][band]!;
        context.globalAlpha = 0.55;
        context.lineWidth = 18;
        context.stroke();
    }
    context.globalAlpha = 1;
    context.fillStyle = "#141c30";
    context.beginPath();
    context.moveTo(0, height);
    context.lineTo(0, 290);
    context.bezierCurveTo(200, 250, 420, 300, width, 270);
    context.lineTo(width, height);
    context.fill();
    context.fillStyle = "#f4e3c1";
    context.font = "600 20px system-ui, sans-serif";
    context.fillText(`0:0${Math.floor(time)}`, 24, 40);
}

let poster: string | undefined;
let clip: Promise<string> | undefined;
const made = new Map<string, Promise<string>>();

function canvas() {
    const element = document.createElement("canvas");
    element.width = width;
    element.height = height;
    return element;
}

/** The first frame, as the poster. */
function posterImage() {
    if (!poster) {
        const element = canvas();
        draw(element.getContext("2d")!, 0);
        poster = element.toDataURL("image/jpeg", 0.8);
    }
    return poster;
}

/** Records the animation as a WebM, once for the whole page. */
function recordClip(): Promise<string> {
    clip ??= new Promise((resolve) => {
        const element = canvas();
        const context = element.getContext("2d")!;
        const recorder = new MediaRecorder(element.captureStream(30), { mimeType: "video/webm" });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => chunks.push(event.data);
        recorder.onstop = () => resolve(URL.createObjectURL(new Blob(chunks, { type: "video/webm" })));
        const start = performance.now();
        const frame = () => {
            const time = (performance.now() - start) / 1000;
            draw(context, Math.min(time, clipSeconds));
            if (time < clipSeconds) requestAnimationFrame(frame);
            else recorder.stop();
        };
        recorder.start();
        frame();
    });
    return clip;
}

const vtt = (cues: string[]) =>
    URL.createObjectURL(
        new Blob([`WEBVTT\n\n${cues.map((cue, i) => `00:0${i * 3}.000 --> 00:0${i * 3 + 3}.000\n${cue}`).join("\n\n")}\n`], { type: "text/vtt" }),
    );

let captions: { english: string; french: string } | undefined;

/** The page's clips: `video` and the audio arrive once they're made (undefined until then). */
export function useDemoMedia() {
    const [media, setMedia] = useState<{ video?: string; episode?: string; note?: string }>({});
    useEffect(() => {
        let live = true;
        const add = (key: string, make: () => Promise<string>) => {
            if (!made.has(key)) made.set(key, make());
            void made.get(key)!.then((url) => live && setMedia((current) => ({ ...current, [key]: url })));
        };
        add("episode", () => tune(48, 0.3, 3));
        add("note", () => tune(6, 0.18, 5));
        if (typeof MediaRecorder !== "undefined") add("video", recordClip);
        return () => {
            live = false;
        };
    }, []);
    captions ??= {
        english: vtt(["The lights start low over the hills.", "They drift and fold across the sky.", "And fade as the night goes on."]),
        french: vtt(["Les lumières naissent au-dessus des collines.", "Elles dérivent et se plient dans le ciel.", "Puis s’effacent avec la nuit."]),
    };
    return { ...media, poster: posterImage(), captions };
}
