/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { BodyViewController } from "../../controllers";
import { Client } from "../../core";
import { Button, Switch, TextField, TextFieldType } from "../../views";
import { Account } from "../models";

export class LoginViewController extends BodyViewController {
    public readonly loginButton = new Button('login');

    public readonly usernameTextfield = new TextField('username');
    public readonly passwordTextfield = new TextField('password');

    public readonly keepLoginSwitch = new Switch('keepLogin');

    constructor(public account: Account, ...classes: string[]) {
        super(...classes, 'login-view-controller');

        this.title = '#_login';

        this.contentView.appendChild(this.usernameTextfield);
        this.contentView.appendChild(this.passwordTextfield);
        this.contentView.appendChild(this.keepLoginSwitch);

        this.footerBar.appendChild(this.loginButton);

        this.usernameTextfield.onEnterKey.on(() => this.login());
        this.passwordTextfield.onEnterKey.on(() => this.login());
        this.loginButton.onClick.on(() => this.login());

        this.titleBar.title = '#_login';
        this.loginButton.text = '#_login';

        this.usernameTextfield.title = '#_username';
        this.usernameTextfield.placeholder = '#_username';

        this.passwordTextfield.title = '#_password';
        this.passwordTextfield.placeholder = '#_password';
        this.passwordTextfield.type = TextFieldType.Password;

        this.keepLoginSwitch.title = '#_remember_me';
        this.keepLoginSwitch.description = '#_remember_me_description';
    }

    public focus() {
        this.usernameTextfield.focus();
    }

    public clear() {
        this.usernameTextfield.value = '';
        this.passwordTextfield.value = '';
        this.keepLoginSwitch.isEnabled = false;
    }

    private async login() {
        const username = this.usernameTextfield.value;

        if (!username)
            return await Client.popupViewController
                .pushMessage('#_username_not_set', '#_login')
                .then(() => this.usernameTextfield.focus());

        const password = this.passwordTextfield.value;

        if (!password)
            return await Client.popupViewController
                .pushMessage('#_password_not_set', '#_login')
                .then(() => this.passwordTextfield.focus());

        const keepLogin = this.keepLoginSwitch.isEnabled;
        const label = navigator.userAgent;

        return this.account
            .login(username, password, { keepLogin, label })
            .then(() => this.clear())
            .then(() => this.removeFromParent())
            .catch(error => Client.popupViewController.pushError(error).then(() => this.focus()));
    }
}