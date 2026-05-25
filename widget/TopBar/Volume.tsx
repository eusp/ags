import { Gtk } from "ags/gtk4"
import Wp from "gi://AstalWp"
import { MenuPopover } from "../Shared/MenuPopover"

const wp = Wp.get_default()

export default function Volume() {
    const speaker = wp?.defaultSpeaker
    if (!speaker) return new Gtk.Box()

    const icon = new Gtk.Image()
    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(icon)

    const slider = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        drawValue: false,
        hexpand: true,
        adjustment: new Gtk.Adjustment({ lower: 0, upper: 1, stepIncrement: 0.05 })
    })
    slider.set_size_request(200, -1)
    slider.add_css_class("volume-slider")

    slider.connect("value-changed", () => {
        speaker.set_volume(slider.get_value())
    })

    const popover = MenuPopover(menubutton, [
        {
            title: "Volumen",
            customChild: slider
        }
    ])
    menubutton.set_popover(popover)

    const update = () => {
        icon.iconName = speaker.volumeIcon
        // Bloquear señales temporalmente evita bucles infinitos de feedback de eventos de cambio de volumen
        slider.set_value(speaker.volume)
    }

    speaker.connect("notify::volume", update)
    speaker.connect("notify::mute", update)

    update()

    return menubutton
}