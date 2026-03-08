import { Gtk } from "ags/gtk4"
import Network from "gi://AstalNetwork"
import { execAsync } from "ags/process"
import { MenuPopover } from "../Shared/MenuPopover"

const network = Network.get_default()
const { Connectivity } = Network

export default function NetworkIndicator() {
    const icon = new Gtk.Image()
    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(icon)

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

        // Create or update Sections - For simplicity with current MenuPopover, 
        // we recreate if needed but Network normally stable. 
        // Actually, let's create it once with the initial state and just update the icon/label if we can.
        // But MenuPopover creates widgets. Let's just make it call it once.
        if (!menubutton.get_popover()) {
            const popover = MenuPopover(menubutton, [
                {
                    items: [{
                        label: labelText,
                        icon: iconName,
                        onClick: () => { }
                    }]
                },
                {
                    items: [{
                        label: "Configuración",
                        icon: "preferences-system-network-symbolic",
                        onClick: () => execAsync("nm-connection-editor")
                    }]
                }
            ])
            menubutton.set_popover(popover)
        }
    }

    network.connect("notify::primary", () => {
        // Here we might need to recreate the popover if the labels strictly need to change,
        // or we refactor MenuPopover to be updateable. 
        // For now, let's just clear the popover and recreate IT ONLY when state changes, not on every map.
        menubutton.set_popover(null!)
        update()
    })
    network.connect("notify::connectivity", () => {
        menubutton.set_popover(null!)
        update()
    })

    update()

    return menubutton
}
