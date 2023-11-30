import { expect, test } from '@playwright/test';
import ArcadePage from "../../src/mods/arcade/arcade_page";

test("chess game should be created from arcade", async ({ page }) => {
    // console.log(page, "page")
    let arcade = new ArcadePage(page);
    await arcade.goto();
    await arcade.createChessGame();
});
