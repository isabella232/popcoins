import { NavigatedData, Page } from "ui/page";
import { CoinsViewModel } from "./coins-view-model";
import * as Dialog from "tns-core-modules/ui/dialogs";
import { topmost } from "tns-core-modules/ui/frame";

import { Buffer } from "buffer/";

const PlatformModule = require("tns-core-modules/platform");
const ZXing = require("nativescript-zxing");
const ImageSource = require("image-source");
const QRGenerator = new ZXing();

let lib = require("../../../lib");
let Scan = lib.Scan;
import Log from "~/lib/Log";
import * as Badge from "~/lib/pop/Badge";

let Convert = lib.Convert;

let page: Page = undefined;
let pageObject = undefined;
let party: Badge.Badge = undefined;

export function onNavigatingTo(args: NavigatedData) {
    Log.lvl1("getting to badges");
    page = <Page>args.object;
    page.bindingContext = CoinsViewModel;
    return showParties(Badge.Badge.loadAll(), false)
        .then(() => {
            setTimeout(() => {
                showParties(Badge.Badge.updateAll(), true);
            }, 100);
        });
}

function showParties(badges: Promise<Array<Badge.Badge>>, update: boolean) {
    Log.lvl1("Loading parties");
    return badges.then(badges => {
        return Promise.all(badges.map((b: Badge.Badge) => {
            if (b.state() == Badge.STATE_TOKEN) {
                if (update) {
                    return b.getCoinInstance(true)
                        .then(() => {
                            return b;
                        });
                }
                return b;
            }
        })).then((badges: Array<Badge.Badge>) => {
            badges.forEach((b: Badge.Badge) => {
                if (b != undefined) {
                    party = b;
                    page.bindingContext.balance = party.balance;
                    let pubBase64 = Buffer.from(b.keypair.public.marshalBinary()).toString('base64');
                    let text = " { \"public\" :  \"" + pubBase64 + "\"}";
                    let sideLength = PlatformModule.screen.mainScreen.widthPixels / 4;
                    const qrcode = QRGenerator.createBarcode({
                        encode: text,
                        format: ZXing.QR_CODE,
                        height: sideLength,
                        width: sideLength
                    });
                    page.bindingContext.qrcode = ImageSource.fromNativeSource(qrcode);
                }
            });
        });
    }).catch(err => {
        Log.catch(err);
    });
}

export function sendCoins(args) {
    let amount = undefined;
    const USER_WRONG_INPUT = "USER_WRONG_INPUT";

    return Dialog.prompt({
        title: "Amount",
        message: "Please choose the amount of PoP-Coin you want to transfer",
        okButtonText: "Transfer",
        cancelButtonText: "Cancel",
        defaultText: "50000",
    }).then((r) => {
        if (!r.result) {
            throw new Error("Cancelled");
        }
        amount = Number(r.text);
        if (isNaN(amount) || !(Number.isInteger(amount))) {
            return Promise.reject(USER_WRONG_INPUT);
        }
        return Scan.scan();
    }).then(publicKeyJson => {
        const publicKeyObject = Convert.jsonToObject(publicKeyJson);
        page.bindingContext.isLoading = true;
        return party.transferCoin(amount, Convert.base64ToByteArray(publicKeyObject.public), true);
    }).catch(err => {
        Log.rcatch(err, "couldn't send coins");
    }).then(() => {
        page.bindingContext.isLoading = false;
        return Dialog.alert({
            title: "Success !",
            message: "" + amount + " PoP-Coins have been transferred",
            okButtonText: "Ok"
        });
    }).then(() => {
        return updateCoins()
            .catch(err => {
                page.bindingContext.isLoading = false;
                if (err === "Cancelled") {
                    return Promise.resolve();
                } else if (err === USER_WRONG_INPUT) {
                    return Dialog.alert({
                        title: "Wrong input",
                        message: "You can only enter an integer number. Please try again.",
                        okButtonText: "Ok"
                    });

                }

                Log.rcatch(err, "wrong number");
            });
    });
}

function updateCoins() {
    if (party) {
        return party.getCoinInstance(true)
            .then(ci => {
                page.bindingContext.balance = ci.balance;
            });
    }
    return Promise.resolve();
}

export function onBack() {
    topmost().goBack();
}

export function onReload() {
    return updateCoins();
}