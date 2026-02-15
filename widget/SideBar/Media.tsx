import { Gtk } from "ags/gtk4"
import Mpris from "gi://AstalMpris"

const mpris = Mpris.get_default()

// Visualizador minimalista para el centro del sidebar
export function MediaVisualizer() {
    const container = (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            cssClasses={["media-visualizer"]}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            vexpand
        />
    ) as Gtk.Box

    const update = () => {
        while (container.get_first_child()) container.remove(container.get_first_child()!)

        const player = mpris.players[0]
        if (!player) {
            container.visible = false
            return
        }

        container.visible = true

        // Barras de visualización simples (estáticas, animadas por CSS)
        const barsBox = new Gtk.Box({ spacing: 2, halign: Gtk.Align.CENTER })
        barsBox.add_css_class("vis-bars")
        for (let i = 0; i < 5; i++) {
            const bar = new Gtk.Box()
            bar.add_css_class("vis-bar")
            bar.add_css_class(`vis-bar-${i}`)
            bar.set_size_request(3, 10 + Math.random() * 15)
            barsBox.append(bar)
        }
        container.append(barsBox)
    }

    mpris.connect("notify::players", update)
    update()
    return container
}

// Controles de reproducción para la parte inferior del sidebar
export function MediaControls() {
    const container = (
        <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["media-controls"]} spacing={6} />
    ) as Gtk.Box

    const update = () => {
        while (container.get_first_child()) container.remove(container.get_first_child()!)

        const player = mpris.players[0]
        if (!player) {
            container.visible = false
            return
        }

        container.visible = true

        // Título de canción
        const titleLabel = new Gtk.Label({
            label: player.title || "Sin título",
            halign: Gtk.Align.CENTER,
            ellipsize: 3,
            maxWidthChars: 12,
        })
        titleLabel.add_css_class("media-title")
        container.append(titleLabel)

        // Controles
        const controls = new Gtk.Box({ spacing: 8, halign: Gtk.Align.CENTER })

        const prevBtn = new Gtk.Button()
        prevBtn.set_child(new Gtk.Image({ iconName: "media-skip-backward-symbolic" }))
        prevBtn.connect("clicked", () => player.previous())

        const playBtn = new Gtk.Button()
        playBtn.set_child(new Gtk.Image({
            iconName: player.playbackStatus === Mpris.PlaybackStatus.PLAYING
                ? "media-playback-pause-symbolic"
                : "media-playback-start-symbolic"
        }))
        playBtn.connect("clicked", () => player.play_pause())

        const nextBtn = new Gtk.Button()
        nextBtn.set_child(new Gtk.Image({ iconName: "media-skip-forward-symbolic" }))
        nextBtn.connect("clicked", () => player.next())

        controls.append(prevBtn)
        controls.append(playBtn)
        controls.append(nextBtn)
        container.append(controls)
    }

    mpris.connect("notify::players", update)
    mpris.players.forEach((p: any) => {
        p.connect("notify::playback-status", update)
        p.connect("notify::title", update)
    })
    update()

    return container
}
