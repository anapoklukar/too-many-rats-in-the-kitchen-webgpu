export class Order {
    constructor({
        // order types are
        // 0: wine [1, 0]
        // 1: steak [0, 1]
        // 2: wine and steak [1, 1]
        // 3: 2x wine and 2x steak [2, 2]
        orderType = 0,

        // order items has [0] how many wines, [1] how many steaks
        orderItems = [0, 0],
        timer = 40,

    } = {}) {
        this.generateRandomOrder();
        this.timer = timer;
    }

    generateRandomOrder() {
        const number = Math.random();
        if (number < 0.2) {
            this.orderType = 0;
            this.orderItems = [1, 0];
        } else if (number < 0.4) {
            this.orderType = 1;
            this.orderItems = [0, 1];
        } else if (number < 0.9) {
            this.orderType = 2;
            this.orderItems = [1, 1];
        } else {
            this.orderType = 3;
            this.orderItems = [2, 2];
        }
    }
}