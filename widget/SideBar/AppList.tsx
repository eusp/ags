import { Gtk } from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"
import Apps from "gi://AstalApps"
import Gio from "gi://Gio"
import { MenuPopover, MenuItem, MenuSection } from "../Shared/MenuPopover"
import pins from "../../lib/pins"

const hyprland = Hyprland.get_default()
const apps = new Apps.Apps()

const DEFAULT_APPS = [
    { icon: "utilities-terminal-symbolic", command: "ptyxis", tooltip: "Terminal", matches: "ptyxis", id: "ptyxis.desktop" },
    { icon: "folder-symbolic", command: "nautilus", tooltip: "Nautilus", matches: "nautilus", id: "org.gnome.Nautilus.desktop" },
    { icon: "firefox-symbolic", command: "firefox", tooltip: "Firefox", matches: "firefox", id: "firefox.desktop" },
    { icon: "antigravity-symbolic", command: "antigravity", tooltip: "Antigravity", matches: "antigravity", id: "antigravity.desktop" },
    { icon: "steam-symbolic", command: "steam", tooltip: "Steam", matches: "steam", id: "steam.desktop" },
]

function launchDetached(command: string) {
    const { Gio } = imports.gi;

    try {
        new Gio.Subprocess({
            argv: [command],
        }).init(null);
    } catch (e) {
        // @ts-ignore
        if (typeof print !== 'undefined') print(e);
    }
}

