import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to the local HTML file
        file_path = os.path.abspath("jules-scratch/verification/convert.html")
        await page.goto(f"file://{file_path}")

        # Wait for the loading screen to disappear
        await page.wait_for_selector("#loading-screen", state="hidden")

        # Input a sample VLESS link
        vless_link = "vless://a-uuid-goes-here@example.com:443?encryption=none&security=tls&type=ws&host=example.com&path=%2F#My-VLESS-Config"
        await page.fill("#link-input", vless_link)

        # Click the convert button
        await page.click("#convert-button")

        # Wait for the result to appear
        await page.wait_for_selector("#result-output:not(:empty)")

        # Take a screenshot
        await page.screenshot(path="jules-scratch/verification/converter_verification.png")

        await browser.close()

asyncio.run(main())