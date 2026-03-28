import puppeteer from "puppeteer";
import { sleep } from "./utils.js";
import type { SerialPort } from "serialport";
import { initModem, listPorts } from "./modem.js";
var modem: SerialPort | null = null
async function setUpModem() {
    let ports = await listPorts()
    let port = ports.find((el) => (el.serialNumber?.trim().includes("6&1C0D8132&") && el.serialNumber?.trim().includes("&0002")));
    // let port = ports.find((el) => el.serialNumber === "6&1C0D8132&1&0000");
    if (port) {
        modem = await initModem(port.path, {
            baudRate: 9600,
        })
    } else {
        throw "Failed initializing port";
    }
}

async function start() {
    await setUpModem();
    let headless = false;
    let phoneNumber = "718096534"
    let browser: puppeteer.Browser | null = null;
    for (let i = 0; i < 5; i++) {
        try {
            browser = await puppeteer.launch({
                headless: headless

            })
            break;
        } catch (err) {
            console.error(err)
        }
        await sleep(500)
    }
    if (browser) {
        try {
            let page = await browser.newPage({

            })
            await page.goto("https://portal.sasakonnect.net/", {
                waitUntil: "networkidle2"
            })
            let pageUrl = (await page.evaluate("document.location.href") as any) as string
            if (pageUrl.toLowerCase().endsWith("login")) {

                // await page.evaluate(`document.querySelector('input[maxLength="9"]').value="${phoneNumber}"`)
                await page.type('input[maxLength="9"]', phoneNumber, { delay: 50 });
                await page.evaluate(`document.querySelector('a[class*="btn-primary"] , a[aria-label="login"]').click()`)

            }

        } catch (err) {
            console.error(err)
        }
        await browser.close();
    }
    if (modem) {
        modem.close()
    }

}
start()