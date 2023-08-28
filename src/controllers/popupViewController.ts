/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import { View } from "../core/view";
import { ViewController } from "../core/viewController";
import { Button, Label, TextField, TextFieldType } from "../views";
import { BodyViewController, StackViewController } from ".";
import { ButtonType } from "../enums";

export class PopupViewController extends ViewController {
    public stackViewController: StackViewController;
    public closeButton: View;

    constructor(...classes: readonly string[]) {
        super(...classes, 'popup-view-controller');
    }

    public async load() {
        const closeButtonContainer = new View('close-button-container');

        this.view.isVisible = false;
        this.stackViewController = new StackViewController();
        this.closeButton = new View('close');

        closeButtonContainer.appendChild(this.closeButton);

        this.appendChild(this.stackViewController);

        this.stackViewController.view.propaginateClickEvents = false;
        this.stackViewController.view.propaginateKeyEvents = false;
        this.stackViewController.view.appendChild(closeButtonContainer);
        this.stackViewController.view.onEscapeKey.on(() => this.popViewController());

        this.closeButton.propaginateClickEvents = false;
        this.closeButton.isClickable = true;
        this.closeButton.onClick.on(() => this.stackViewController.popViewController());

        this.stackViewController.onPush.on(() => this.view.isVisible = true);
        this.stackViewController.onPush.on(() => this.stackViewController.focus());
        this.stackViewController.onPop.on(() => 0 == this.stackViewController.children.length && (this.view.isVisible = false));

        await super.load();
    }

    public pushViewController(next: ViewController): Promise<void> {
        return this.stackViewController.pushViewController(next);
    }

    public popViewController(): Promise<ViewController> {
        return this.stackViewController.popViewController();
    }

    public pushMessage(text: string, title: string): Promise<void> {
        const viewController = new BodyViewController('message-view-controller');

        const textLabel = new Label('text');
        const doneButton = new Button('done');

        viewController.titleBar.title = title;
        viewController.contentView.appendChild(textLabel);
        viewController.footerBar.appendChild(doneButton);
        viewController.view.propaginateKeyEvents = false;

        textLabel.text = text;

        doneButton.text = '#_ok';
        doneButton.tabIndex = 1;

        doneButton.onEnterKey.on(() => this.popViewController());
        doneButton.onEscapeKey.on(() => this.popViewController());
        doneButton.onClick.on(() => this.popViewController());

        return this.pushViewController(viewController);
    }

    public queryBoolean(text: string, title: string): Promise<boolean> {
        const viewController = new BodyViewController('message');

        const textLabel = new Label('text');
        const yesButton = new Button('yes');
        const noButton = new Button('no');

        let value: boolean;

        viewController.titleBar.title = title;
        viewController.contentView.appendChild(textLabel);
        viewController.footerBar.appendChild(noButton);
        viewController.footerBar.appendChild(yesButton);
        viewController.view.propaginateKeyEvents = false;

        textLabel.text = text;

        yesButton.text = '#_yes';
        yesButton.tabIndex = 1;

        noButton.type = ButtonType.Cancel;
        noButton.text = '#_no';
        noButton.tabIndex = 2;

        yesButton.onEnterKey.on(() => (value = true) && this.popViewController());
        yesButton.onEscapeKey.on(() => (value = false) || this.popViewController());
        yesButton.onClick.on(() => (value = true) && this.popViewController());

        noButton.onEnterKey.on(() => (value = false) || this.popViewController());
        noButton.onEscapeKey.on(() => (value = false) || this.popViewController());
        noButton.onClick.on(() => (value = false) || this.popViewController());

        return this.pushViewController(viewController).then(() => value);
    }

    public queryString(text: string, title: string): Promise<string> {
        const viewController = new BodyViewController('message');

        const textLabel = new Label('text');
        const textField = new TextField();
        const okButton = new Button('ok');
        const cancelButton = new Button('cancel');

        let value: string;

        viewController.titleBar.title = title;
        viewController.contentView.appendChild(textLabel);
        viewController.contentView.appendChild(textField);
        viewController.footerBar.appendChild(cancelButton);
        viewController.footerBar.appendChild(okButton);
        viewController.view.propaginateKeyEvents = false;

        textLabel.text = text;

        okButton.text = '#_ok';
        okButton.tabIndex = 1;
        okButton.isDisabled = true;

        cancelButton.type = ButtonType.Cancel;
        cancelButton.tabIndex = 2;

        textField.isTitleHidden = true;
        textField.onEnterKey.on(() => textField.value && (value = textField.value) && this.popViewController());
        textField.onEscapeKey.on(() => (value = null) || this.popViewController());
        textField.onChange.on(() => okButton.isDisabled = !textField.value);

        okButton.onEnterKey.on(() => textField.value && (value = textField.value) && this.popViewController());
        okButton.onEscapeKey.on(() => (value = null) || this.popViewController());
        okButton.onClick.on(() => textField.value && (value = textField.value) && this.popViewController());

        cancelButton.onEnterKey.on(() => (value = null) || this.popViewController());
        cancelButton.onEscapeKey.on(() => (value = null) || this.popViewController());
        cancelButton.onClick.on(() => (value = null) || this.popViewController());

        return this.pushViewController(viewController).then(() => value);
    }

