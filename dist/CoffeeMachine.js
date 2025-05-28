"use strict";
// Définitions des types et interfaces
var CoffeeType;
(function (CoffeeType) {
    CoffeeType["Espresso"] = "Espresso";
    CoffeeType["Americano"] = "Americano";
    CoffeeType["Cappuccino"] = "Cappuccino";
    CoffeeType["Latte"] = "Latte";
})(CoffeeType || (CoffeeType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["Cash"] = "Cash";
    PaymentMethod["Card"] = "Card";
    PaymentMethod["Contactless"] = "Contactless";
    PaymentMethod["Token"] = "Token";
})(PaymentMethod || (PaymentMethod = {}));
var MachineState;
(function (MachineState) {
    MachineState["IDLE"] = "IDLE";
    MachineState["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    MachineState["COFFEE_SELECTION"] = "COFFEE_SELECTION";
    MachineState["PREPARING"] = "PREPARING";
    MachineState["ERROR"] = "ERROR";
})(MachineState || (MachineState = {}));
var ErrorType;
(function (ErrorType) {
    ErrorType["INSUFFICIENT_PAYMENT"] = "INSUFFICIENT_PAYMENT";
    ErrorType["NO_WATER"] = "NO_WATER";
    ErrorType["NO_COFFEE"] = "NO_COFFEE";
    ErrorType["NO_CUPS"] = "NO_CUPS";
    ErrorType["TECHNICAL_ERROR"] = "TECHNICAL_ERROR";
})(ErrorType || (ErrorType = {}));
// Classe principale de la machine à café
class CoffeeMachine {
    constructor() {
        this.state = MachineState.IDLE;
        this.stock = { coffee: 1000, water: 2000, cups: 50 };
        this.coffeePrices = {
            [CoffeeType.Espresso]: 2.5,
            [CoffeeType.Americano]: 3.0,
            [CoffeeType.Cappuccino]: 4.0,
            [CoffeeType.Latte]: 4.5,
        };
        this.coffeeConfigs = {
            [CoffeeType.Espresso]: { coffeeAmount: 10, waterAmount: 50, preparationTime: 10 },
            [CoffeeType.Americano]: { coffeeAmount: 15, waterAmount: 100, preparationTime: 15 },
            [CoffeeType.Cappuccino]: { coffeeAmount: 12, waterAmount: 80, preparationTime: 20 },
            [CoffeeType.Latte]: { coffeeAmount: 12, waterAmount: 120, preparationTime: 25 },
        };
        this.error = null;
        this.insertedAmount = 0;
    }
    // Afficher les boissons disponibles
    getAvailableDrinks() {
        return Object.keys(this.coffeePrices);
    }
    // Insérer un paiement
    insertPayment(amount, method) {
        this.state = MachineState.PAYMENT_PENDING;
        this.insertedAmount = amount;
        // Simuler la validation du moyen de paiement
        if (this.validatePayment(method)) {
            console.log(`Paiement de ${amount}€ via ${method} accepté.`);
            return true;
        }
        else {
            this.error = ErrorType.TECHNICAL_ERROR;
            this.state = MachineState.ERROR;
            console.error("Erreur de validation du paiement.");
            return false;
        }
    }
    // Valider le paiement
    validatePayment(method) {
        // Simulation : on suppose que tous les moyens de paiement sont valides
        return true;
    }
    // Sélectionner un café
    selectCoffee(type) {
        if (this.state !== MachineState.PAYMENT_PENDING) {
            this.error = ErrorType.TECHNICAL_ERROR;
            this.state = MachineState.ERROR;
            console.error("Paiement non validé.");
            return false;
        }
        const price = this.coffeePrices[type];
        if (this.insertedAmount < price) {
            this.error = ErrorType.INSUFFICIENT_PAYMENT;
            this.state = MachineState.ERROR;
            console.error("Paiement insuffisant.");
            return false;
        }
        if (!this.checkStock(type)) {
            this.state = MachineState.ERROR;
            return false;
        }
        this.state = MachineState.COFFEE_SELECTION;
        console.log(`Café ${type} sélectionné.`);
        return true;
    }
    // Vérifier les stocks
    checkStock(type) {
        const config = this.coffeeConfigs[type];
        if (this.stock.coffee < config.coffeeAmount) {
            this.error = ErrorType.NO_COFFEE;
            console.error("Plus de café disponible.");
            return false;
        }
        if (this.stock.water < config.waterAmount) {
            this.error = ErrorType.NO_WATER;
            console.error("Plus d'eau disponible.");
            return false;
        }
        if (this.stock.cups < 1) {
            this.error = ErrorType.NO_CUPS;
            console.error("Plus de gobelets disponibles.");
            return false;
        }
        return true;
    }
    // Préparer le café
    async prepareCoffee(type) {
        if (this.state !== MachineState.COFFEE_SELECTION) {
            this.error = ErrorType.TECHNICAL_ERROR;
            this.state = MachineState.ERROR;
            console.error("Sélection non valide.");
            return false;
        }
        this.state = MachineState.PREPARING;
        console.log(`Préparation du ${type} en cours...`);
        const config = this.coffeeConfigs[type];
        try {
            // Simuler la préparation
            await new Promise((resolve) => setTimeout(resolve, config.preparationTime * 1000));
            // Mettre à jour les stocks
            this.stock.coffee -= config.coffeeAmount;
            this.stock.water -= config.waterAmount;
            this.stock.cups -= 1;
            // Calculer la monnaie à rendre
            const change = this.insertedAmount - this.coffeePrices[type];
            if (change > 0) {
                console.log(`Rendu de monnaie : ${change}€`);
            }
            // Distribuer le café
            this.distributeCoffee();
            this.state = MachineState.IDLE;
            console.log(`${type} prêt !`);
            return true;
        }
        catch (err) {
            this.error = ErrorType.TECHNICAL_ERROR;
            this.state = MachineState.ERROR;
            console.error("Erreur lors de la préparation.");
            return false;
        }
    }
    // Distribuer le café
    distributeCoffee() {
        console.log("Distribution du café dans le gobelet.");
        // Simuler la distribution
    }
    // Obtenir l'état actuel
    getState() {
        return this.state;
    }
    // Obtenir l'erreur actuelle
    getError() {
        return this.error;
    }
    // Réinitialiser après une erreur
    resetError() {
        this.error = null;
        this.state = MachineState.IDLE;
        this.insertedAmount = 0;
        console.log("Machine réinitialisée.");
    }
    // Vérifier les stocks pour maintenance
    checkMaintenance() {
        const alerts = [];
        let lowStock = false;
        if (this.stock.coffee < 100) {
            alerts.push("Stock de café faible.");
            lowStock = true;
        }
        if (this.stock.water < 200) {
            alerts.push("Réservoir d'eau faible.");
            lowStock = true;
        }
        if (this.stock.cups < 5) {
            alerts.push("Stock de gobelets faible.");
            lowStock = true;
        }
        return { lowStock, details: alerts };
    }
}
// Exemple d'utilisation
async function main() {
    const machine = new CoffeeMachine();
    console.log("Boissons disponibles :", machine.getAvailableDrinks());
    // Simuler un achat
    machine.insertPayment(5.0, PaymentMethod.Cash);
    if (machine.selectCoffee(CoffeeType.Espresso)) {
        await machine.prepareCoffee(CoffeeType.Espresso);
    }
    // Vérifier les alertes de maintenance
    console.log("Maintenance :", machine.checkMaintenance());
}
// Lancer l'exemple
main();
