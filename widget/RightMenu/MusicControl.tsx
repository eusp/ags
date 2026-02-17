import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function MusicControl() {
    const openMusicPlayer = () => {
        execAsync("spotify").catch(() => {
            execAsync("rhythmbox").catch(() => {})
        })
    }

    return (
        <button
            cssClasses={["quick-toggle", "music-toggle"]}
            onClicked={openMusicPlayer}
            hexpand={true}
            vexpand={true}
        >
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={4}
                halign={Gtk.Align.CENTER}
            >
                <label
                    cssClasses={["toggle-icon"]}
                    label="🎵"
                />
                <label
                    cssClasses={["toggle-label"]}
                    label="Música"
                />
            </box>
        </button>
    )
}
