import { Gtk } from "ags/gtk4"
import ClockWeather from "./ClockWeather"
import InternetToggle from "./InternetToggle"
import BluetoothToggle from "./BluetoothToggle"
import SoundControl from "./SoundControl"
import MicrophoneControl from "./MicrophoneControl"
import NotificationPanel from "./NotificationPanel"

export default function QuickSettings() {
    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            cssClasses={["quick-settings"]}
            spacing={16}
        >
            {/* Minimalist Clock & Weather */}
            <ClockWeather />

            <box
                orientation={Gtk.Orientation.VERTICAL}
                cssClasses={["quick-settings-list"]}
                spacing={4}
            >
                <InternetToggle />
                <BluetoothToggle />
                <SoundControl />
                <MicrophoneControl />
            </box>

            {/* Notifications Panel */}
            {/*<NotificationPanel />*/}
        </box>
    )
}
