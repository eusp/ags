import { Gtk } from "ags/gtk4"
import Mpris from "gi://AstalMpris"

const mpris = Mpris.get_default()

export function MediaControls() {
    const container = (
        <box orientation={Gtk.Orientation.VERTICAL}
            cssClasses={["media-controls"]}
            spacing={6}
            hexpand={false}
        />
    ) as Gtk.Box

    let currentPlayer: any = null;

    // Keep track of signal handlers to disconnect them
    // Map<Player, Map<SignalName, HandlerID>>
    // Actually, we only track the ONE active player.
    const signals = new Map<string, number>();

    const update = () => {
        // Clear UI
        while (container.get_first_child()) container.remove(container.get_first_child()!)

        const player = mpris.players[0] // Just get the first available player

        // If player changed, manage signals
        if (player !== currentPlayer) {
            // Disconnect from old player
            if (currentPlayer) {
                if (signals.has("playback-status")) currentPlayer.disconnect(signals.get("playback-status")!)
                if (signals.has("title")) currentPlayer.disconnect(signals.get("title")!)
            }

            currentPlayer = player
            signals.clear()

            // Connect to new player if exists
            if (currentPlayer) {
                // Ensure we update when this specific player changes state
                signals.set("playback-status", currentPlayer.connect("notify::playback-status", update))
                signals.set("title", currentPlayer.connect("notify::title", update))
            }
        }

        if (!player) {
            container.visible = false
            return
        }

        container.visible = true

        // Título de canción
        const titleLabel = new Gtk.Label({
            label: player.title || "Sin título",
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
            hexpand: true,
            ellipsize: 3,
            maxWidthChars:15,
        })
        titleLabel.add_css_class("media-title")
        titleLabel.set_size_request(-1, 200) // Mover el size_request aquí
        container.append(titleLabel) // Directamente al container

        // Controles
        const controls = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 8,
            halign: Gtk.Align.CENTER,
        })

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

    // Connect to global Mpris notifications to detect player list changes
    mpris.connect("notify::players", update)

    // Initial call
    update()

    return container
}
