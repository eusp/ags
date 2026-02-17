import { Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function SoundControl() {
    const toggleMute = () => {
        execAsync("pactl set-sink-mute @DEFAULT_SINK@ toggle").catch(() => {})
    }

    const openVolumeControl = () => {
        execAsync("pavucontrol").catch(() => {})
    }

    const button = new Gtk.Button({
        cssClasses: ["quick-toggle", "sound-toggle"],
        hexpand: true,
        vexpand: true
    })

    const gesture = new Gtk.GestureClick()
    button.add_controller(gesture)

    gesture.connect("pressed", () => {
        toggleMute()
    })

    const rightGesture = new Gtk.GestureClick()
    rightGesture.set_button(Gdk.BUTTON_SECONDARY)
    button.add_controller(rightGesture)

    rightGesture.connect("pressed", () => {
        openVolumeControl()
    })

    const content = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 4,
        halign: Gtk.Align.CENTER
    })

    const icon = new Gtk.Label({
        label: "🔊",
        cssClasses: ["toggle-icon"]
    })

    const label = new Gtk.Label({
        label: "Sonido",
        cssClasses: ["toggle-label"]
    })

    content.append(icon)
    content.append(label)
    button.set_child(content)

    return button
}
