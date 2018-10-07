"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const observable_1 = require("data/observable");
class BadgesViewModel extends observable_1.Observable {
    constructor() {
        super();
        this.isEmpty = true;
        this.items = new Array();
    }
}
exports.BadgesViewModel = BadgesViewModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2VzLXZpZXctbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYWRnZXMtdmlldy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUEyQztBQUkzQyxxQkFBNkIsU0FBUSx1QkFBVTtJQUszQztRQUNJLEtBQUssRUFBRSxDQUFDO1FBSlosWUFBTyxHQUFZLElBQUksQ0FBQztRQU1wQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFRLENBQUM7SUFDbkMsQ0FBQztDQUNKO0FBVkQsMENBVUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge09ic2VydmFibGV9IGZyb20gXCJkYXRhL29ic2VydmFibGVcIjtcbmltcG9ydCB7SXRlbX0gZnJvbSBcIi4vc2hhcmVkL2l0ZW1cIjtcbmltcG9ydCAqIGFzIEJhZGdlIGZyb20gXCJ+L2xpYi9wb3AvQmFkZ2VcIjtcblxuZXhwb3J0IGNsYXNzIEJhZGdlc1ZpZXdNb2RlbCBleHRlbmRzIE9ic2VydmFibGUge1xuICAgIGl0ZW1zOiBBcnJheTxJdGVtPjtcbiAgICBpc0VtcHR5OiBib29sZWFuID0gdHJ1ZTtcbiAgICBwYXJ0eTogQmFkZ2UuQmFkZ2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLml0ZW1zID0gbmV3IEFycmF5PEl0ZW0+KCk7XG4gICAgfVxufVxuIl19