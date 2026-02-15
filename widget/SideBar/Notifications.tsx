import { Gtk } from "ags/gtk4"
import Notifd from "gi://AstalNotifd"

const notifd = Notifd.get_default()

export default function Notifications() {
    const badgeLabel = <label cssClasses={["notif-badge"]} /> as Gtk.Label
    const list = <box orientation={Gtk.Orientation.VERTICAL} spacing={4} /> as Gtk.Box

    const update = () => {
        const ns = notifd.get_notifications()

        // Update badge
        badgeLabel.label = ns.length > 0 ? String(ns.length) : ""
        badgeLabel.set_visible(ns.length > 0)

        // Clear and rebuild list
        while (list.get_first_child()) {
            list.remove(list.get_first_child()!)
        }

        ns.forEach((n: any) => {
            list.append(
                <box spacing={8} cssClasses={["notif-item"]}>
                    <image iconName={n.app_icon || "dialog-information-symbolic"} />
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        <label label={n.summary} truncate halign={Gtk.Align.START} cssClasses={["notif-summary"]} />
                        <label label={n.body} truncate halign={Gtk.Align.START} cssClasses={["notif-body"]} />
                    </box>
                </box>
            )
        })
    }

    // Connect signals
    notifd.connect("notified", update)
    notifd.connect("resolved", update)

    update()

    return (
        <menubutton cssClasses={["notif-btn"]}>
            <box spacing={4}>
                <image iconName="notifications-symbolic" />
                {badgeLabel}
            </box>
            <popover>
                <box orientation={Gtk.Orientation.VERTICAL} spacing={8} cssClasses={["notif-panel"]}>
                    <box spacing={20}>
                        <label label="Notificaciones" cssClasses={["notif-title"]} hexpand halign={Gtk.Align.START} />
                        <button onClicked={() => notifd.get_notifications().forEach(n => n.dismiss())}>
                            <label label="Limpiar todo" />
                        </button>
                    </box>
                    <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["divider"]} />
                    <Gtk.ScrolledWindow heightRequest={300}>
                        {list}
                    </Gtk.ScrolledWindow>
                </box>
            </popover>
        </menubutton>
    )
}
