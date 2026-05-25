import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"
import { MenuPopover } from "../Shared/MenuPopover"

export default function Clipboard() {
    const list = new Gtk.ListBox({ 
        selectionMode: Gtk.SelectionMode.NONE,
        cssClasses: ["clipboard-list"] 
    })

    const scrolled = new Gtk.ScrolledWindow({ vexpand: true })
    scrolled.set_size_request(250, 200)
    scrolled.set_child(list)

    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(new Gtk.Image({ iconName: "edit-copy-symbolic" }))

    const popover = MenuPopover(menubutton, [
        {
            title: "Portapapeles",
            customChild: scrolled
        }
    ])
    menubutton.set_popover(popover)

    const updateList = async () => {
        let row = list.get_row_at_index(0)
        while (row) {
            list.remove(row)
            row = list.get_row_at_index(0)
        }

        try {
            const output = await execAsync("cliphist list")
            const items = output.split("\n").filter(Boolean).slice(0, 10)

            items.forEach((item) => {
                const parts = item.split("\t")
                const id = parts[0]
                const text = parts.slice(1).join("\t").substring(0, 60)

                const rowItem = new Gtk.ListBoxRow()
                const btn = new Gtk.Button({ cssClasses: ["popover-item"] })
                
                btn.set_child(new Gtk.Label({ 
                    label: text || "...", 
                    xalign: 0, 
                    ellipsize: 3, 
                    cssClasses: ["clip-item-label"] 
                }))

                btn.connect("clicked", () => {
                    execAsync(`bash -c 'echo "${id}" | cliphist decode | wl-copy'`)
                    popover.popdown()
                })

                rowItem.set_child(btn)
                list.append(rowItem)
            })
        } catch {
            const row = new Gtk.ListBoxRow()
            row.set_child(new Gtk.Label({ label: "cliphist no disponible", cssClasses: ["dim"] }))
            list.append(row)
        }
    }

    popover.connect("notify::visible", () => {
        if (popover.visible) updateList()
    })

    return menubutton
}