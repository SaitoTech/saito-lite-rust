import {type Page, type Locator, expect} from '@playwright/test'
import ModulePage from "../module_page";

export default class ArcadePage extends ModulePage {

    constructor(page: Page) {
        super(page, "/arcade");
    }

    async openChat() {

    }

    async createChessGame() {
        let chessMenuItem = this.page.locator("#Chess");
        await chessMenuItem.waitFor();
        expect(chessMenuItem).toBeTruthy();
        await chessMenuItem.click();

        let createGameButton = this.page.locator(".saito-multi-select_btn_options", {hasText: "create public invite"});
        await chessMenuItem.waitFor();
        expect(createGameButton).toBeTruthy();
        await createGameButton.click();
    }
}

