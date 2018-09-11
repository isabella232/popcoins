const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const Convert = require("../../../../shared/lib/dedjs/Convert");
const ScanToReturn = require("../../../../shared/lib/scan-to-return/scan-to-return");
const topmost = require("ui/frame").topmost;
const PartyStates = require("../../../../shared/lib/dedjs/object/pop/org/OrgParty").States;
const RequestPath = require("../../../../shared/lib/dedjs/network/RequestPath");

const User = require("../../../../shared/lib/dedjs/object/user/User").get;

let viewModel = undefined;
let Party = undefined;
let pageObject = undefined;
let isPressed = undefined;

function onLoaded(args) {
    isPressed = "true";
    const page = args.object;
    pageObject = page.page;
    const context = page.navigationContext;

    if (context.party === undefined) {
        throw new Error("Party should be given in the context");
    }

    Party = context.party;
    viewModel = Party.getRegisteredAttsModule();

    page.bindingContext = viewModel;
    let finalizeLabel = page.getViewById("finalize");
    // Without this the text is not vertically centered in is own view
    finalizeLabel.android.setGravity(android.view.Gravity.CENTER);

    return Party.fetchOrganizerKeys()
        .then(() => {
            console.log("got keys")
        })
}

/**
 * Function that gets called when the user wants to register a public key manually.
 */
const addMyself = require("../../../tokens/main").addMyself;

function addManual() {
    return Dialog.prompt({
        title: "Public Key",
        message: "Please enter the public key of an attendee.",
        okButtonText: "Register",
        cancelButtonText: "Cancel",
        neutralButtonText: "Add Myself",
        inputType: Dialog.inputType.text
    })
        .then(args => {
            if (args.result && args.text !== undefined && args.text.length > 0) {
                // Add Key
                return Party.registerAttendee(Convert.hexToByteArray(args.text));
            } else if (args.result === undefined) {
                // Add Myself
                if (!User.isKeyPairSet()) {
                    return Dialog.alert({
                        title: "Key Pair Missing",
                        message: "Please generate a key pair.",
                        okButtonText: "Ok"
                    });
                }
                addMyselfAttendee(Party);
                // return Party.registerAttendee(User.getKeyPair().public).then(addPartyMyself( Convert.byteArrayToHex(Party.getPopDescHash()),Party.getLinkedConode().address));
            } else {
                // Cancel
                return Promise.resolve();
            }
        })
        .catch(error => {
            console.log(error);
            console.log(error.stack);

            Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            });

            return Promise.reject(error);
        });
}

/*This method creates a new attendee and adds its key to the list of keys
 */
function addMyselfAttendee(Party) {
    let info = {
        id: Convert.byteArrayToHex(Party.getPopDescHash()),
        omniledgerId: RequestPath.OMNILEDGER_INSTANCE_ID,
        address: Party.getLinkedConode().address
    };

    //var newParty = new AttParty(info.id, info.address);
    return addMyself(info)
        .then((p) => {
            console.dir("adding my new public key to party");
            return Party.registerAttendee(p.getKeyPair().public);
        })
}

function addScan() {
    let returnText = undefined;
    return ScanToReturn.scan()
        .then(keyPairJson => {
            const keyPair = Convert.parseJsonKeyPair(keyPairJson);
            return Party.registerAttendee(keyPair.public)
        })
        .then((text) => {
            returnText = text;
            const view = pageObject.getViewById("list-view-registered-keys");
            return view.refresh();
        })
        .then(() => {
            return returnText;
        })
        .catch(error => {
            console.dir("couldn't add new key:", error);
            return Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            })
                .then(() => {
                    throw new Error("couldn't scan");
                });
        });

}

function onSwipeCellStarted(args) {
    const swipeLimits = args.data.swipeLimits;
    const swipeView = args.object;

    const deleteButton = swipeView.getViewById("button-delete");

    const width = deleteButton.getMeasuredWidth();

    swipeLimits.right = width;
    swipeLimits.threshold = width / 2;
}

function deleteAttendee(args) {
    // We do not get the index of the item swiped/clicked...
    const attendee = Convert.byteArrayToBase64(args.object.bindingContext);
    const attendeeList = Party.getRegisteredAtts().slice().map(attendee => {
        return Convert.byteArrayToBase64(attendee);
    });

    const index = attendeeList.indexOf(attendee);

    return Party.unregisterAttendeeByIndex(index)
        .then(() => {
            const listView = Frame.topmost().currentPage.getViewById("list-view-registered-keys");
            listView.notifySwipeToExecuteFinished();

            return Promise.resolve();
        })
        .catch(error => {
            console.log(error);
            console.dir(error);
            console.trace();

            Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            });

            return Promise.reject(error);
        });
}

