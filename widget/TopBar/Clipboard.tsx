import { Gtk } from "ags/gtk4"
import { exec, execAsync } from "ags/process"
import GLib from "gi://GLib?version=2.0"

export default function Clipboard() {
    const list = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 })
    list.add_css_class("clipboard-list")

    const popoverBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 8 })
    popoverBox.add_css_class("clipboard-popover")

    const header = new Gtk.Label({ label: "Portapapeles", halign: Gtk.Align.START })
    header.add_css_class("popover-title")
    popoverBox.append(header)
    popoverBox.append(new Gtk.Box({ cssClasses: ["divider"] }))

    const scrolled = new Gtk.ScrolledWindow({ vexpand: true })
    scrolled.set_size_request(250, 200)
    scrolled.set_child(list)
    popoverBox.append(scrolled)

    const updateList = () => {
        while (list.get_first_child()) list.remove(list.get_first_child()!)

        try {
            const output = exec("cliphist list")
            const items = output.split("\n").filter(Boolean).slice(0, 10)

            items.forEach((item) => {
                const parts = item.split("\t")
                const id = parts[0]
                const text = parts.slice(1).join("\t").substring(0, 60)

                const btn = new Gtk.Button()
                const label = new Gtk.Label({ label: text || "...", xalign: 0, ellipsize: 3 })
                label.add_css_class("clip-item-label")
                btn.set_child(label)
                btn.connect("clicked", () => {
                    execAsync(`bash -c 'echo "${id}" | cliphist decode | wl-copy'`)
                })
                list.append(btn)
            })
        } catch {
            list.append(new Gtk.Label({ label: "cliphist no disponible" }))
        }
    }

    const popover = new Gtk.Popover()
    popover.set_child(popoverBox)
    popover.connect("notify::visible", () => {
        if (popover.visible) updateList()
    })

    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(new Gtk.Image({ iconName: "edit-copy-symbolic" }))
    menubutton.set_popover(popover)

    return menubutton
}
