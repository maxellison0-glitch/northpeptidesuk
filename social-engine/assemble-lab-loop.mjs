import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const [sourceArg, configArg, outputArg] = process.argv.slice(2);

if (!sourceArg || !configArg || !outputArg) {
  throw new Error('Usage: node assemble-lab-loop.mjs <source.mp4> <overlays.json> <output.mp4>');
}

const source = path.resolve(sourceArg);
const configPath = path.resolve(configArg);
const output = path.resolve(outputArg);
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function assTime(seconds) {
  const centiseconds = Math.max(0, Math.round(Number(seconds) * 100));
  const hours = Math.floor(centiseconds / 360000);
  const minutes = Math.floor((centiseconds % 360000) / 6000);
  const secs = Math.floor((centiseconds % 6000) / 100);
  const cs = centiseconds % 100;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function assText(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('{', '\\{')
    .replaceAll('}', '\\}')
    .replaceAll('\n', '\\N');
}

const duration = Number(config.duration ?? 8);
const lines = [
  '[Script Info]',
  'ScriptType: v4.00+',
  'PlayResX: 1080',
  'PlayResY: 1920',
  'ScaledBorderAndShadow: yes',
  '',
  '[V4+ Styles]',
  'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
  'Style: Main,Arial,78,&H00F4F4F0,&H000000FF,&H00071226,&H00071226,-1,0,0,0,100,100,-2,0,1,4,0,5,90,90,0,1',
  'Style: Eyebrow,Arial,24,&H00F8BD38,&H000000FF,&H00071226,&H00071226,-1,0,0,0,100,100,3,0,1,2,0,8,80,80,144,1',
  'Style: Footer,Arial,18,&H00C3CAD5,&H000000FF,&H00071226,&H00071226,0,0,0,0,100,100,1,0,1,2,0,2,70,70,118,1',
  '',
  '[Events]',
  'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text',
  `Dialogue: 0,${assTime(0)},${assTime(duration)},Eyebrow,,0,0,0,,${assText(config.eyebrow ?? 'LAB VARIABLES / 01')}`,
  `Dialogue: 0,${assTime(0)},${assTime(duration)},Footer,,0,0,0,,${assText(config.footer ?? 'FOR LABORATORY RESEARCH USE ONLY · NOT FOR HUMAN CONSUMPTION')}`,
];

for (const segment of config.segments ?? []) {
  lines.push(
    `Dialogue: 0,${assTime(segment.start)},${assTime(segment.end)},Main,,0,0,0,,{\\fad(120,120)}${assText(segment.text)}`,
  );
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'north-peptides-ass-'));
const assPath = path.join(tempDir, 'overlays.ass');
fs.writeFileSync(assPath, lines.join('\n'), 'utf8');

const ffmpegAssPath = assPath
  .replaceAll('\\', '/')
  .replace(':', '\\:')
  .replaceAll("'", "\\'");

const panel = config.panel ?? { x: 70, y: 410, width: 940, height: 1010, opacity: 0.9 };
const videoFilter = [
  `[0:v]scale=1080:1920:flags=lanczos,eq=contrast=1.04:saturation=0.86:brightness=-0.015,split=2[base][label]`,
  `[label]crop=w=${panel.width}:h=${panel.height}:x=${panel.x}:y=${panel.y},gblur=sigma=40:steps=4[blurred]`,
  `[base][blurred]overlay=x=${panel.x}:y=${panel.y},drawbox=x=${panel.x}:y=${panel.y}:w=${panel.width}:h=${panel.height}:color=0x071226@${panel.opacity}:t=fill,ass=filename='${ffmpegAssPath}',fps=30,format=yuv420p[v]`,
].join(';');

fs.mkdirSync(path.dirname(output), { recursive: true });
const result = spawnSync('ffmpeg', [
  '-y',
  '-i', source,
  '-t', String(duration),
  '-filter_complex', videoFilter,
  '-map', '[v]',
  '-map', '0:a:0?',
  '-af', `loudnorm=I=-18:TP=-2:LRA=7,afade=t=in:st=0:d=0.15,afade=t=out:st=${Math.max(0, duration - 0.4)}:d=0.4`,
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '18',
  '-c:a', 'aac',
  '-b:a', '160k',
  '-movflags', '+faststart',
  output,
], { stdio: 'inherit' });

fs.rmSync(tempDir, { recursive: true, force: true });
if (result.status !== 0) throw new Error(`ffmpeg failed with status ${result.status}`);
console.log(output);
