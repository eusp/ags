import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

import InternetToggle from "./InternetToggle"
import BluetoothToggle from "./BluetoothToggle"
import SoundControl from "./SoundControl"
import MusicControl from "./MusicControl"
import NotificationPanel from "./NotificationPanel"

export default function QuickSettings() {
    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            cssClasses={["quick-settings"]}
            spacing={12}
        >
            {/* Header */}
            <label
                cssClasses={["section-title"]}
                label="Configuración Rápida"
                halign={Gtk.Align.START}
            />
            
            {/* Quick Settings Grid */}
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                cssClasses={["quick-settings-grid"]}
                spacing={8}
                homogeneous={true}
            >
                <InternetToggle />
                <BluetoothToggle />
                <SoundControl />
                <MusicControl />
            </box>

            {/* Notifications Panel */}
            <NotificationPanel />
        </box>
    )
}
