import { Gtk } from "ags/gtk4"
import Bluetooth from "gi://AstalBluetooth"
import { MenuPopover } from "../Shared/MenuPopover"

export default function BluetoothIndicator() {
    let bt: any
    try {
        bt = Bluetooth.get_default()
    } catch {
        return new Gtk.Box()
    }
    if (!bt) return new Gtk.Box()

    const icon = new Gtk.Image()
    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(icon)

    const list = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 })
    const scrolled = new Gtk.ScrolledWindow()
    scrolled.set_size_request(200, 150)
    scrolled.set_child(list)

    const updateList = () => {
        while (list.get_first_child()) {
            list.remove(list.get_first_child()!)
        }

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
                    row.append(new Gtk.Label({ label: "●", cssClasses: ["bt-connected"] }))
                }
                list.append(row)
            })
        } else {
            list.append(new Gtk.Label({ label: "Bluetooth apagado", halign: Gtk.Align.START, cssClasses: ["dim"] }))
        }
    }

    // Usamos una función que mapea el estado actual a los ítems del menú dinámicamente
    const getMenuSections = () => [
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
    ]

    // Inicializar Popover único
    const popover = MenuPopover(menubutton, getMenuSections())
    menubutton.set_popover(popover)

    const update = () => {
        icon.iconName = bt.isPowered
            ? "bluetooth-active-symbolic"
            : "bluetooth-disabled-symbolic"
        updateList()
    }

    // En lugar de reconstruir el widget, respondemos a los cambios regenerando el contenido interno si es necesario
    bt.connect("notify::is-powered", () => {
        update()
        
        const currentPopover = menubutton.get_popover();
        if (currentPopover) {
            currentPopover.hide();
        }

        const newPopover = MenuPopover(menubutton, getMenuSections());
        menubutton.set_popover(newPopover);
    })

    bt.connect("notify::devices", updateList)
    update()

    return menubutton
}