import { Gtk } from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"

const hypr = Hyprland.get_default()

export default function Workspaces() {
    const list = <box spacing={8} cssClasses={["workspaces"]} /> as Gtk.Box

    const update = () => {
        while (list.get_first_child()) {
            list.remove(list.get_first_child()!)
        }

        const current = hypr.focusedWorkspace.id
        const count = Math.max(5, current)

        for (let i = 1; i <= count; i++) {
            const dot = <box cssClasses={["dot"]} /> as Gtk.Box;
            dot.set_size_request(6, 10); // ancho, alto del punto interno

            const btn = <button
                cssClasses={["ws-dot", current === i ? "active" : ""]}
                onClicked={() => hypr.dispatch("workspace", String(i))}
            >
                {dot}
            </button> as Gtk.Button;

            btn.set_margin_top(9);
            btn.set_margin_bottom(9);
            btn.set_margin_start(0);
            btn.set_margin_end(0);

            btn.set_size_request(12, 12);

            list.append(btn);
        }

    }

    hypr.connect("notify::focused-workspace", update)
    update()
    return list
}