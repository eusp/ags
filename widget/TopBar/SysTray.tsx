import { Gtk } from "ags/gtk4"
import Tray from "gi://AstalTray"

const tray = Tray.get_default()

export default function SysTray() {
    const list = <box spacing={6} /> as Gtk.Box

    const update = () => {
        while (list.get_first_child()) list.remove(list.get_first_child()!)
        tray.items.forEach((item: any) => {
            list.append(
                <menubutton>
                    <image gicon={item.gicon} />
                </menubutton>
            )
        })
    }

    tray.connect("notify::items", update)
    update()
    return list
}
