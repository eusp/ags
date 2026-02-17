import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function InternetToggle() {
    const toggleWifi = () => {
        execAsync("nmcli radio wifi toggle").catch(() => {})
    }

    return (
        <button
            cssClasses={["quick-toggle", "internet-toggle"]}
            onClicked={toggleWifi}
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
                    label="📡"
                />
                <label
                    cssClasses={["toggle-label"]}
                    label="Internet"
                />
            </box>
        </button>
    )
}
