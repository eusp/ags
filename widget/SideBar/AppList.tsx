import { Gtk } from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"
import Apps from "gi://AstalApps"
import { MenuPopover, MenuItem, MenuSection } from "../Shared/MenuPopover"

const hyprland = Hyprland.get_default()
const apps = new Apps.Apps()

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

function createContextMenu(widget: Gtk.Widget, client?: Hyprland.Client, appInfo?: any) {
    const sections: MenuSection[] = []

    // 1. Dynamic Desktop Actions (Jump Lists)
    const match = appInfo?.matches || client?.class?.toLowerCase() || ""
    const desktopApp = apps.list.find(a =>
        (a.wm_class?.toLowerCase() || "").includes(match) ||
        (a.id?.toLowerCase() || "").includes(match) ||
        (a.name?.toLowerCase() || "").includes(match)
    )

    if (desktopApp) {
        // @ts-ignore
        const actions = desktopApp.app_actions || desktopApp.actions || []
        if (actions.length > 0) {
            sections.push({
                title: desktopApp.name,
                items: actions.map((a: any) => ({
                    label: a.name,
                    icon: "system-run-symbolic",
                    onClick: () => desktopApp.launch_action(a.action_id)
                }))
            })
        }
    }

    // 2. Window Management
    const windowItems: MenuItem[] = []

    if (appInfo) {
        windowItems.push({
            label: "Nueva ventana",
            icon: "window-new-symbolic",
            onClick: () => launchDetached(appInfo.command)
        })
    }

    if (client) {
        const addr = client.address.startsWith("0x") ? client.address : `0x${client.address}`

        windowItems.push({
            label: "Minimizar",
            icon: "window-minimize-symbolic",
            onClick: () => hyprland.dispatch("movetoworkspacesilent", `special:minimized,address:${addr}`)
        })

        windowItems.push({
            label: "Flotante",
            icon: "window-pop-out-symbolic",
            onClick: () => hyprland.dispatch("togglefloating", `address:${addr}`)
        })

        windowItems.push({
            label: "Cerrar",
            icon: "window-close-symbolic",
            onClick: () => hyprland.dispatch("closewindow", `address:${addr}`),
            isDangerous: true
        })
    }

    if (windowItems.length > 0) {
        sections.push({ items: windowItems })
    }

    return MenuPopover(widget, sections, Gtk.PositionType.RIGHT)
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
                const isRunning = !!runningClient

                const btn = new Gtk.Button({ tooltipText: app.tooltip })
                btn.add_css_class("shortcut-btn")
                if (isFocused) {
                    btn.add_css_class("active")
                } else if (isRunning) {
                    btn.add_css_class("running")
                }

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

                // Context Menu
                const popover = createContextMenu(btn, runningClient, app) 
                const gesture = new Gtk.GestureClick({ button: 3 })
                gesture.connect("released", () => {
                    popover.popup()
                })
                btn.add_controller(gesture)

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

                // Context Menu
                const popover = createContextMenu(btn, client)
                const gesture = new Gtk.GestureClick({ button: 3 })
                gesture.connect("released", () => {
                    popover.popup()
                })
                btn.add_controller(gesture)

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
