/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { BodyViewController } from "../../controllers";
import { Client } from "../../core";
import { Account } from "../models";

export class LogoutViewController extends BodyViewController {
    constructor(public account: Account, ...classes: string[]) {
        super(...classes, 'logout-view-controller');

        this.title = '#_logout';
    }

    public focus() {
        Client.popupViewController.queryBoolean('#_do_you_want_to_logout', '#_logout')
            .then(result => result && this.account.logout());
    }
}