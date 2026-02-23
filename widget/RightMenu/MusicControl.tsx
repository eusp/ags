import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function MusicControl() {
    const openMusicPlayer = () => {
        execAsync("spotify").catch(() => {
            execAsync("rhythmbox").catch(() => { })
        })
    }

    return (
        <button
            cssClasses={["quick-toggle", "music-toggle"]}
            onClicked={openMusicPlayer}
            hexpand={true}
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={12}
                halign={Gtk.Align.FILL}
            >
                <box spacing={12} hexpand={true}>
                    <label cssClasses={["toggle-icon"]} label="󰎈" />
                    <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
                        <label cssClasses={["toggle-title"]} label="Multimedia" halign={Gtk.Align.START} />
                        <label cssClasses={["toggle-label"]} label="Abrir reproductor" halign={Gtk.Align.START} />
                    </box>
                </box>
                <label label="" cssClasses={["toggle-arrow"]} />
            </box>
        </button>
    )
}