function createContextMenu(widget: Gtk.Widget, client?: Hyprland.Client, appInfo?: any) {
    const sections: MenuSection[] = []

    // 1. Dynamic Desktop Actions (Jump Lists)
    const match = appInfo?.matches || client?.class?.toLowerCase() || ""

    // Attempt to find the best DesktopAppInfo
    let desktopApp: Gio.DesktopAppInfo | null = null

    // Helper to log or search
    const tryGetAppInfo = (id: string) => {
        if (!id) return null
        // @ts-ignore
        const DesktopAppInfo = (imports.gi.GioUnix ? imports.gi.GioUnix.DesktopAppInfo : Gio.DesktopAppInfo)
        // Try exact, then .desktop, then common prefixes
        return DesktopAppInfo.new(id) ||
            DesktopAppInfo.new(id + ".desktop") ||
            DesktopAppInfo.new("org.mozilla." + id) ||
            DesktopAppInfo.new("org.gnome." + (id === "nautilus" ? "Nautilus" : id))
    }

    // Try finding via Astal and getting its ID
    const astalApp = apps.list.find(a => {
        const id = (a.id || "").toLowerCase()
        const wm = (a.wm_class || "").toLowerCase()
        const name = (a.name || "").toLowerCase()
        return id.includes(match) || wm.includes(match) || name.includes(match)
    })

    if (astalApp?.id) {
        // @ts-ignore
        const DesktopAppInfo = (imports.gi.GioUnix ? imports.gi.GioUnix.DesktopAppInfo : Gio.DesktopAppInfo)
        desktopApp = DesktopAppInfo.new(astalApp.id)
    }

    // If still not found, search Gio directly with the match string
    if (!desktopApp) {
        desktopApp = tryGetAppInfo(match)
    }

    // Last resort: search through all app infos
    if (!desktopApp) {
        const allApps = Gio.AppInfo.get_all()
        desktopApp = allApps.find(a =>
            (a.get_id() || "").toLowerCase().includes(match) ||
            (a.get_name() || "").toLowerCase().includes(match) ||
            (a.get_executable() || "").toLowerCase().includes(match)
        ) as Gio.DesktopAppInfo
    }

    if (desktopApp) {
        // @ts-ignore
        const actions = desktopApp.list_actions ? desktopApp.list_actions() : []
        if (actions.length > 0) {
            sections.push({
                title: desktopApp.get_display_name(),
                items: actions.map(name => ({
                    label: desktopApp?.get_action_name(name) || name,
                    icon: "system-run-symbolic",
                    onClick: () => {
                        // @ts-ignore
                        if (desktopApp?.launch_action) desktopApp.launch_action(name, null)
                    }
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

    // 3. Pinning Options
    const pinningItems: MenuItem[] = []
    const appId = desktopApp?.get_id() || astalApp?.id || (appInfo?.id) || ""
    const isPinnedMenu = pins.isPinnedMenu(appId)
    const isPinnedSidebar = pins.isPinnedSidebar(appId)

    pinningItems.push({
        label: isPinnedMenu ? "Desanclar del menú" : "Anclar al menú",
        icon: isPinnedMenu ? "bookmark-remove-symbolic" : "bookmark-new-symbolic",
        onClick: () => pins.toggleMenu(appId)
    })

    pinningItems.push({
        label: isPinnedSidebar ? "Desanclar del sidebar" : "Anclar al sidebar",
        icon: isPinnedSidebar ? "pin-symbolic" : "bookmark-new-symbolic",
        onClick: () => pins.toggleSidebar(appId)
    })

    sections.push({ items: pinningItems })

    if (windowItems.length > 0) {
        // Deduplicate "Nueva ventana" if already provided by desktop actions
        const existingLabels = sections.flatMap(s => s.items || []).map(i => i.label.toLowerCase())
        const hasNewWindow = existingLabels.some(l =>
            (l.includes("nueva") && l.includes("ventana")) ||
            (l.includes("new") && l.includes("window"))
        )

        const filteredWindowItems = hasNewWindow
            ? windowItems.filter(i => i.label !== "Nueva ventana")
            : windowItems

        if (filteredWindowItems.length > 0) {
            sections.push({ items: filteredWindowItems })
        }
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
            // Clear existing children
            while (container.get_first_child()) {
                container.remove(container.get_first_child()!)
            }

            const clients = hyprland.clients
            const focused = hyprland.focusedClient

            // 1. Pinned Apps
            const currentSidebarPins = pins.getSidebar()
            const allPinned = [...DEFAULT_APPS]
            
            // Add other pinned apps from service
            currentSidebarPins.forEach(id => {
                if (!allPinned.some(a => a.id === id)) {
                    // Try to find app info
                    // @ts-ignore
                    const DesktopAppInfo = (imports.gi.GioUnix ? imports.gi.GioUnix.DesktopAppInfo : Gio.DesktopAppInfo)
                    const di = DesktopAppInfo.new(id)
                    if (di) {
                        allPinned.push({
                            icon: di.get_icon()?.to_string() || "system-run-symbolic",
                            command: di.get_executable() || "",
                            tooltip: di.get_display_name() || id,
                            matches: id.split(".")[0].toLowerCase(),
                            id: id
                        })
                    }
                }
            })

            allPinned.forEach(app => {
                const runningClient = clients.find(c => (c.class?.toLowerCase() || "").includes(app.matches))
                const isFocused = focused && (focused.class?.toLowerCase() || "").includes(app.matches)
                const isRunning = !!runningClient

                const btn = new Gtk.Button({ tooltipText: app.tooltip })
                btn.add_css_class("shortcut-btn")
                if (isFocused) {
                    btn.add_css_class("active")
                } else if (isRunning) {
                    btn.add_css_class("running")
                }

                const icon = app.icon.includes("/") 
                    ? new Gtk.Image({ file: app.icon, pixelSize: 24 })
                    : new Gtk.Image({ iconName: app.icon })
                btn.set_child(icon)

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

                // Context Menu (Lazy Loaded)
                let popover: any = null
                const gesture = new Gtk.GestureClick({ button: 3 })
                gesture.connect("released", () => {
                    if (!popover) {
                        popover = createContextMenu(btn, runningClient, app)
                    }
                    popover.popup()
                })
                btn.add_controller(gesture)

                container.append(btn)
            })

            // 2. Dynamic Running Apps
            clients.forEach(client => {
                const isDefault = allPinned.some(a => (client.class?.toLowerCase() || "").includes(a.matches))
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

                // Context Menu (Lazy Loaded)
                let popover: any = null
                const gesture = new Gtk.GestureClick({ button: 3 })
                gesture.connect("released", () => {
                    if (!popover) {
                        popover = createContextMenu(btn, client)
                    }
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
    pins.connect("sidebar-changed", update)

    // Initial update
    update()

    return container
}
