import { Gtk } from "ags/gtk4"
import Wp from "gi://AstalWp"
import { MenuPopover } from "../Shared/MenuPopover"

const wp = Wp.get_default()

export default function Volume() {
    const speaker = wp?.defaultSpeaker
    if (!speaker) return <box />

    const icon = <image /> as Gtk.Image
    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(icon)

    const slider = (
        <slider
            widthRequest={200}
            cssClasses={["volume-slider"]}
            value={speaker.volume}
            onChangeValue={({ value }) => speaker.set_volume(value)}
        />
    ) as Gtk.Scale

    // Create the popover ONCE
    const popover = MenuPopover(null, [
        {
            title: "Volumen",
            customChild: slider
        }
    ])
    menubutton.set_popover(popover)

    const update = () => {
        icon.iconName = speaker.volumeIcon
        slider.value = speaker.volume
    }

    speaker.connect("notify::volume", update)
    speaker.connect("notify::mute", update)

    // Initial sync
    update()

    return menubutton
}
