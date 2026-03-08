import { Gtk } from "ags/gtk4"

export interface MenuItem {
    label: string
    icon?: string
    onClick: () => void
    isDangerous?: boolean
}

export interface MenuSection {
    title?: string
    items?: MenuItem[]
    customChild?: Gtk.Widget
}

export function MenuPopover(parent: Gtk.Widget, sections: MenuSection[], position: Gtk.PositionType = Gtk.PositionType.BOTTOM) {
    const popover = new Gtk.Popover({
        cssClasses: ["shared-popover"]
    })
    popover.set_parent(parent)
    popover.set_position(position)

    const mainBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 4,
        marginTop: 8,
        marginBottom: 8,
        marginStart: 8,
        marginEnd: 8
    })
    popover.set_child(mainBox)

    sections.forEach((section, idx) => {
        if (section.title) {
            mainBox.append(new Gtk.Label({
                label: section.title,
                xalign: 0,
                cssClasses: ["popover-section-title"]
            }))
        }

        if (section.items) {
            const sectionBox = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 2
            })

            section.items.forEach(item => {
                const btn = new Gtk.Button({
                    cssClasses: ["popover-item"]
                })
                if (item.isDangerous) btn.add_css_class("dangerous")

                const inner = new Gtk.Box({ spacing: 10 })
                if (item.icon) {
                    inner.append(new Gtk.Image({ iconName: item.icon }))
                }
                inner.append(new Gtk.Label({ label: item.label, xalign: 0, hexpand: true }))

                btn.set_child(inner)
                btn.connect("clicked", () => {
                    item.onClick()
                    popover.popdown()
                })
                sectionBox.append(btn)
            })
            mainBox.append(sectionBox)
        } else if (section.customChild) {
            const oldParent = section.customChild.get_parent()
            if (oldParent && oldParent !== mainBox) {
                // Remove from previous parent to avoid Gtk-CRITICAL
                if (oldParent instanceof Gtk.Box) {
                    oldParent.remove(section.customChild)
                } else if ("set_child" in oldParent) {
                    (oldParent as any).set_child(null)
                }
            }
            section.customChild.add_css_class("popover-custom-content")
            mainBox.append(section.customChild)
        }

        if (idx < sections.length - 1) {
            mainBox.append(new Gtk.Separator({
                orientation: Gtk.Orientation.HORIZONTAL,
                cssClasses: ["popover-separator"]
            }))
        }
    })

    // Cleanup: Avoid Gtk-WARNING by unparenting on parent destroy
    parent.connect("destroy", () => {
        if (!popover.is_finalized && popover.get_parent() === parent) {
            popover.set_parent(null!)
        }
    })

    return popover
}
