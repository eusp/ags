import { Gtk } from "ags/gtk4"
import Bluetooth from "gi://AstalBluetooth"

export default function BluetoothIndicator() {
    let bt: any
    try {
        bt = Bluetooth.get_default()
    } catch {
        return <box />
    }
    if (!bt) return <box />

    const icon = new Gtk.Image()
    const list = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 })
    const toggleLabel = new Gtk.Label()

    const popoverBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 8 })
    popoverBox.add_css_class("bt-popover")

    const title = new Gtk.Label({ label: "Bluetooth", halign: Gtk.Align.START })
    title.add_css_class("popover-title")
    popoverBox.append(title)
    popoverBox.append(new Gtk.Box({ cssClasses: ["divider"] }))

    // Toggle on/off
    const toggleBtn = new Gtk.Button()
    toggleBtn.set_child(toggleLabel)
    toggleBtn.connect("clicked", () => {
        bt.toggle()
    })
    popoverBox.append(toggleBtn)
    popoverBox.append(new Gtk.Box({ cssClasses: ["divider"] }))

    // Devices list
    const scrolled = new Gtk.ScrolledWindow()
    scrolled.set_size_request(200, 150)
    scrolled.set_child(list)
    popoverBox.append(scrolled)

    const update = () => {
        icon.iconName = bt.isPowered
            ? "bluetooth-active-symbolic"
            : "bluetooth-disabled-symbolic"

        toggleLabel.label = bt.isPowered ? "Desactivar" : "Activar"

        // Update devices list
        while (list.get_first_child()) list.remove(list.get_first_child()!)

        if (bt.isPowered) {
            const devices = bt.devices || []
            if (devices.length === 0) {
                list.append(new Gtk.Label({ label: "Sin dispositivos", halign: Gtk.Align.START }))
            }
            devices.forEach((dev: any) => {
                const row = new Gtk.Box({ spacing: 8 })
                row.append(new Gtk.Image({ iconName: dev.icon || "bluetooth-symbolic" }))
                row.append(new Gtk.Label({
                    label: dev.name || "Desconocido",
                    halign: Gtk.Align.START,
                    hexpand: true,
                }))
                if (dev.connected) {
                    const dot = new Gtk.Label({ label: "●" })
                    dot.add_css_class("bt-connected")
                    row.append(dot)
                }
                list.append(row)
            })
        } else {
            list.append(new Gtk.Label({ label: "Bluetooth apagado", halign: Gtk.Align.START }))
        }
    }

    bt.connect("notify::is-powered", update)
    bt.connect("notify::devices", update)

    const popover = new Gtk.Popover()
    popover.set_child(popoverBox)
    popover.connect("notify::visible", () => {
        if (popover.visible) update()
    })

    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(icon)
    menubutton.set_popover(popover)

    update()
    return menubutton
}