    public queryPassword(text: string, title: string): Promise<string> {
        const viewController = new BodyViewController('message');

        const textLabel = new Label('text');
        const textField = new TextField();
        const okButton = new Button('ok');
        const cancelButton = new Button('cancel');

        let value: string;

        viewController.titleBar.title = title;
        viewController.contentView.appendChild(textLabel);
        viewController.contentView.appendChild(textField);
        viewController.footerBar.appendChild(cancelButton);
        viewController.footerBar.appendChild(okButton);
        viewController.view.propaginateKeyEvents = false;

        textLabel.text = text;

        okButton.text = '#_ok';
        okButton.tabIndex = 1;
        okButton.isDisabled = true;

        cancelButton.type = ButtonType.Cancel;
        cancelButton.tabIndex = 2;

        textField.type = TextFieldType.Password;
        textField.isTitleHidden = true;
        textField.onEnterKey.on(() => textField.value && (value = textField.value) && this.popViewController());
        textField.onEscapeKey.on(() => (value = null) || this.popViewController());
        textField.onChange.on(() => okButton.isDisabled = !textField.value);

        okButton.onEnterKey.on(() => textField.value && (value = textField.value) && this.popViewController());
        okButton.onEscapeKey.on(() => (value = null) || this.popViewController());
        okButton.onClick.on(() => textField.value && (value = textField.value) && this.popViewController());

        cancelButton.onEnterKey.on(() => (value = null) || this.popViewController());
        cancelButton.onEscapeKey.on(() => (value = null) || this.popViewController());
        cancelButton.onClick.on(() => (value = null) || this.popViewController());

        return this.pushViewController(viewController).then(() => value);
    }

    public queryNumber(text: string, title: string): Promise<number> {
        const viewController = new BodyViewController('message');

        const textLabel = new Label('text');
        const textField = new TextField();
        const okButton = new Button('ok');
        const cancelButton = new Button('cancel');

        let value: number;

        viewController.titleBar.title = title;
        viewController.contentView.appendChild(textLabel);
        viewController.contentView.appendChild(textField);
        viewController.footerBar.appendChild(cancelButton);
        viewController.footerBar.appendChild(okButton);
        viewController.view.propaginateKeyEvents = false;

        textLabel.text = text;

        okButton.text = '#_ok';
        okButton.tabIndex = 1;
        okButton.isDisabled = true;

        cancelButton.type = ButtonType.Cancel;
        cancelButton.tabIndex = 2;

        textField.type = TextFieldType.Number;
        textField.isTitleHidden = true;
        textField.onEnterKey.on(() => textField.value && (value = textField.numberValue) && this.popViewController());
        textField.onEscapeKey.on(() => (value = null) || this.popViewController());
        textField.onChange.on(() => okButton.isDisabled = !textField.value);

        okButton.onEnterKey.on(() => textField.value && (value = textField.numberValue) && this.popViewController());
        okButton.onEscapeKey.on(() => (value = null) || this.popViewController());
        okButton.onClick.on(() => textField.value && (value = textField.numberValue) && this.popViewController());

        cancelButton.onEnterKey.on(() => (value = null) || this.popViewController());
        cancelButton.onEscapeKey.on(() => (value = null) || this.popViewController());
        cancelButton.onClick.on(() => (value = null) || this.popViewController());

        return this.pushViewController(viewController).then(() => value);
    }

    public queryCurrency(text: string, title: string): Promise<number> {
        const viewController = new BodyViewController('message');

        const textLabel = new Label('text');
        const textField = new TextField();
        const okButton = new Button('ok');
        const cancelButton = new Button('cancel');

        let value: number;

        viewController.titleBar.title = title;
        viewController.contentView.appendChild(textLabel);
        viewController.contentView.appendChild(textField);
        viewController.footerBar.appendChild(cancelButton);
        viewController.footerBar.appendChild(okButton);
        viewController.view.propaginateKeyEvents = false;

        textLabel.text = text;

        textField.selectRange(0, 0);

        okButton.text = '#_ok';
        okButton.tabIndex = 1;
        okButton.isDisabled = true;

        cancelButton.type = ButtonType.Cancel;
        cancelButton.tabIndex = 2;

        textField.type = TextFieldType.Currency;
        textField.isTitleHidden = true;
        textField.onEnterKey.on(() => textField.value && (value = textField.numberValue) && this.popViewController());
        textField.onEscapeKey.on(() => (value = null) || this.popViewController());
        textField.onChange.on(() => okButton.isDisabled = !textField.value);

        okButton.onEnterKey.on(() => textField.value && (value = textField.numberValue) && this.popViewController());
        okButton.onEscapeKey.on(() => (value = null) || this.popViewController());
        okButton.onClick.on(() => textField.value && (value = textField.numberValue) && this.popViewController());

        cancelButton.onEnterKey.on(() => (value = null) || this.popViewController());
        cancelButton.onEscapeKey.on(() => (value = null) || this.popViewController());
        cancelButton.onClick.on(() => (value = null) || this.popViewController());

        return this.pushViewController(viewController).then(() => value);
    }

    public pushError(error: Error, title = '#_error'): Promise<void> {
        return this.pushMessage(error.message, title);
    }
}