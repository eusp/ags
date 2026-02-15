import { Gtk } from "ags/gtk4"
import Wp from "gi://AstalWp"

const wp = Wp.get_default()

export default function Microphone() {
    const mic = wp?.defaultMicrophone
    if (!mic) return <box />

    const icon = <image /> as Gtk.Image
    const slider = (
        <slider
            widthRequest={200}
            onChangeValue={({ value }) => mic.set_volume(value)}
        />
    ) as Gtk.Scale

    const muteBtn = new Gtk.Button()
    const muteLabel = new Gtk.Label()
    muteBtn.set_child(muteLabel)
    muteBtn.connect("clicked", () => {
        mic.set_mute(!mic.mute)
    })

    const update = () => {
        icon.iconName = mic.mute
            ? "microphone-disabled-symbolic"
            : "audio-input-microphone-symbolic"
        slider.value = mic.volume
        muteLabel.label = mic.mute ? "Activar" : "Silenciar"
    }

    mic.connect("notify::volume", update)
    mic.connect("notify::mute", update)
    update()

    const popoverBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 8 })
    popoverBox.add_css_class("mic-popover")

    const title = new Gtk.Label({ label: "Micrófono", halign: Gtk.Align.START })
    title.add_css_class("popover-title")
    popoverBox.append(title)
    popoverBox.append(new Gtk.Box({ cssClasses: ["divider"] }))
    popoverBox.append(slider)
    popoverBox.append(muteBtn)

    return (
        <menubutton>
            {icon}
            <popover>
                {popoverBox}
            </popover>
        </menubutton>
    )
}
