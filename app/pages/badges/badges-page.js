"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialog = require("tns-core-modules/ui/dialogs");
const frame_1 = require("tns-core-modules/ui/frame");
const badges_view_model_1 = require("./badges-view-model");
const Log_1 = require("~/lib/Log");
const Badge = require("~/lib/pop/Badge");
let page;
const pageObject = undefined;
function onNavigatingTo(args) {
    page = args.object;
    page.bindingContext = badges_view_model_1.BadgesViewModel;
    return showBadges(Badge.Badge.loadAll())
        .then(() => {
        setTimeout(() => {
            showBadges(Badge.Badge.updateAll())
                .catch(err => {
                Log_1.Log.catch(err);
            });
        }, 100);
    });
}
exports.onNavigatingTo = onNavigatingTo;
function showBadges(badges) {
    Log_1.Log.lvl1("Loading parties");
    return Badge.Badge.loadAll()
        .then((badges) => {
        page.bindingContext.items.splice(0);
        page.bindingContext.isEmpty = true;
        badges.forEach((badge, index) => {
            if (badge.state() === Badge.STATE_TOKEN) {
                page.bindingContext.items.push({
                    party: badge,
                    name: badge.config.name,
                    datetime: badge.config.datetime,
                    location: badge.config.location,
                    index: index + 1
                });
                page.bindingContext.isEmpty = false;
            }
        });
    })
        .catch((err) => {
        Log_1.Log.catch(err);
    });
}
function partyTapped(args) {
    const index = args.index;
    const party = page.bindingContext.items.getItem(index).party;
    const WALLET_DELETE = "Delete";
    const WALLET_SHOW = "Show";
    const actions = [WALLET_SHOW, WALLET_DELETE];
    return Dialog.action({
        message: "Choose an Action",
        cancelButtonText: "Cancel",
        actions
    }).then((result) => {
        switch (result) {
            case WALLET_DELETE:
                return Dialog.confirm({
                    title: "Deleting party-token",
                    message: "You're about to delete the party-token - \n" +
                        "are you sure?",
                    okButtonText: "Yes, delete",
                    cancelButtonText: "No, keep"
                })
                    .then((del) => {
                    if (del) {
                        return party.remove()
                            .then(() => {
                            page.bindingContext.items.splice(index, 1);
                            return pageObject.getViewById("listView").refresh();
                        });
                    }
                })
                    .catch((err) => {
                    console.log("error while deleting:", err);
                });
            case WALLET_SHOW:
                return frame_1.topmost().navigate({
                    moduleName: "pages/admin/parties/config/config-page",
                    context: {
                        wallet: party,
                        readOnly: true
                    }
                });
        }
    });
}
exports.partyTapped = partyTapped;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2VzLXBhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYWRnZXMtcGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNEQUFzRDtBQUN0RCxxREFBb0Q7QUFFcEQsMkRBQXNEO0FBRXRELG1DQUFnQztBQUNoQyx5Q0FBeUM7QUFFekMsSUFBSSxJQUFVLENBQUM7QUFDZixNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFFN0Isd0JBQStCLElBQW1CO0lBQzlDLElBQUksR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsbUNBQWUsQ0FBQztJQUV0QyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDbkMsSUFBSSxDQUFDLEdBQUUsRUFBRTtRQUNOLFVBQVUsQ0FBQyxHQUFFLEVBQUU7WUFDWCxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztpQkFDOUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNULFNBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUE7UUFDVixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDWixDQUFDLENBQUMsQ0FBQztBQUNYLENBQUM7QUFiRCx3Q0FhQztBQUVELG9CQUFvQixNQUFtQztJQUNuRCxTQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFNUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO1NBQ3ZCLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBQ2IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNuQyxNQUFN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UCxDQUFDO0FBOUNELGtDQThDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIERpYWxvZyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9kaWFsb2dzXCI7XG5pbXBvcnQgeyB0b3Btb3N0IH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvZnJhbWVcIjtcbmltcG9ydCB7IE5hdmlnYXRlZERhdGEsIFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0IHsgQmFkZ2VzVmlld01vZGVsIH0gZnJvbSBcIi4vYmFkZ2VzLXZpZXctbW9kZWxcIjtcblxuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIn4vbGliL0xvZ1wiO1xuaW1wb3J0ICogYXMgQmFkZ2UgZnJvbSBcIn4vbGliL3BvcC9CYWRnZVwiO1xuXG5sZXQgcGFnZTogUGFnZTtcbmNvbnN0IHBhZ2VPYmplY3QgPSB1bmRlZmluZWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBvbk5hdmlnYXRpbmdUbyhhcmdzOiBOYXZpZ2F0ZWREYXRhKSB7XG4gICAgcGFnZSA9IDxQYWdlPmFyZ3Mub2JqZWN0O1xuICAgIHBhZ2UuYmluZGluZ0NvbnRleHQgPSBCYWRnZXNWaWV3TW9kZWw7XG5cbiAgICByZXR1cm4gc2hvd0JhZGdlcyhCYWRnZS5CYWRnZS5sb2FkQWxsKCkpXG4gICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICAgICAgc2hvd0JhZGdlcyhCYWRnZS5CYWRnZS51cGRhdGVBbGwoKSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIExvZy5jYXRjaChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNob3dCYWRnZXMoYmFkZ2VzOiBQcm9taXNlPEFycmF5PEJhZGdlLkJhZGdlPj4pOiBQcm9taXNlPGFueT4ge1xuICAgIExvZy5sdmwxKFwiTG9hZGluZyBwYXJ0aWVzXCIpO1xuXG4gICAgcmV0dXJuIEJhZGdlLkJhZGdlLmxvYWRBbGwoKVxuICAgICAgICAudGhlbigoYmFkZ2VzKSA9PiB7XG4gICAgICAgICAgICBwYWdlLmJpbmRpbmdDb250ZXh0Lml0ZW1zLnNwbGljZSgwKTtcbiAgICAgICAgICAgIHBhZ2UuYmluZGluZ0NvbnRleHQuaXNFbXB0eSA9IHRydWU7XG4gICAgICAgICAgICBiYWRnZXMuZm9yRWFjaCgoYmFkZ2U6IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChiYWRnZS5zdGF0ZSgpID09PSBCYWRnZS5TVEFURV9UT0tFTikge1xuICAgICAgICAgICAgICAgICAgICBwYWdlLmJpbmRpbmdDb250ZXh0Lml0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydHk6IGJhZGdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYmFkZ2UuY29uZmlnLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRldGltZTogYmFkZ2UuY29uZmlnLmRhdGV0aW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246IGJhZGdlLmNvbmZpZy5sb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleCArIDFcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2UuYmluZGluZ0NvbnRleHQuaXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgTG9nLmNhdGNoKGVycik7XG4gICAgICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFydHlUYXBwZWQoYXJncykge1xuICAgIGNvbnN0IGluZGV4ID0gYXJncy5pbmRleDtcbiAgICBjb25zdCBwYXJ0eSA9IHBhZ2UuYmluZGluZ0NvbnRleHQuaXRlbXMuZ2V0SXRlbShpbmRleCkucGFydHk7XG5cbiAgICBjb25zdCBXQUxMRVRfREVMRVRFID0gXCJEZWxldGVcIjtcbiAgICBjb25zdCBXQUxMRVRfU0hPVyA9IFwiU2hvd1wiO1xuXG4gICAgY29uc3QgYWN0aW9ucyA9IFtXQUxMRVRfU0hPVywgV0FMTEVUX0RFTEVURV07XG5cbiAgICByZXR1cm4gRGlhbG9nLmFjdGlvbih7XG4gICAgICAgIG1lc3NhZ2U6IFwiQ2hvb3NlIGFuIEFjdGlvblwiLFxuICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiBcIkNhbmNlbFwiLFxuICAgICAgICBhY3Rpb25zXG4gICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIHN3aXRjaCAocmVzdWx0KSB7XG4gICAgICAgICAgICBjYXNlIFdBTExFVF9ERUxFVEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIERpYWxvZy5jb25maXJtKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiRGVsZXRpbmcgcGFydHktdG9rZW5cIixcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJZb3UncmUgYWJvdXQgdG8gZGVsZXRlIHRoZSBwYXJ0eS10b2tlbiAtIFxcblwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJlIHlvdSBzdXJlP1wiLFxuICAgICAgICAgICAgICAgICAgICBva0J1dHRvblRleHQ6IFwiWWVzLCBkZWxldGVcIixcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uVGV4dDogXCJObywga2VlcFwiXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGRlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0eS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlLmJpbmRpbmdDb250ZXh0Lml0ZW1zLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWdlT2JqZWN0LmdldFZpZXdCeUlkKFwibGlzdFZpZXdcIikucmVmcmVzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3Igd2hpbGUgZGVsZXRpbmc6XCIsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FzZSBXQUxMRVRfU0hPVzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9wbW9zdCgpLm5hdmlnYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlTmFtZTogXCJwYWdlcy9hZG1pbi9wYXJ0aWVzL2NvbmZpZy9jb25maWctcGFnZVwiLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YWxsZXQ6IHBhcnR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHk6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iXX0=