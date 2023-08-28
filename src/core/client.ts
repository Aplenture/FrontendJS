/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { JSONRequest } from "../requests";
import { NotificationViewController, PopupViewController } from "../controllers";
import { Router } from "./router";
import { ViewController } from "./viewController";
import { Config } from "./config";

const PARAMETER_DEBUG = 'debug';

const DEFAULT_LOCALIZATION_PATH = '/localization';

interface Options {
    readonly localizationPath?: string;
}

export abstract class Client {
    public static readonly onInit = new CoreJS.Event<void, void>('Client.onInit');
    public static readonly onLoaded = new CoreJS.Event<void, void>('Client.onLoaded');
    public static readonly onResize = new CoreJS.Event<void, void>('Client.onResize');

    public static readonly viewController = new ViewController('root-view-controller');
    public static readonly popupViewController = new PopupViewController('root-popup-view-controller');
    public static readonly notificationViewController = new NotificationViewController('root-notification-view-controller');

    private static _initialized = false;
    private static _loaded = false;
    private static _config: Config;

    public static get title(): string { return document.title; }
    public static set title(value: string) { document.title = value; }

    public static get language(): string { return window.navigator.language; }

    public static get width(): number { return window.innerWidth; }
    public static get height(): number { return window.innerHeight; }

    public static get config(): Config { return this._config; }
    public static get debug(): boolean { return this._config.get(PARAMETER_DEBUG); }

    public static async init(options: Options = {}) {
        if (this._initialized)
            throw new Error('Client is already initialized');

        this._initialized = true;
        this._config = new Config();

        window['Client'] = this;
        window['Config'] = this._config;

        await this.loadTranslations(options.localizationPath);

        this.viewController.appendChild(this.popupViewController);
        this.viewController.appendChild(this.notificationViewController);

        this.appendViewController(this.viewController);

        window.addEventListener('resize', () => this.onResize.emit());
        window.addEventListener('unhandledrejection', event => this._loaded
            ? this.popupViewController.pushError(event.reason || '#_something_went_wrong')
            : window.alert(CoreJS.Localization.translate(event.reason.message || '#_something_went_wrong'))
        );

        this.onInit.on(() => Router.init());
        this.onInit.emit();

        this._config.add(new CoreJS.BoolParameter(PARAMETER_DEBUG, 'enables/disables debug mode', false));
    }

    public static async load(config?: any) {
        if (this._loaded)
            throw new Error('Client is already loaded');

        this._loaded = true;

        if (config)
            this._config.deserialize(config);

        this._config.load();

        CoreJS.Event.onEmit.on((args, sender) => this.debug && console.log(sender.name, args));
        CoreJS.Localization.onMissingTranslation.on(key => this.debug && console.warn(`missing translation for key '${key}'`));

        // wait until window is loaded
        if (document.readyState !== 'complete')
            await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));

        await this.viewController.load();

        this.onLoaded.emit();
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