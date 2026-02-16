import { Gtk } from "ags/gtk4"
// @ts-ignore
import GLib from "gi://GLib?version=2.0"
// @ts-ignore
import Gio from "gi://Gio?version=2.0"

const MAX_WIDTH = 30
const FFT_SIZE = 2048  // más resolución para notas individuales
const SAMPLE_RATE = 44100

// === NOTAS DE PIANO ===
const PIANO_NOTES: [string, number][] = [    
    // Octava 2 (graves)
    ["C2",   65.41],  ["C#2",  69.30],  ["D2",   73.42],  ["D#2",  77.78],
    ["E2",   82.41],  ["F2",   87.31],  ["F#2",  92.50],  ["G2",   98.00],
    ["G#2",  103.83], ["A2",   110.00], ["A#2",  116.54], ["B2",   123.47],
    
    // Octava 3 (medios-graves)
    ["C3",   130.81], ["C#3",  138.59], ["D3",   146.83], ["D#3",  155.56],
    ["E3",   164.81], ["F3",   174.61], ["F#3",  185.00], ["G3",   196.00],
    ["G#3",  207.65], ["A3",   220.00], ["A#3",  233.08], ["B3",   246.94],
    
    // Octava 4 (medios - Do central)
    ["C4",   261.63], ["C#4",  277.18], ["D4",   293.66], ["D#4",  311.13],
    ["E4",   329.63], ["F4",   349.23], ["F#4",  369.99], ["G4",   392.00],
    ["G#4",  415.30], ["A4",   440.00], ["A#4",  466.16], ["B4",   493.88],
    
    // Octava 5 (agudos)
    ["C5",   523.25], ["C#5",  554.37], ["D5",   587.33], ["D#5",  622.25],
    ["E5",   659.25], ["F5",   698.46], ["F#5",  739.99], ["G5",   783.99],
    ["G#5",  830.61], ["A5",   880.00], ["A#5",  932.33], ["B5",   987.77],
    
    // Octava 6 (muy agudos)
    ["C6",   1046.50], ["C#6",  1108.73], ["D6",   1174.66], ["D#6",  1244.51],
    ["E6",   1318.51], ["F6",   1396.91], ["F#6",  1479.98], ["G6",   1567.98],
    ["G#6",  1661.22], ["A6",   1760.00], ["A#6",  1864.66], ["B6",   1975.53],
]

const SEGMENT_COUNT = PIANO_NOTES.length

// === CONFIGURACIÓN ===
const SENSITIVITY = 1.5  // Sensibilidad base

// Multiplicador por octava (ajusta el balance entre graves/medios/agudos)
const OCTAVE_MULTIPLIER: { [key: number]: number } = {
    2: 0.9,   // C2-B2: graves
    3: 0.9,   // C3-B3: medios-graves
    4: 1,   // C4-B4: medios (referencia)
    5: 1,   // C5-B5: agudos
    6: 1,   // C6-B6: muy agudos
}

// Suavizado de movimiento (0 = sin suavizado, 1 = muy suave)
const ATTACK_SMOOTH = 0.7   // Qué tan rápido sube (0-1, más alto = más rápido)
const DECAY_SMOOTH = 0.2    // Qué tan rápido baja (0-1, más alto = más rápido)
// ====================

// FFT simple
function fft(input: number[]): { real: number, imag: number }[] {
    const n = input.length
    if (n & (n - 1)) return input.map(v => ({ real: v, imag: 0 }))
    if (n <= 1) return input.map(v => ({ real: v, imag: 0 }))

    const even = fft(input.filter((_, i) => i % 2 === 0))
    const odd = fft(input.filter((_, i) => i % 2 !== 0))
    const result = new Array(n).fill(0).map(() => ({ real: 0, imag: 0 }))
    const halfN = n / 2
    
    for (let k = 0; k < halfN; k++) {
        if (k >= even.length || k >= odd.length) continue
        const angle = -2 * Math.PI * k / n
        const tReal = Math.cos(angle) * odd[k].real - Math.sin(angle) * odd[k].imag
        const tImag = Math.cos(angle) * odd[k].imag + Math.sin(angle) * odd[k].real
        result[k] = { real: even[k].real + tReal, imag: even[k].imag + tImag }
        result[k + halfN] = { real: even[k].real - tReal, imag: even[k].imag - tImag }
    }
    return result
}

function frequencyToBin(freq: number): number {
    return Math.floor((freq * FFT_SIZE) / SAMPLE_RATE)
}

