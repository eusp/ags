import { Gtk } from "ags/gtk4"
import Wp from "gi://AstalWp"
import { MenuPopover } from "../Shared/MenuPopover"

const wp = Wp.get_default()

export default function Microphone() {
    const mic = wp?.defaultMicrophone
    if (!mic) return <box />

    const icon = <image /> as Gtk.Image
    const menubutton = new Gtk.MenuButton()
    menubutton.set_child(icon)

    const slider = (
        <slider
            widthRequest={200}
            cssClasses={["mic-slider"]}
            value={mic.volume}
            onChangeValue={({ value }) => mic.set_volume(value)}
        />
    ) as Gtk.Scale

    const update = () => {
        icon.iconName = mic.mute
            ? "microphone-disabled-symbolic"
            : "audio-input-microphone-symbolic"
        slider.value = mic.volume

        if (!menubutton.get_popover()) {
            const popover = MenuPopover(null, [
                {
                    title: "Micrófono",
                    customChild: slider
                },
                {
                    items: [{
                        label: mic.mute ? "Activar" : "Silenciar",
                        icon: "microphone-sensitivity-medium-symbolic",
                        onClick: () => mic.set_mute(!mic.mute)
                    }]
                }
            ])
            menubutton.set_popover(popover)
        }
    }

    mic.connect("notify::volume", () => {
        slider.value = mic.volume
    })

    mic.connect("notify::mute", () => {
        menubutton.set_popover(null!)
        update()
    })

    update()

    return menubutton
}
