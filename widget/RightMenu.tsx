import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"
import QuickSettings from "./RightMenu/QuickSettings"
import AppsPanel from "./RightMenu/AppsPanel"
import PowerActions from "./RightMenu/PowerActions"

declare const imports: any
const { GLib } = imports.gi

let rightMenuWindowRef: Astal.Window | null = null
let appsPanelRef: any = null

export function toggleRightMenu() {
    if (!rightMenuWindowRef) return

    if (rightMenuWindowRef.visible) {
        rightMenuWindowRef.hide()
    } else {
        rightMenuWindowRef.show()
        // Focus on search entry when menu opens
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
            if (appsPanelRef && appsPanelRef.searchEntry) {
                appsPanelRef.searchEntry.grab_focus()
            }
            return false // Don't repeat
        })
    }
}

export default function RightMenu(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, RIGHT } = Astal.WindowAnchor

    const appsPanel = <AppsPanel />
    appsPanelRef = appsPanel

    const rightMenuWindow = (
        <Astal.Window
            name="rightmenu"
            cssClasses={["RightMenu"]}
            visible={false}
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | BOTTOM | RIGHT}
            application={app}
            layer={Astal.Layer.TOP}
            keymode={Astal.Keymode.ON_DEMAND}
        >
            <box
                orientation={Gtk.Orientation.VERTICAL}
                cssClasses={["rightmenu-container"]}
                spacing={12}
                widthRequest={320}
            >
                {/* TOP - Quick Settings */}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    cssClasses={["quick-settings-zone"]}
                >
                    <QuickSettings />
                </box>

                {/* CENTER - Recent apps + launcher */}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    cssClasses={["apps-panel-zone"]}
                    valign={Gtk.Align.END}
                    vexpand={true}
                >
                    {appsPanel}
                </box>

                {/* BOTTOM - Power Actions */}
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    valign={Gtk.Align.END}
                    cssClasses={["power-actions-zone"]}
                >
                    <PowerActions />
                </box>
            </box>
        </Astal.Window>
    )

    rightMenuWindowRef = rightMenuWindow

    return rightMenuWindow
}