export function MediaVisualizer() {
    const container = (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            cssClasses={["media-visualizer"]}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.END}
            vexpand
        />
    ) as Gtk.Box

    const lineBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 2,
        halign: Gtk.Align.START,
        valign: Gtk.Align.END
    })
    lineBox.add_css_class("vis-noise-line")

    const segments: Gtk.Box[] = []
    const lastWidth: number[] = new Array(SEGMENT_COUNT).fill(2)  // para suavizado

    for (let i = 0; i < SEGMENT_COUNT; i++) {
        const seg = new Gtk.Box()
        seg.add_css_class("vis-noise-seg")
        seg.set_size_request(2, 1)
        seg.set_halign(Gtk.Align.START)
        lineBox.append(seg)
        segments.push(seg)
    }

    container.append(lineBox)

    let subprocess: Gio.Subprocess | null = null
    let inputStream: Gio.DataInputStream | null = null

    const updateVisualizer = (data: number[]) => {
        if (data.length !== FFT_SIZE) return
        const spectrum = fft(data)

        for (let i = 0; i < SEGMENT_COUNT; i++) {
            const noteIndex = SEGMENT_COUNT - 1 - i  // invertir
            const [name, freq] = PIANO_NOTES[noteIndex]
            
            // Obtener octava de la nota
            const octave = parseInt(name.match(/\d+/)![0])
            const multiplier = OCTAVE_MULTIPLIER[octave] || 1.0
            
            // Bin de la nota
            const bin = frequencyToBin(freq)
            
            // Magnitud directa del bin
            if (bin < spectrum.length) {
                const s = spectrum[bin]
                const mag = Math.sqrt(s.real ** 2 + s.imag ** 2)
                
                // Aplicar sensibilidad y multiplicador de octava
                const targetWidth = Math.min(mag * SENSITIVITY * multiplier, MAX_WIDTH)
                
                // Suavizado: interpolar entre ancho actual y objetivo
                const currentWidth = lastWidth[i]
                const smoothedWidth = targetWidth > currentWidth
                    ? currentWidth + (targetWidth - currentWidth) * ATTACK_SMOOTH  // subida
                    : currentWidth + (targetWidth - currentWidth) * DECAY_SMOOTH   // bajada
                
                lastWidth[i] = smoothedWidth
                
                // Aplicar
                segments[i].set_size_request(Math.max(2, Math.floor(smoothedWidth)), 1)
            }
        }
    }

    const startVisualizer = () => {
        try {
            const [ok, stdout] = GLib.spawn_command_line_sync("pactl list short sinks")
            if (!ok) return console.error("No se pudieron listar sinks")

            const decoder = new TextDecoder('utf-8')
            const lines = decoder.decode(stdout).split("\n")
            let activeSink = lines.find(l => l.includes("RUNNING"))?.split("\t")[1] ?? ""

            if (!activeSink) {
                const [ok2, defOut] = GLib.spawn_command_line_sync("pactl get-default-sink")
                if (ok2) activeSink = decoder.decode(defOut).trim()
            }

            if (!activeSink) return console.error("No se encontró sink activo")
            const device = activeSink + ".monitor"
            
            console.log(`=== VISUALIZADOR SIMPLE DE NOTAS ===`)
            console.log(`${SEGMENT_COUNT} notas: ${PIANO_NOTES[0][0]} (${PIANO_NOTES[0][1]}Hz) a ${PIANO_NOTES[SEGMENT_COUNT-1][0]} (${PIANO_NOTES[SEGMENT_COUNT-1][1]}Hz)`)
            console.log(`Sensibilidad: ${SENSITIVITY}x | FFT: ${FFT_SIZE} bins`)
            console.log(`Suavizado - Attack: ${ATTACK_SMOOTH} | Decay: ${DECAY_SMOOTH}`)
            console.log(`Multiplicadores: Oct1=${OCTAVE_MULTIPLIER[1]}x, Oct2=${OCTAVE_MULTIPLIER[2]}x, Oct3=${OCTAVE_MULTIPLIER[3]}x, Oct4=${OCTAVE_MULTIPLIER[4]}x, Oct5=${OCTAVE_MULTIPLIER[5]}x`)

            subprocess = Gio.Subprocess.new(
                ["parec", "--format=s16le", "--rate=44100", "--channels=1", "--latency=512", "--device=" + device],
                Gio.SubprocessFlags.STDOUT_PIPE
            )

            inputStream = new Gio.DataInputStream({ 
                base_stream: subprocess.get_stdout_pipe()!, 
                close_base_stream: true 
            })

            const readChunk = () => {
                if (!inputStream) return GLib.SOURCE_REMOVE

                inputStream.read_bytes_async(FFT_SIZE * 2, GLib.PRIORITY_DEFAULT, null, (source, res) => {
                    try {
                        const bytes = source?.read_bytes_finish(res)
                        if (!bytes || bytes.get_size() === 0) return

                        const uint8Data = bytes.get_data()
                        if (!uint8Data || uint8Data.length === 0) return

                        const buffer = uint8Data.buffer.slice(
                            uint8Data.byteOffset, 
                            uint8Data.byteOffset + uint8Data.byteLength
                        )
                        const int16Buffer = new Int16Array(buffer)
                        
                        const samples = new Array(FFT_SIZE).fill(0)
                        for (let i = 0; i < Math.min(int16Buffer.length, FFT_SIZE); i++) {
                            samples[i] = int16Buffer[i] / 32768.0
                        }

                        updateVisualizer(samples)
                        readChunk()
                    } catch (e) {
                        console.error("Error:", e)
                    }
                })
                return GLib.SOURCE_REMOVE
            }

            readChunk()
        } catch (e) {
            console.error("Error iniciando:", e)
        }
    }

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        startVisualizer()
        return GLib.SOURCE_REMOVE
    })

    container.connect("destroy", () => {
        subprocess?.force_exit()
    })

    return container
}