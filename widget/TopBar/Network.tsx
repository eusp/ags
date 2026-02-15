import { Gtk } from "ags/gtk4"
import Network from "gi://AstalNetwork"
import { execAsync } from "ags/process"

const network = Network.get_default()
const { DeviceType, Connectivity } = Network

export default function NetworkIndicator() {
    const icon = new Gtk.Image()
    const popoverBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 })
    popoverBox.add_css_class("network-popover")

    const update = () => {
        const primary = network.primary
        const conn = network.connectivity

        let iconName = "network-offline-symbolic"
        let labelText = "Sin conexión"

        if (conn === Connectivity.FULL) {
            if (primary?.type === "WIFI") {
                iconName = primary.wifi.iconName || "network-wireless-symbolic"
                labelText = primary.wifi.ssid || "WiFi conectado"
            } else if (primary?.type === "WIRED") {
                iconName = "network-wired-symbolic"
                labelText = "Ethernet conectado"
            }
        }

        icon.iconName = iconName

        // Actualizar popover
        while (popoverBox.get_first_child()) popoverBox.remove(popoverBox.get_first_child()!)
        const row = new Gtk.Box({ spacing: 8 })
        row.append(new Gtk.Image({ iconName }))
        row.append(new Gtk.Label({ label: labelText }))
        popoverBox.append(row)

        popoverBox.append(new Gtk.Box({ cssClasses: ["divider"] }))

        const configButton = new Gtk.Button()
        configButton.connect("clicked", () => execAsync("nm-connection-editor"))
        const buttonBox = new Gtk.Box({ spacing: 8 })
        buttonBox.append(new Gtk.Image({ iconName: "preferences-system-network-symbolic" }))
        buttonBox.append(new Gtk.Label({ label: "Configuración" }))
        configButton.set_child(buttonBox)
        popoverBox.append(configButton)
    }

    network.connect("notify::primary", update)
    network.connect("notify::connectivity", update)

    // No actualizar hasta que el widget esté mapeado, para evitar warnings
    icon.connect("map", update)

    return (() => {
        const menubutton = new Gtk.MenuButton()
        menubutton.set_child(icon)

        const popover = new Gtk.Popover()
        popover.set_child(popoverBox)
        menubutton.set_popover(popover)

        return menubutton
    })()
}
