import Apps from "gi://AstalApps"
const apps = new Apps.Apps()
const app = apps.list.find(a => a.name.toLowerCase().includes("firefox") || a.name.toLowerCase().includes("chrome") || a.name.toLowerCase().includes("terminal"))
if (app) {
    console.log(`App: ${app.name}`)
    // @ts-ignore
    if (app.app_actions) {
        // @ts-ignore
        console.log(`Actions: ${app.app_actions.length}`)
        // @ts-ignore
        app.app_actions.forEach(a => console.log(` - ${a.name} (${a.action_id})`))
    } else {
        console.log("No app_actions property")
    }
} else {
    console.log("No app found for testing")
}
process.exit(0)
