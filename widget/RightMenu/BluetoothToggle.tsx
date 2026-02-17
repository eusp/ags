import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function BluetoothToggle() {
    const toggleBluetooth = () => {
        execAsync("bluetoothctl power toggle").catch(() => {})
    }

    return (
        <button
            cssClasses={["quick-toggle", "bluetooth-toggle"]}
            onClicked={toggleBluetooth}
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
                    label="🔵"
                />
                <label
                    cssClasses={["toggle-label"]}
                    label="Bluetooth"
                />
            </box>
        </button>
    )
}
