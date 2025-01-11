const { app, BrowserWindow, session } = require("electron");
const url = require("url");
const path = require("path");

let mainWindow;
let mainWindow2;

async function createWindow() {
    // Import 'electron-store' dynamically
    const { default: Store } = await import('electron-store');
    const store = new Store();

    const windowState = store.get('windowState', { width: 1000, height: 800 });
    // Tạo session duy nhất cho mainWindow2
    const uniqueSession2 = session.fromPartition('persist:unique-session2-' + Date.now());
    if (uniqueSession2) {
        mainWindow2 = new BrowserWindow({
            width: 1000,
            height: 700,
            autoHideMenuBar: true,
            icon: path.join(__dirname, 'public/facebook.256x256.ico'), 
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                session: uniqueSession2,
            },
        });

        mainWindow2.loadFile(path.join(__dirname, 'dist/fake-facebook/browser/index.html'));

        mainWindow2.on("closed", function () {
            if (mainWindow2 && !mainWindow2.isDestroyed()) {
                mainWindow2 = null; // Đảm bảo mainWindow2 được set null sau khi đóng
            }
        });
    } else {
        console.error("Không thể tạo session duy nhất cho mainWindow2");
    }
}

app.on("ready", async () => {
    await createWindow();
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", async function () {
    if (!mainWindow || mainWindow.isDestroyed()) {
        await createWindow();
    }
});
