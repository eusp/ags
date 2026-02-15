import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"

export default function Clock() {
    const label = <label cssClasses={["clock"]} /> as Gtk.Label

    const update = () => {
        const time = GLib.DateTime.new_now_local()
        label.label = time.format("%H:%M  •  %a %d %b") || ""
    }

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        update()
        return GLib.SOURCE_CONTINUE
    })

    update()
    return label
}
