/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { BodyViewController } from "../../controllers";
import { Access, Account } from "../models";
import { Button, TitledLabel } from "../../views";
import { ButtonType, TitledLabelType } from "../../enums";
import { Client } from "../../core";

export class AccessViewController extends BodyViewController {
    public readonly onAccessUpdated = new CoreJS.Event<AccessViewController, Access>('AccessViewController.onAccessUpdated');
    public readonly onAccessDeleted = new CoreJS.Event<AccessViewController, Access>('AccessViewController.onAccessDeleted');

    public readonly apiLabel = new TitledLabel('api-label');
    public readonly secretLabel = new TitledLabel('secret-label');
    public readonly expirationLabel = new TitledLabel('expiration-label');

    public readonly updateButton = new Button('update-button');
    public readonly deleteButton = new Button('delete-button');

    public access: Access;

    constructor(public readonly account: Account, ...classes: string[]) {
        super(...classes, 'access-view-controller');

        this.title = '#_api';

        this.contentView.appendChild(this.apiLabel);
        this.contentView.appendChild(this.secretLabel);
        this.contentView.appendChild(this.expirationLabel);

        this.footerBar.appendChild(this.deleteButton);
        this.footerBar.appendChild(this.updateButton);

        this.updateButton.text = '#_update';
        this.updateButton.isHidden = true;
        this.updateButton.tabIndex = 1;
        this.updateButton.onClick.on(() => this.update());

        this.deleteButton.type = ButtonType.Delete;
        this.deleteButton.tabIndex = 2;
        this.deleteButton.onClick.on(() => this.delete());

        this.apiLabel.title = '#_api_key';
        this.expirationLabel.title = '#_expiration_date';

        this.secretLabel.type = TitledLabelType.Password;
        this.secretLabel.title = '#_secret_key';
    }

    public focus() {
        this.updateButton.focus();
    }

    public async load(): Promise<void> {
        if (!this.access)
            throw new Error('access is not set');

        this.apiLabel.text = this.access.api;
        this.apiLabel.copyButton.isVisible = true;

        this.secretLabel.text = this.access.secret || '***';
        this.secretLabel.exposeButton.isDisabled = !this.access.secret;
        this.secretLabel.copyButton.isDisabled = !this.access.secret;
        this.secretLabel.copyButton.isVisible = true;
        this.secretLabel.isExposed = false;

        this.expirationLabel.text = CoreJS.formatTime("YYYY-MM-DD hh:mm", new Date(this.access.expiration));
        this.expirationLabel.isHidden = !this.access.expiration;

        this.titleBar.title = this.access.api == this.account.access.api
            ? '#_session_current'
            : this.access.label;

        this.deleteButton.isEnabled = this.access.api != this.account.access.api;

        await super.load();
    }

    public async update() { }

    public async delete(): Promise<boolean> {
        if (!await Client.popupViewController.queryBoolean('#_api_delete_query', '#_api_delete_title'))
            return;

        try {
            const result = await this.account.deleteAccess(this.access);

            this.removeFromParent();
            this.onAccessDeleted.emit(this, this.access);

            Client.notificationViewController.pushNotification({ text: '#_api_delete_text', title: '#_api_delete_title' });

            return result;
        } catch (error) {
            Client.popupViewController.pushError(error);
            return false;
        }
    }
}