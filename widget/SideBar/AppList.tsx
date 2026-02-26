import { Gtk } from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"

const hyprland = Hyprland.get_default()

const DEFAULT_APPS = [
    { icon: "utilities-terminal-symbolic", command: "ptyxis", tooltip: "Terminal", matches: "ptyxis" },
    { icon: "folder-symbolic", command: "nautilus", tooltip: "Nautilus", matches: "nautilus" },
    { icon: "firefox-symbolic", command: "firefox", tooltip: "Firefox", matches: "firefox" },
    { icon: "antigravity-symbolic", command: "antigravity", tooltip: "Antigravity", matches: "antigravity" },
    { icon: "steam-symbolic", command: "steam", tooltip: "Steam", matches: "steam" },
]

function launchDetached(command: string) {
    const { Gio } = imports.gi;

    try {
        // Crea y ejecuta el proceso sin pasar flags
        new Gio.Subprocess({
            argv: [command],
        }).init(null);
    } catch (e) {
        logError(e);
    }
}

export default function AppList() {
    // Container for the list
    const container = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        valign: Gtk.Align.START,
        spacing: 8
    })

    const update = () => {
        // Wrap in idle_add to avoid "out of tracking context" errors during signal callbacks
        const { GLib } = imports.gi;
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            // Check if container still exists/is valid before updating
            // simple check: if it has no native object (destroyed), stop.
            // But here it's a JS object wrapping GObject.
            // We can check if it's mapped or just try catch, but usually safe in idle if shorter than destroy.

            // Clear existing children
            while (container.get_first_child()) {
                container.remove(container.get_first_child()!)
            }

            const clients = hyprland.clients
            const focused = hyprland.focusedClient

            // 1. Default Apps
            DEFAULT_APPS.forEach(app => {
                const runningClient = clients.find(c => (c.class?.toLowerCase() || "").includes(app.matches))
                // Logic: if ANY client matching the app is focused, it's active.
                const isFocused = focused && (focused.class?.toLowerCase() || "").includes(app.matches)

                const btn = new Gtk.Button({ tooltipText: app.tooltip })
                btn.add_css_class("shortcut-btn")
                if (isFocused) btn.add_css_class("active")

                btn.set_child(new Gtk.Image({ iconName: app.icon }))

                btn.connect("clicked", () => {
                    const clients = hyprland.clients
                    const existing = clients.find(c => (c.class?.toLowerCase() || "").includes(app.matches))
                    const currentWorkspace = hyprland.focusedWorkspace

                    if (!existing) {
                        launchDetached(app.command)
                        return
                    }

                    if (currentWorkspace && existing.workspace && existing.workspace.id === currentWorkspace.id) {
                        // Minimize to special workspace
                        const addr = existing.address.startsWith("0x") ? existing.address : `0x${existing.address}`
                        const args = `special:minimized,address:${addr}`
                        hyprland.dispatch("movetoworkspacesilent", args)
                    } else if (existing.workspace && (existing.workspace.name || "").includes("minimized")) {
                        // Restore from special workspace
                        const addr = existing.address.startsWith("0x") ? existing.address : `0x${existing.address}`
                        const target = currentWorkspace ? String(currentWorkspace.id) : "+0"
                        const args = `${target},address:${addr}`
                        hyprland.dispatch("movetoworkspace", args)
                        existing.focus()
                    } else {
                        // Switch to the workspace where it is open
                        existing.focus()
                    }
                })

                container.append(btn)
            })

            // 2. Dynamic Running Apps
            clients.forEach(client => {
                const isDefault = DEFAULT_APPS.some(a => (client.class?.toLowerCase() || "").includes(a.matches))
                if (isDefault) return

                const isMinimized = client.workspace && (client.workspace.name || "").includes("minimized")
                const inCurrentWS = focused && focused.workspace && client.workspace.id === focused.workspace.id

                if (!isMinimized && !inCurrentWS) return

                const isActive = focused && focused.address === client.address

                const btn = new Gtk.Button({ tooltipText: client.title })
                btn.add_css_class("shortcut-btn")
                if (isActive) btn.add_css_class("active")

                btn.set_child(new Gtk.Image({ iconName: (client.class?.toLowerCase() || "") + "-symbolic" }))

                btn.connect("clicked", () => {
                    const currentWorkspace = hyprland.focusedWorkspace

                    if (currentWorkspace && client.workspace && client.workspace.id === currentWorkspace.id) {
                        // Minimize to special workspace
                        const addr = client.address.startsWith("0x") ? client.address : `0x${client.address}`
                        const args = `special:minimized,address:${addr}`
                        hyprland.dispatch("movetoworkspacesilent", args)
                    } else if (client.workspace && (client.workspace.name || "").includes("minimized")) {
                        // Restore from special workspace
                        const addr = client.address.startsWith("0x") ? client.address : `0x${client.address}`
                        const target = currentWorkspace ? String(currentWorkspace.id) : "+0"
                        const args = `${target},address:${addr}`
                        hyprland.dispatch("movetoworkspace", args)
                        client.focus()
                    } else {
                        // Switch to the workspace where it is open
                        client.focus()
                    }
                })

                container.append(btn)
            })

            return GLib.SOURCE_REMOVE; // Run once
        })
    }

    // Connect signals
    hyprland.connect("notify::clients", update)
    hyprland.connect("notify::focused-client", update)

    // Initial update
    update()

    return container
}
