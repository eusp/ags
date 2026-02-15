import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"

import { MediaVisualizer, MediaControls } from "./SideBar/Media"

function Shortcut({ icon, command, tooltip }: { icon: string, command: string | (() => void), tooltip: string }) {
    return (
        <button
            cssClasses={["shortcut-btn"]}
            tooltipText={tooltip}
            onClicked={() => {
                if (typeof command === "function") command()
                else execAsync(command)
            }}
        >
            <image iconName={icon} />
        </button>
    )
}

export default function SideBar(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT } = Astal.WindowAnchor

    return (
        <Astal.Window
            name="sidebar"
            cssClasses={["SideBar"]}
            visible
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | BOTTOM | LEFT}
            application={app}
            layer={Astal.Layer.TOP}
        >
            <box
                orientation={Gtk.Orientation.VERTICAL}
                cssClasses={["sidebar-container"]}
                spacing={10}
            >
                {/* TOP - App Shortcuts */}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    valign={Gtk.Align.START}
                    spacing={8}
                >
                    <Shortcut icon="utilities-terminal-symbolic" command="ghostty" tooltip="Terminal" />
                    <Shortcut icon="firefox-symbolic" command="firefox" tooltip="Firefox" />
                    <Shortcut icon="antigravity-symbolic" command="antigravity" tooltip="Antigravity" />
                    <Shortcut icon="steam-symbolic" command="steam" tooltip="Steam" />
                </box>

                {/* CENTER - Media Visualizer */}
                <MediaVisualizer />

                {/* BOTTOM - Media Controls */}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    valign={Gtk.Align.END}
                    spacing={8}
                    cssClasses={["system-zone"]}
                >
                    <MediaControls />
                </box>
            </box>
        </Astal.Window>
    )
}
