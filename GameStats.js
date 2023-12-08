export class GameStats {
    constructor({
        ordersCompleted = 0,
        ordersFailed = 0,
        moneyEarned = 0,
    } = {}) {
        this.ordersCompleted = ordersCompleted;
        this.ordersFailed = ordersFailed;
        this.moneyEarned = moneyEarned;
    };

    addOrderCompleted() {
        this.ordersCompleted++;
    }

    addOrderFailed() {
        this.ordersFailed++;
    }

    addMoneyEarned(money) {
        this.moneyEarned += money;
    }
}