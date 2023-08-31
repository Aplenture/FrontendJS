/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Route } from "./route";
import { ClientPreparer } from "../interfaces";

interface RouteOptions {
    readonly listener?: any;
}

export abstract class Router {
    public static readonly onRouteChanged = new CoreJS.Event<void, Route>('this.onRouteChanged');

    private static readonly _routes: Route[] = [];
    private static readonly _history = new CoreJS.Lifo<string>();

    private static _route = new Route('index');

    public static get route(): Route { return this._route; }

    public static get index(): number { return this._route && this._route.index; }
    public static get historyLength(): number { return this._history.count; }

    public static async prepare(preparer: ClientPreparer): Promise<void> { }

    public static async init(): Promise<void> {
        window['Router'] = this;
        window.addEventListener('popstate', async () => {
            this._history.pop();
            this.setupRoute();
            this.onRouteChanged.emit(null, this._route);
        });
    }

    public static async load() { }

    public static async loaded() {
        this.setupRoute();
        this.onRouteChanged.emit(null, this._route);
    }

    public static addRoute(name: string, onRouteChanged?: CoreJS.EventHandler<void, Route>, options: RouteOptions = {}): Route {
        const route = new Route(name);

        this._routes.push(route);

        if (onRouteChanged)
            this.onRouteChanged.on(onRouteChanged, { args: route, listener: options.listener });

        return route;
    }

    public static changeRoute(name: string, index: number = null) {
        const route = this.findRoute(name, index);

        if (this._route && route.name == this._route.name && route.index == this._route.index)
            return;

        const routeString = route.toString();

        this._history.push(routeString);
        window.history.pushState({}, route.name, routeString);

        this._route = route;

        this.onRouteChanged.emit(null, route);
    }

    public static back() {
        if (this._history.count) {
            window.history.back();
        } else {
            const route = this.findRoute();

            if (this._route && route.name == this._route.name && route.index == this._route.index)
                return;

            this._route = route;

            this.onRouteChanged.emit(null, route);
        }
    }

    public static reload() {
        this.onRouteChanged.emit(null, this._route);
    }

    private static setupRoute() {
        const routeParts = window.location.pathname.split('/');

        this._route = this.findRoute(routeParts[1], parseInt(routeParts[2]));

        if (this._route.name != routeParts[1])
            window.history.replaceState({}, this._route.name, this._route.toString());
    }

    private static findRoute(name?: string, index?: number) {
        const route = (name && this._routes.find(route => route.name == name))
            // fallback to first route
            || this._routes[0];

        if (!route)
            throw new Error('#_no_routes');

        (route as any).index = index && !isNaN(index)
            ? index
            : null;

        route.init();

        return route;
    }
}