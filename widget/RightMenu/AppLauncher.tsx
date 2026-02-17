import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function AppLauncher() {
    const searchEntry = new Gtk.Entry({
        placeholderText: "Buscar aplicaciones...",
        cssClasses: ["app-search"],
        hexpand: true
    })

    const searchResults = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 4,
        cssClasses: ["search-results"],
        heightRequest:150
    })

    const performSearch = () => {
        const searchText = searchEntry.get_text().toLowerCase()
        
        while (searchResults.get_first_child()) {
            searchResults.remove(searchResults.get_first_child())
        }

        if (searchText.length < 2) {
            const emptyLabel = new Gtk.Label({
                label: "Escribe al menos 2 caracteres para buscar",
                cssClasses: ["empty-state"],
                halign: Gtk.Align.CENTER,
                valign: Gtk.Align.CENTER,
                vexpand: true
            })
            searchResults.append(emptyLabel)
            return
        }

        const apps = [
            { name: "Firefox", icon: "🌐", command: "firefox" },
            { name: "Chrome", icon: "🌍", command: "google-chrome" },
            { name: "Terminal", icon: "💻", command: "gnome-terminal" },
            { name: "VS Code", icon: "📝", command: "code" },
            { name: "Steam", icon: "🎮", command: "steam" },
            { name: "Files", icon: "📁", command: "nautilus" },
            { name: "Settings", icon: "⚙️", command: "gnome-control-center" },
            { name: "Calculator", icon: "🧮", command: "gnome-calculator" },
            { name: "Text Editor", icon: "📄", command: "gedit" }
        ]

        const filteredApps = apps.filter(app => 
            app.name.toLowerCase().includes(searchText)
        )

        if (filteredApps.length === 0) {
            const noResultsLabel = new Gtk.Label({
                label: "No se encontraron aplicaciones",
                cssClasses: ["empty-state"],
                halign: Gtk.Align.CENTER,
                valign: Gtk.Align.CENTER,
                vexpand: true
            })
            searchResults.append(noResultsLabel)
            return
        }

        filteredApps.forEach(app => {
            const appButton = new Gtk.Button({
                cssClasses: ["search-result-item"],
                hexpand: true
            })

            const appContent = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                spacing: 12,
                halign: Gtk.Align.START
            })

            const appIcon = new Gtk.Label({
                label: app.icon,
                cssClasses: ["app-icon"]
            })

            const appName = new Gtk.Label({
                label: app.name,
                cssClasses: ["app-name"],
                hexpand: true,
                halign: Gtk.Align.START
            })

            appContent.append(appIcon)
            appContent.append(appName)
            appButton.set_child(appContent)

            appButton.connect("clicked", () => {
                execAsync(app.command).catch(() => {})
                searchEntry.set_text("")
            })

            searchResults.append(appButton)
        })
    }

    searchEntry.connect("changed", performSearch)
    performSearch()

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            cssClasses={["app-launcher"]}
            spacing={8}
        >
            <label
                cssClasses={["section-title"]}
                label="Buscador de Aplicaciones"
                halign={Gtk.Align.START}
            />

            {searchEntry}
            {searchResults}
        </box>
    )
}
