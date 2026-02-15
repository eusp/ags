import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"

function readFile(path: string): string {
    try {
        const [ok, contents] = GLib.file_get_contents(path)
        if (ok && contents) {
            return new TextDecoder().decode(contents)
        }
    } catch { }
    return ""
}

function getCpuUsage(): string {
    try {
        const lines = readFile("/proc/stat")
        const cpu = lines.split("\n")[0].split(/\s+/).slice(1).map(Number)
        const idle = cpu[3]
        const total = cpu.reduce((a, b) => a + b, 0)
        const usage = ((1 - idle / total) * 100).toFixed(0)
        return `${usage}%`
    } catch {
        return "N/A"
    }
}

function getMemUsage(): string {
    try {
        const lines = readFile("/proc/meminfo")
        const total = parseInt(lines.match(/MemTotal:\s+(\d+)/)?.[1] || "0")
        const available = parseInt(lines.match(/MemAvailable:\s+(\d+)/)?.[1] || "0")
        const used = total - available
        const usedMB = (used / 1024).toFixed(0)
        const totalMB = (total / 1024).toFixed(0)
        const pct = ((used / total) * 100).toFixed(0)
        return `${usedMB}/${totalMB} MB (${pct}%)`
    } catch {
        return "N/A"
    }
}

export default function SystemMonitor() {
    const cpuLabel = new Gtk.Label({ xalign: 0 })
    const memLabel = new Gtk.Label({ xalign: 0 })

    cpuLabel.add_css_class("sysmon-label")
    memLabel.add_css_class("sysmon-label")

    const popoverBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 8 })
    popoverBox.add_css_class("sysmon-popover")

    const title = new Gtk.Label({ label: "Rendimiento", halign: Gtk.Align.START })
    title.add_css_class("popover-title")
    popoverBox.append(title)
    popoverBox.append(new Gtk.Box({ cssClasses: ["divider"] }))

    const cpuRow = new Gtk.Box({ spacing: 8 })
    cpuRow.append(new Gtk.Image({ iconName: "computer-symbolic" }))
    cpuRow.append(new Gtk.Label({ label: "CPU:" }))
    cpuRow.append(cpuLabel)
    popoverBox.append(cpuRow)

    const memRow = new Gtk.Box({ spacing: 8 })
    memRow.append(new Gtk.Image({ iconName: "drive-harddisk-symbolic" }))
    memRow.append(new Gtk.Label({ label: "RAM:" }))
    memRow.append(memLabel)
    popoverBox.append(memRow)

    const update = () => {
        cpuLabel.label = getCpuUsage()
        memLabel.label = getMemUsage()
    }

    const popover = new Gtk.Popover()
    popover.set_child(popoverBox)

    // Update while popover is visible
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
        if (popover.visible) update()
        return GLib.SOURCE_CONTINUE
    })
    popover.connect("notify::visible", () => {
        if (popover.visible) update()
    })

    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(new Gtk.Image({ iconName: "utilities-system-monitor-symbolic" }))
    menubutton.set_popover(popover)

    return menubutton
}
