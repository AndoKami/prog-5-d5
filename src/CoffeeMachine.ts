import * as readline from 'readline';


enum CoffeeType {
  Espresso = "Espresso",
  Americano = "Americano",
  Cappuccino = "Cappuccino",
  Latte = "Latte",
}

enum PaymentMethod {
  Cash = "Cash",
  Card = "Card",
  Contactless = "Contactless",
  Token = "Token",
}

enum MachineState {
  IDLE = "IDLE",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  COFFEE_SELECTION = "COFFEE_SELECTION",
  PREPARING = "PREPARING",
  ERROR = "ERROR",
}

enum ErrorType {
  INSUFFICIENT_PAYMENT = "INSUFFICIENT_PAYMENT",
  NO_WATER = "NO_WATER",
  NO_COFFEE = "NO_COFFEE",
  NO_CUPS = "NO_CUPS",
  TECHNICAL_ERROR = "TECHNICAL_ERROR",
}

interface Stock {
  coffee: number; 
  water: number; 
  cups: number;  
}

interface CoffeeConfig {
  coffeeAmount: number; 
  waterAmount: number; 
  preparationTime: number; 
}

class CoffeeMachine {
  private state: MachineState = MachineState.IDLE;
  private stock: Stock = { coffee: 1000, water: 2000, cups: 50 };
  private coffeePrices: Record<CoffeeType, number> = {
    [CoffeeType.Espresso]: 2.5,
    [CoffeeType.Americano]: 3.0,
    [CoffeeType.Cappuccino]: 4.0,
    [CoffeeType.Latte]: 4.5,
  };
  private coffeeConfigs: Record<CoffeeType, CoffeeConfig> = {
    [CoffeeType.Espresso]: { coffeeAmount: 10, waterAmount: 50, preparationTime: 10 },
    [CoffeeType.Americano]: { coffeeAmount: 15, waterAmount: 100, preparationTime: 15 },
    [CoffeeType.Cappuccino]: { coffeeAmount: 12, waterAmount: 80, preparationTime: 20 },
    [CoffeeType.Latte]: { coffeeAmount: 12, waterAmount: 120, preparationTime: 25 },
  };
  private error: ErrorType | null = null;
  private insertedAmount: number = 0;
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async startCLI(): Promise<void> {
    this.displayWelcome();
    while (true) {
      await this.handleUserInput();
    }
  }

  private displayWelcome(): void {
    console.log("\n=== Machine à Café Automatique ===");
    console.log("Bienvenue ! Voici les boissons disponibles :");
    this.displayAvailableDrinks();
    console.log("\nCommandes disponibles :");
    console.log("- pay <montant> <méthode> (ex: pay 5 Cash)");
    console.log("- select <boisson> (ex: select Espresso)");
    console.log("- prepare");
    console.log("- maintenance");
    console.log("- reset (en cas d'erreur)");
    console.log("- exit");
  }

  private displayAvailableDrinks(): void {
    const drinks = this.getAvailableDrinks();
    drinks.forEach((drink, index) => {
      console.log(`${index + 1}. ${drink} - ${this.coffeePrices[drink]}€`);
    });
  }

  private async handleUserInput(): Promise<void> {
    const input = await this.prompt("Entrez une commande : ");
    const [command, ...args] = input.trim().split(" ");

    switch (command.toLowerCase()) {
      case "pay":
        this.handlePayment(args);
        break;
      case "select":
        this.handleSelection(args);
        break;
      case "prepare":
        await this.handlePreparation();
        break;
      case "maintenance":
        this.handleMaintenance();
        break;
      case "reset":
        this.resetError();
        break;
      case "exit":
        console.log("Arrêt de la machine. Au revoir !");
        this.rl.close();
        process.exit(0);
        break;
      default:
        console.log("Commande non reconnue. Essayez : pay, select, prepare, maintenance, reset, exit");
    }
  }

  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  private handlePayment(args: string[]): void {
    if (args.length !== 2) {
      console.log("Usage : pay <montant> <méthode> (ex: pay 5 Cash)");
      return;
    }
    const amount = parseFloat(args[0]);
    const method = args[1] as PaymentMethod;
    if (isNaN(amount) || !Object.values(PaymentMethod).includes(method)) {
      console.log("Montant invalide ou méthode de paiement non reconnue.");
      return;
    }
    if (this.insertPayment(amount, method)) {
      console.log("Paiement accepté. Veuillez sélectionner une boisson avec 'select <boisson>'.");
    }
  }

