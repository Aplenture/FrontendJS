/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { BodyViewController } from "../../controllers";
import { Client } from "../../core";
import { Button, TextField, TextFieldType } from "../../views";
import { Account } from "../models";

export class PasswordViewController extends BodyViewController {
    public readonly currentPasswordTextField = new TextField('current-password');
    public readonly newPasswordTextField = new TextField('new-password');
    public readonly repeatPasswordTextField = new TextField('repeat-password');

    public readonly changePasswordButton = new Button('change-password');

    constructor(public account: Account, ...classes: string[]) {
        super(...classes, 'password-view-controller');

        this.title = '#_password';

        this.contentView.appendChild(this.currentPasswordTextField);
        this.contentView.appendChild(this.newPasswordTextField);
        this.contentView.appendChild(this.repeatPasswordTextField);

        this.footerBar.appendChild(this.changePasswordButton);

        this.titleBar.title = '#_change_password';
        this.changePasswordButton.text = '#_change_password';

        this.currentPasswordTextField.title = '#_current_password';
        this.currentPasswordTextField.type = TextFieldType.Password;

        this.newPasswordTextField.title = '#_new_password';
        this.newPasswordTextField.type = TextFieldType.Password;

        this.repeatPasswordTextField.title = '#_repeat_password';
        this.repeatPasswordTextField.type = TextFieldType.Password;

        this.changePasswordButton.onClick.on(() => this.changePassword());
        this.currentPasswordTextField.onEnterKey.on(() => this.changePassword());
        this.newPasswordTextField.onEnterKey.on(() => this.changePassword());
        this.repeatPasswordTextField.onEnterKey.on(() => this.changePassword());
    }

    public async load(): Promise<void> {
        this.clear();

        await super.load();
    }

    public focus(): void {
        this.currentPasswordTextField.focus();
    }

    public clear() {
        this.currentPasswordTextField.value = '';
        this.newPasswordTextField.value = '';
        this.repeatPasswordTextField.value = '';
    }

    public async changePassword() {
        if (!this.currentPasswordTextField.value) {
            await Client.popupViewController.pushMessage('#_current_password_not_set', '#_change_password');
            this.currentPasswordTextField.focus();
            return;
        }

        if (!this.newPasswordTextField.value) {
            await Client.popupViewController.pushMessage('#_new_password_not_set', '#_change_password');
            this.newPasswordTextField.focus();
            return;
        }

        if (!this.repeatPasswordTextField.value) {
            await Client.popupViewController.pushMessage('#_repeat_password_not_set', '#_change_password');
            this.repeatPasswordTextField.focus();
            return;
        }

        if (this.newPasswordTextField.value != this.repeatPasswordTextField.value) {
            await Client.popupViewController.pushMessage('#_repeat_password_not_matching', '#_change_password');
            this.repeatPasswordTextField.value = '';
            this.repeatPasswordTextField.focus();
            return;
        }

        if (await this.account.changePassword(this.currentPasswordTextField.value, this.newPasswordTextField.value)) {
            await Client.popupViewController.pushMessage('#_password_changed', '#_change_password');
            this.clear();
            this.focus();
        }
    }
}