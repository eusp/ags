import { Gtk } from "ags/gtk4"
import { exec, execAsync } from "ags/process"
import { MenuPopover } from "../Shared/MenuPopover"

export default function Clipboard() {
    const list = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 })
    list.add_css_class("clipboard-list")

    const scrolled = new Gtk.ScrolledWindow({ vexpand: true })
    scrolled.set_size_request(250, 200)
    scrolled.set_child(list)

    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(new Gtk.Image({ iconName: "edit-copy-symbolic" }))

    // Create the popover ONCE
    const popover = MenuPopover(menubutton, [
        {
            title: "Portapapeles",
            customChild: scrolled
        }
    ])
    menubutton.set_popover(popover)

    const updateList = () => {
        while (list.get_first_child()) list.remove(list.get_first_child()!)

        try {
            const output = exec("cliphist list")
            const items = output.split("\n").filter(Boolean).slice(0, 10)

            items.forEach((item) => {
                const parts = item.split("\t")
                const id = parts[0]
                const text = parts.slice(1).join("\t").substring(0, 60)

                const btn = new Gtk.Button({ cssClasses: ["popover-item"] })
                const label = new Gtk.Label({ label: text || "...", xalign: 0, ellipsize: 3, cssClasses: ["clip-item-label"] })
                btn.set_child(label)
                btn.connect("clicked", () => {
                    execAsync(`bash -c 'echo "${id}" | cliphist decode | wl-copy'`)
                    popover.popdown()
                })
                list.append(btn)
            })
        } catch {
            list.append(new Gtk.Label({ label: "cliphist no disponible", cssClasses: ["dim"] }))
        }
    }

    // Update whenever the popover is shown
    popover.connect("notify::visible", () => {
        if (popover.visible) updateList()
    })

    // Initial update
    updateList()

    return menubutton
}
