/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { JSONRequest } from "../requests";
import { NotificationViewController, PopupViewController } from "../controllers";
import { ViewController } from "./viewController";
import { Config } from "./config";
import { Router } from "./router";
import { ClientPreparer, Module } from "../interfaces";

const PARAMETER_DEBUG = 'debug';

const DEFAULT_LOCALIZATION_PATH = '/localization';

export abstract class Client {
    public static readonly onResize = new CoreJS.Event<void, void>('Client.onResize');

    public static readonly viewController = new ViewController('root-view-controller');
    public static readonly popupViewController = new PopupViewController('root-popup-view-controller');
    public static readonly notificationViewController = new NotificationViewController('root-notification-view-controller');

    private static _initialized = false;
    private static _modules: readonly Module<ClientPreparer, void>[];
    
    public static get title(): string { return document.title; }
    public static set title(value: string) { document.title = value; }

    public static get isInitialized(): boolean { return this._initialized; }

    public static get language(): string { return window.navigator.language; }

    public static get width(): number { return window.innerWidth; }
    public static get height(): number { return window.innerHeight; }

    public static get config(): Config { return window['Config']; }
    public static get debug(): boolean { return this.config.get(PARAMETER_DEBUG); }

    public static async init(rootViewController: ViewController, options: NodeJS.ReadOnlyDict<any>, ...modules: Module<ClientPreparer, void>[]) {
        if (this._initialized)
            throw new Error('Client is already initialized');

        const config = new Config();

        this._initialized = true;
        this._modules = Object.assign([
            Router,
            this.viewController
        ], modules);

        await this.loadTranslations(options.localizationPath);

        this.viewController.appendChild(rootViewController);
        this.viewController.appendChild(this.popupViewController);
        this.viewController.appendChild(this.notificationViewController);

        this.appendViewController(this.viewController);

        window.addEventListener('resize', () => this.onResize.emit());
        window.addEventListener('unhandledrejection', event => this._initialized
            ? this.popupViewController.pushError(event.reason || '#_something_went_wrong')
            : window.alert(CoreJS.Localization.translate(event.reason.message || '#_something_went_wrong'))
        );

        config.add(new CoreJS.BoolParameter(PARAMETER_DEBUG, 'enables/disables debug mode', false));

        await Promise.all(this._modules.map(module => module.prepare(config)));

        if (options)
            config.deserialize(options);

        config.load();

        window['Client'] = this;
        window['Config'] = config;

        CoreJS.Event.onEmit.on((args, sender) => this.debug && console.log(sender.name, args));
        CoreJS.Localization.onMissingTranslation.on(key => this.debug && console.warn(`missing translation for key '${key}'`));

        // wait until window is loaded
        if (document.readyState !== 'complete')
            await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));

        await Promise.all(this._modules.map(module => module.init()));
        await Promise.all(this._modules.map(module => module.load()));
        await Promise.all(this._modules.map(module => module.loaded()));
    }

    private static appendViewController(viewController: ViewController) {
        document.body.appendChild((viewController.view as any).div);
    }

    private static async loadTranslations(path = DEFAULT_LOCALIZATION_PATH): Promise<void> {
        if ('/' != path[path.length])
            path += '/';

        let localization: any;

        try {
            localization = await new JSONRequest<void, NodeJS.ReadOnlyDict<string>>(path + window.navigator.language + '.json').send();
            CoreJS.Localization.language = window.navigator.language;
        } catch (error) {
            localization = await new JSONRequest<void, NodeJS.ReadOnlyDict<string>>(path + 'en.json').send();
            CoreJS.Localization.language = 'en';
        }

        CoreJS.Localization.load(localization);
    }
}