/**
 * Function called when the button "finalize" is clicked. It starts the registration process with the organizers conode.
 * @returns {Promise.<any>}
 */
function registerKeys() {
    if (!User.isKeyPairSet()) {
        return Dialog.alert({
            title: "Key Pair Missing",
            message: "Please generate a key pair.",
            okButtonText: "Ok"
        });
    }
    if (!Party.isPopDescComplete()) {
        return Dialog.alert({
            title: "No PopDesc",
            message: "Please configure the PopDesc first.",
            okButtonText: "Ok"
        });
    }
    if (Party.getPopDescHash().length === 0) {
        return Dialog.alert({
            title: "No PopDesc Hash",
            message: "Please register you PopDesc on your conode first.",
            okButtonText: "Ok"
        });
    }
    if (!Party.isLinkedConodeSet()) {
        return Dialog.alert({
            title: "Not Linked to Conode",
            message: "Please link to a conode first.",
            okButtonText: "Ok"
        });
    }
    if (Party.getRegisteredAtts().length === 0) {
        return Dialog.alert({
            title: "No Attendee to Register",
            message: "Please add some attendees first.",
            okButtonText: "Ok"
        });
    }

    return Party.registerAttsAndFinalizeParty()
        .then((result) => {

            if (result === PartyStates.FINALIZING) {
                isPressed = "false";
                return Dialog.alert({
                    title: "Finalizing",
                    message: "Finalize order has been sent but not all other conodes finalized yet.",
                    okButtonText: "Ok"
                });
            }
            return Dialog.alert({
                title: "Success",
                message: "The final statement of your PoP-Party is now accessible to the attendees.",
                okButtonText: "Ok"
            });
        })
        .then(() => {
            const navigationEntry = {
                moduleName: "drawers/pop/pop-page",
                clearHistory: true
            };
            topmost().navigate(navigationEntry);
        })
        .catch(error => {
            console.log(error);
            console.dir(error);
            console.trace();

            Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            });

            return Promise.reject(error);
        });
}

function addNewKey() {
    const choices = ["SCAN NEXT", "Stop scanning"]
    addScan().then(function (text) {
        setTimeout(() => {
            Dialog.confirm({
                title: "Scanned key",
                message: text,
                okButtonText: choices[0],
                cancelButtonText: choices[1]
            })
                .then(ok => {
                    if (ok) {
                        addNewKey();
                    }
                })
        })
    })
}

function shareToAttendee() {
    let info = {
        id: Convert.byteArrayToHex(Party.getPopDescHash()),
        omniledgerId: RequestPath.OMNILEDGER_INSTANCE_ID,
        address: Party.getLinkedConode().address
    };
    pageObject.showModal("shared/pages/qr-code/qr-code-page", {
        textToShow: Convert.objectToJson(info),
        title: "Party information"
    }, () => {
    }, true);

}

function goBack() {
    topmost().goBack();
}

function deleteParty() {
    Dialog.confirm({
        title: "Deleting party",
        message: "You're about to delete the party - \n" +
            "are you sure?",
        okButtonText: "Yes, delete",
        cancelButtonText: "No, keep"
    })
        .then(del => {
            if (del) {
                Party.remove();
                topmost().goBack();
            }
        })
}

function keyTapped(arg) {
    console.dir("keyTapped:", arg);
    console.dir("keyTapped:", arg.index);
    console.dir("keyTapped:", viewModel);
    console.dir("keyTapped:", viewModel.array);
    const key = viewModel.array.getItem(arg.index);
    console.dir(key);
    Frame.topmost().currentPage.showModal("shared/pages/qr-code/qr-code-page", {
        textToShow: " { \"public\" :  \"" + Convert.byteArrayToBase64(key) + "\"}",
        title: "Public Key",
    }, () => {
    }, true);
}

module.exports.keyTapped = keyTapped;
module.exports.deleteParty = deleteParty;
module.exports.onLoaded = onLoaded;
module.exports.addManual = addManual;
module.exports.addScan = addScan;
module.exports.registerKeys = registerKeys;
module.exports.deleteattendee = deleteAttendee;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.addNewKey = addNewKey;
module.exports.goBack = goBack;
module.exports.shareToAttendee = shareToAttendee;
module.exports.addMyselfAttendee = addMyselfAttendee;