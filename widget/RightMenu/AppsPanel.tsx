import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

declare const imports: any

const { Gio, GLib } = imports.gi
const ByteArray = imports.byteArray

const PINNED_DESKTOP_IDS = [
    "LmStudio.desktop",
    "Windsurf.desktop",
    "steam.desktop",
    "Wuthering Waves.desktop",
    "The Honkers Railway Launcher.desktop",
    "TLauncher.desktop",
    "No Man's Sky.desktop",
    "Waydroid.desktop",
]

export default function AppsPanel() {
    const allInstalledApps: any[] = (Gio.AppInfo.get_all() || [])
        .filter((a: any) => a && a.should_show && a.should_show())

    const findById = (id: string) => allInstalledApps.find((a: any) => a.get_id && a.get_id() === id)

    const getDisplayName = (appInfo: any) => (appInfo.get_display_name && appInfo.get_display_name())
        || (appInfo.get_name && appInfo.get_name())
        || "App"

    const launchApp = (appInfo: any) => {
        try {
            appInfo.launch([], null)
        } catch {
            const cmd = appInfo.get_executable ? appInfo.get_executable() : null
            if (cmd) execAsync(cmd).catch(() => {})
        }
    }

    const pinnedApps: any[] = PINNED_DESKTOP_IDS
        .map((id) => findById(id))
        .filter(Boolean)

    const root = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 8,
        cssClasses: ["apps-panel"],
    })

    const searchEntry = new Gtk.Entry({
        placeholderText: "Buscar aplicaciones...",
        cssClasses: ["app-search"],
        hexpand: true,
    })

    // Expose search entry for external focus management
    root.searchEntry = searchEntry

    let isShowingAll = false
    let firstHighlightedApp: any = null

    // Handle Enter key to launch first highlighted app
    searchEntry.connect("activate", () => {
        if (firstHighlightedApp) {
            launchApp(firstHighlightedApp)
        }
    })

    const menuButton = new Gtk.Button({
        cssClasses: ["menu-button"],
    })
    
    const gridIcon = new Gtk.Image({
        icon_name: "view-grid-symbolic",
        pixelSize: 16,
    })
    menuButton.set_child(gridIcon)

    const createFlowBox = (cssClasses: string[], homogeneous: boolean = true) => new Gtk.FlowBox({
        selectionMode: Gtk.SelectionMode.NONE,
        columnSpacing: 8,
        rowSpacing: 8,
        homogeneous,
        minChildrenPerLine: 4,
        maxChildrenPerLine: 4,
        cssClasses,
    })

    const pinnedRow = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 6,
        cssClasses: ["pinned-row"],
    })

    const pinnedFlow = createFlowBox(["pinned-grid"], false)
    pinnedFlow.set_max_children_per_line(4)
    pinnedFlow.set_min_children_per_line(4)
    pinnedRow.append(pinnedFlow)
    pinnedRow.set_size_request(-1, 225)

    const flow = createFlowBox(["apps-grid"])

    const noResultsLabel = new Gtk.Label({
        label: "No se encontraron aplicaciones",
        cssClasses: ["no-results-label"],
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER,
        visible: false,
    })
    noResultsLabel.set_size_request(-1, 225)

    const scrolled = new Gtk.ScrolledWindow({
        hexpand: true,
        vexpand: true,
    })
    scrolled.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
    scrolled.set_child(flow)
    scrolled.set_min_content_height(225)

    const clearGrid = (grid: Gtk.FlowBox) => {
        while (grid.get_first_child()) grid.remove(grid.get_first_child()!)
    }

    const clearAllGrids = () => {
        clearGrid(flow)
        clearGrid(pinnedFlow)
    }
    
    const createAppTile = (appInfo: any, cssClasses: string[] = ["app-tile"]) => {
        const displayName = getDisplayName(appInfo)
        const iconObj = appInfo.get_icon ? appInfo.get_icon() : null

        const btn = new Gtk.Button({
            cssClasses,
        })

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 6,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
        })

        const icon = new Gtk.Image({ pixelSize: 32 })
        if (iconObj) icon.set_from_gicon(iconObj)

        const name = new Gtk.Label({
            label: displayName,
            cssClasses: ["app-tile-name"],
            ellipsize: 3,
            maxWidthChars: 10,
            justify: Gtk.Justification.CENTER,
            halign: Gtk.Align.CENTER,
        })

        box.append(icon)
        box.append(name)
        btn.set_child(box)

        btn.connect("clicked", () => launchApp(appInfo))

        return btn
    }

    const createHighlightedAppTile = (appInfo: any) => {
        const tile = createAppTile(appInfo, ["app-tile", "highlighted"])
        return tile
    }

    const appendAppTile = (appInfo: any) => flow.append(createAppTile(appInfo))
    const appendPinnedTile = (appInfo: any) => pinnedFlow.append(createAppTile(appInfo, ["app-tile", "pinned-tile"]))

    const render = () => {
        const q = searchEntry.get_text().trim().toLowerCase()
        clearAllGrids()
        firstHighlightedApp = null

        if (q.length === 0) {
            scrolled.visible = false
            noResultsLabel.visible = false

            pinnedRow.visible = pinnedApps.length > 0
            pinnedApps.forEach((a) => appendPinnedTile(a))

            return
        }

        scrolled.visible = true

        pinnedRow.visible = false

        const filtered = allInstalledApps
            .filter((a: any) => {
                const name = getDisplayName(a)
                return name.toLowerCase().includes(q)
            })
            .slice(0, 60)

        if (filtered.length === 0) {
            scrolled.visible = false
            noResultsLabel.visible = true
            return
        }

        noResultsLabel.visible = false
        
        // Add all apps, with first one highlighted
        filtered.forEach((app, index) => {
            if (index === 0) {
                firstHighlightedApp = app
                flow.append(createHighlightedAppTile(app))
            } else {
                flow.append(createAppTile(app))
            }
        })
    }

    const showAllApps = () => {
        clearAllGrids()
        searchEntry.set_text("")
        scrolled.visible = true
        pinnedRow.visible = false

        allInstalledApps.slice(0, 60).forEach((a) => appendAppTile(a))
    }

    const toggleAllApps = () => {
        if (isShowingAll) {
            isShowingAll = false
            searchEntry.set_text("")
            render()
        } else {
            isShowingAll = true
            showAllApps()
        }
    }

    menuButton.connect("clicked", toggleAllApps)
    searchEntry.connect("changed", render)

    const searchBox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 8,
        cssClasses: ["search-box"],
    })
    searchBox.append(searchEntry)
    searchBox.append(menuButton)

    root.append(pinnedRow)
    root.append(noResultsLabel)
    root.append(scrolled)
    root.append(searchBox)

    render()

    return root
}
