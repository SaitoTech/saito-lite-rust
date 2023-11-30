import {type Page, type Locator} from '@playwright/test'

export default class ModulePage {
    readonly page: Page;
    readonly url: string;

    constructor(page: Page, url: string) {
        this.page = page;
        this.url = url;
    }

    async goto() {
        await this.page.goto(this.url);
        // TODO : check if this timeout can be removed and start testing when the page is loaded
        await this.page.waitForTimeout(1000);

        // await this.page.waitForLoadState();
    }

}