  private handleSelection(args: string[]): void {
    if (args.length !== 1) {
      console.log("Usage : select <boisson> (ex: select Espresso)");
      return;
    }
    const type = args[0] as CoffeeType;
    if (!Object.values(CoffeeType).includes(type)) {
      console.log("Boisson non reconnue. Boissons disponibles :");
      this.displayAvailableDrinks();
      return;
    }
    if (this.selectCoffee(type)) {
      console.log(`Boisson ${type} sélectionnée. Entrez 'prepare' pour préparer.`);
    }
  }

  private async handlePreparation(): Promise<void> {
    if (this.state !== MachineState.COFFEE_SELECTION) {
      console.log("Veuillez d'abord sélectionner une boisson avec 'select <boisson>'.");
      return;
    }
    const type = Object.keys(this.coffeeConfigs).find(
      (key) => this.state === MachineState.COFFEE_SELECTION
    ) as CoffeeType;
    await this.prepareCoffee(type);
  }

  private handleMaintenance(): void {
    const { lowStock, details } = this.checkMaintenance();
    if (lowStock) {
      console.log("Alertes de maintenance :");
      details.forEach((alert) => console.log(`- ${alert}`));
    } else {
      console.log("Tous les stocks sont suffisants.");
    }
  }

  private getAvailableDrinks(): CoffeeType[] {
    return Object.keys(this.coffeePrices) as CoffeeType[];
  }

  private insertPayment(amount: number, method: PaymentMethod): boolean {
    this.state = MachineState.PAYMENT_PENDING;
    this.insertedAmount = amount;
    if (this.validatePayment(method)) {
      console.log(`Paiement de ${amount}€ via ${method} accepté.`);
      return true;
    } else {
      this.error = ErrorType.TECHNICAL_ERROR;
      this.state = MachineState.ERROR;
      console.error("Erreur de validation du paiement.");
      return false;
    }
  }

  private validatePayment(method: PaymentMethod): boolean {
    return true; // Simulation : tous les paiements sont valides
  }

  private selectCoffee(type: CoffeeType): boolean {
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

  private checkStock(type: CoffeeType): boolean {
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

  private async prepareCoffee(type: CoffeeType): Promise<boolean> {
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
      await new Promise((resolve) => setTimeout(resolve, config.preparationTime * 1000));
      this.stock.coffee -= config.coffeeAmount;
      this.stock.water -= config.waterAmount;
      this.stock.cups -= 1;

      const change = this.insertedAmount - this.coffeePrices[type];
      if (change > 0) {
        console.log(`Rendu de monnaie : ${change}€`);
      }

      this.distributeCoffee();
      this.state = MachineState.IDLE;
      console.log(`${type} prêt !`);
      this.displayWelcome();
      return true;
    } catch (err) {
      this.error = ErrorType.TECHNICAL_ERROR;
      this.state = MachineState.ERROR;
      console.error("Erreur lors de la préparation.");
      return false;
    }
  }

  private distributeCoffee(): void {
    console.log("Distribution du café dans le gobelet.");
  }

  getState(): MachineState {
    return this.state;
  }

  getError(): ErrorType | null {
    return this.error;
  }

  private resetError(): void {
    this.error = null;
    this.state = MachineState.IDLE;
    this.insertedAmount = 0;
    console.log("Machine réinitialisée.");
    this.displayWelcome();
  }

  private checkMaintenance(): { lowStock: boolean; details: string[] } {
    const alerts: string[] = [];
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

const machine = new CoffeeMachine();
machine.startCLI();