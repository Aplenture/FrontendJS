/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Clipboard } from "../core/clipboard";
import { ViewController } from "../core/viewController";
import { Label } from "../views";
import { BodyViewController } from "./bodyViewController";
import { StackViewController } from "./stackViewController";

const DEFAULT_DURATION_NOTIFICATION = 3 * CoreJS.Milliseconds.Second;

interface Notification {
    readonly text: string;
    readonly title?: string;
    readonly duration?: number;
    readonly important?: boolean;
}

export class NotificationViewController extends ViewController {
    private readonly notifications = new CoreJS.Fifo<Notification>();

    private stackViewController: StackViewController;
    private currentNotification: Notification = null;

    constructor(...classes: readonly string[]) {
        super(...classes, 'notification-view-controller');
    }

    public async load() {
        this.view.isVisible = false;
        this.stackViewController = new StackViewController();

        this.appendChild(this.stackViewController);

        this.stackViewController.onPush.on(() => this.view.isVisible = true);
        this.stackViewController.onPop.on(() => 0 == this.stackViewController.children.length && (this.view.isVisible = false));

        Clipboard.onCopy.on(key => this.pushNotification({ text: CoreJS.Localization.translate('#_clipboard_copy_text', { '$1': key }), title: '#_clipboard_copy_title' }));

        await super.load();
    }

    public async pushNotification(notification: Notification): Promise<void> {
        this.notifications.push(notification);

        if (!this.currentNotification || !this.currentNotification.important)
            this.next();
    }

    public pushError(error: Error, title = '#_error', duration?: number): Promise<void> {
        return this.pushNotification({ text: error.message, title, duration, important: true });
    }

    private async next() {
        this.currentNotification = this.notifications.pop();

        if (!this.currentNotification) {
            await this.stackViewController.popViewController();
            return;
        }

        const viewController = new BodyViewController('notification-body-view-controller');
        const textLabel = new Label('text');

        viewController.titleBar.title = this.currentNotification.title;
        viewController.footerBar.isHidden = true;
        viewController.contentView.appendChild(textLabel);
        viewController.load();

        textLabel.text = this.currentNotification.text;

        await this.stackViewController.popViewController();

        this.stackViewController.pushViewController(viewController);

        await CoreJS.sleep(this.currentNotification.duration || DEFAULT_DURATION_NOTIFICATION);

        this.next();
    }
}