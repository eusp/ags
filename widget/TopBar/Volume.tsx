import { Gtk } from "ags/gtk4"
import Wp from "gi://AstalWp"

const wp = Wp.get_default()

export default function Volume() {
    const speaker = wp?.defaultSpeaker
    if (!speaker) return <box />

    const icon = <image /> as Gtk.Image
    const slider = (
        <slider
            widthRequest={200}
            onChangeValue={({ value }) => speaker.set_volume(value)}
        />
    ) as Gtk.Scale

    const update = () => {
        icon.iconName = speaker.volumeIcon
        slider.value = speaker.volume
    }

    speaker.connect("notify::volume", update)
    speaker.connect("notify::mute", update)
    update()

    return (
        <menubutton>
            {icon}
            <popover>
                <box cssClasses={["volume-popover"]}>
                    {slider}
                </box>
            </popover>
        </menubutton>
    )
}
