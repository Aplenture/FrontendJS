/**
 * Aplenture/FrontendJS
 * https://github.com/Aplenture/FrontendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/FrontendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import { Access } from "./access";
import { ServerModule, ServerPreparer } from "../../interfaces";
import { Server } from "../../core";

const ROUTE_CREATE_ACCOUNT = 'createAccount';
const ROUTE_HAS_ACCESS = 'hasAccess';
const ROUTE_LOGIN = 'login';
const ROUTE_LOGOUT = 'logout';
const ROUTE_CHANGE_PASSWORD = 'changePassword';
const ROUTE_GET_ACCESSES = 'getAccesses';
const ROUTE_CREATE_ACCESS = 'createAccess';
const ROUTE_DELETE_ACCESS = 'deleteAccess';

const EXPIRATION_NEW_ACCOUNT_ACCESS = CoreJS.Milliseconds.Day;

interface CreateAccessOptions {
    readonly rights?: number;
    readonly label?: string;
    readonly expiration_duration?: number;
}

interface LoginOptions {
    readonly keepLogin?: boolean;
    readonly label?: string;
}

export class Account implements ServerModule {
    public readonly onAccessChanged = new CoreJS.Event<Account, Access>('Account.onAccessChanged');
    public readonly onLogin = new CoreJS.Event<Account, Access>('Account.onLogin');
    public readonly onLogout = new CoreJS.Event<Account, void>('Account.onLogout');

    private _server: Server;
    private _access: Access;
    private _privateRoutes: readonly string[] = [];

    public get server(): Server { return this._server; }
    public get hasAccess(): boolean { return !!this._access; }
    public get access(): Access { return this._access; };
    public get rights(): number { return this._access && this._access.rights || 0; };

    public async prepare(preparer: ServerPreparer): Promise<void> {
        preparer.addRoute(ROUTE_CREATE_ACCOUNT);
        preparer.addRoute(ROUTE_HAS_ACCESS);
        preparer.addRoute(ROUTE_LOGIN);
        preparer.addRoute(ROUTE_LOGOUT);
        preparer.addRoute(ROUTE_CHANGE_PASSWORD);
        preparer.addRoute(ROUTE_GET_ACCESSES);
        preparer.addRoute(ROUTE_CREATE_ACCESS);
        preparer.addRoute(ROUTE_DELETE_ACCESS);
    }

    public async init(server: Server): Promise<void> {
        const data = server.infos;

        this._server = server;
        this._privateRoutes = (data.routes || [])
            .filter(route => Object.values(route.parameters).some((param: any) => param.name == 'sign'))
            .map(route => route.path.toLowerCase());

        CoreJS.Event.onEmit.on((data, sender) => {
            if (sender.name != 'Request.onRequesting')
                return;

            if (data.sender.endpoint != this._server.endpoint)
                return;

            if (!this._privateRoutes.includes(data.sender.route.toLowerCase()))
                return;

            if (data.args.sign)
                return;

            if (!this.hasAccess)
                throw new Error('#_error_no_access');

            data.args.timestamp = Date.now();

            const message = CoreJS.parseArgsToString(data.args);

            data.args.sign = this._access.sign(message);
            data.args.api = this._access.api;
        });
    }

    public async load(server: Server): Promise<void> { }
    public async unload(server: Server): Promise<void> { }

    public async start(server: Server): Promise<void> {
        this._access = Access.deserialize(server.name);

        if (!await this.validateAccess())
            this._access = null;

        if (this.hasAccess)
            this.onAccessChanged.emit(this, this._access);
    }

    public hasRights(rights: number): boolean {
        return this.hasAccess
            && this._access.hasRights(rights);
    }

    public async createAccount(username: string, password: string, keepLogin = false): Promise<boolean> {
        const privateKey = CoreJS.EC.createPrivateKey(password);
        const publickey = CoreJS.EC.secp256k1.createPublicKey(privateKey).toString();
        const response = await this.server.requestJSON(ROUTE_CREATE_ACCOUNT, {
            username,
            publickey,
            create_access: true,
            access_expiration: EXPIRATION_NEW_ACCOUNT_ACCESS
        });

        this.updateAccess(
            new Access(response.api, response.secret, response),
            keepLogin
        );

        this.onLogin.emit(this, this._access);

        return true;
    }

    public async validateAccess(access = this._access): Promise<boolean> {
        if (!access)
            return false;

        const timestamp = Date.now();
        const result = await this._server.requestJSON(ROUTE_HAS_ACCESS, {
            api: access.api,
            signature: access.sign(CoreJS.parseArgsToString({ timestamp })),
            timestamp
        });

        if (!result)
            return false;

        access.rights = result.rights;
        access.expiration = result.expiration;
        access.label = result.label;

        return true;
    }

    public async login(username: string, password: string, options: LoginOptions = {}): Promise<Access> {
        const timestamp = Date.now();
        const hash = CoreJS.toHashInt(timestamp.toString());
        const privateKey = CoreJS.EC.createPrivateKey(password);
        const sign = CoreJS.ECDSA.sign(hash, privateKey).toString();

        const response = await this._server.requestJSON(ROUTE_LOGIN, {
            timestamp,
            username,
            sign,
            keepLogin: options.keepLogin,
            label: options.label
        });

        this.updateAccess(
            new Access(response.api, response.secret, response),
            options.keepLogin
        );

        this.onLogin.emit(this, this._access);

        return this._access;
    }

    public async logout(): Promise<boolean> {
        if (!this._access)
            return true;

        if (!await this._server.requestBool(ROUTE_LOGOUT))
            return false;

        this.updateAccess(null);
        this.onLogout.emit(this);

        return true;
    }

    public updateAccess(access: Access, keepLogin = false) {
        if (this._access)
        this._access.reset(this._server.name);

        if (access)
            access.serialize(this._server.name, keepLogin);

        this._access = access;
        this.onAccessChanged.emit(this, access);
    }

    public changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        const oldPrivateKey = CoreJS.EC.createPrivateKey(oldPassword);
        const oldPublickey = CoreJS.EC.secp256k1.createPublicKey(oldPrivateKey).toString();

        const newPrivateKey = CoreJS.EC.createPrivateKey(newPassword);
        const newPublickey = CoreJS.EC.secp256k1.createPublicKey(newPrivateKey).toString();

        return this._server.requestBool(ROUTE_CHANGE_PASSWORD, {
            old: oldPublickey,
            new: newPublickey
        });
    }

    public getAccesses(): Promise<readonly Access[]> {
        return this._server.requestJSON(ROUTE_GET_ACCESSES)
            .then(data => data.map(data => new Access(data.api, data.secret, data)));
    }

    public createAccess(options: CreateAccessOptions = {}): Promise<Access> {
        return this._server.requestJSON(ROUTE_CREATE_ACCESS, options)
            .then(data => new Access(data.api, data.secret, data));
    }

    public async deleteAccess(access: Access): Promise<boolean> {
        const result = await this._server.requestBool(ROUTE_DELETE_ACCESS, { api_to_delete: access.api });

        if (result && access == this._access)
            this._access = null;

        return result;
    }
}