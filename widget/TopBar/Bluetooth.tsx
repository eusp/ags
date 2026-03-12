import { Gtk } from "ags/gtk4"
import Bluetooth from "gi://AstalBluetooth"
import { MenuPopover } from "../Shared/MenuPopover"

export default function BluetoothIndicator() {
    let bt: any
    try {
        bt = Bluetooth.get_default()
    } catch {
        return <box />
    }
    if (!bt) return <box />

    const icon = new Gtk.Image()
    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(icon)

    const list = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 })
    const scrolled = new Gtk.ScrolledWindow()
    scrolled.set_size_request(200, 150)
    scrolled.set_child(list)

    const updateList = () => {
        while (list.get_first_child()) list.remove(list.get_first_child()!)

        if (bt.isPowered) {
            const devices = bt.devices || []
            if (devices.length === 0) {
                list.append(new Gtk.Label({ label: "Sin dispositivos", halign: Gtk.Align.START, cssClasses: ["dim"] }))
            }
            devices.forEach((dev: any) => {
                const row = new Gtk.Box({ spacing: 8, cssClasses: ["popover-item"] })
                row.append(new Gtk.Image({ iconName: dev.icon || "bluetooth-symbolic" }))
                row.append(new Gtk.Label({
                    label: dev.name || "Desconocido",
                    halign: Gtk.Align.START,
                    hexpand: true,
                }))
                if (dev.connected) {
                    const dot = new Gtk.Label({ label: "●", cssClasses: ["bt-connected"] })
                    row.append(dot)
                }
                list.append(row)
            })
        } else {
            list.append(new Gtk.Label({ label: "Bluetooth apagado", halign: Gtk.Align.START, cssClasses: ["dim"] }))
        }
    }

    const update = () => {
        icon.iconName = bt.isPowered
            ? "bluetooth-active-symbolic"
            : "bluetooth-disabled-symbolic"

        updateList()

        // Create the popover ONCE or only when strictly necessary
        if (!menubutton.get_popover()) {
            const popover = MenuPopover(null, [
                {
                    title: "Bluetooth",
                    items: [{
                        label: bt.isPowered ? "Desactivar" : "Activar",
                        icon: "system-shutdown-symbolic",
                        onClick: () => bt.toggle()
                    }]
                },
                {
                    customChild: scrolled
                }
            ])
            menubutton.set_popover(popover)
        }
    }

    bt.connect("notify::is-powered", () => {
        menubutton.set_popover(null!) // Force recreation on power toggle to update the button label
        update()
    })
    bt.connect("notify::devices", updateList)

    update()

    return menubutton
}
