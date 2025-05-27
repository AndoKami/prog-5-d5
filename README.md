#  CoffeeMachine
Choix de language : javascript 

---

##  Objectif

Créer une application modulaire qui simule les étapes d’utilisation d’une machine à café :
1. Payer
2. Choisir un café
3. Récupérer le café

---

##  Structure du Projet ( Clean Architecture )

```bash
coffee-machine/
│
├── domain/              # Règles métiers pures
│   ├── entities/        # Entités : Coffee, Payment
│   ├── valueObjects/    # Types sûrs (ex: Money, CoffeeType)
│   └── errors/          # Exceptions métiers
│
├── usecases/            # Cas d'utilisation
│   ├── pay.js           
│   ├── chooseCoffee.js 
│   └── getCoffee.js     
│
├── services/            # Logique métier 
│   └── coffeeMachine.js
│
├── models/              # dans le futur si besoin mais de base dans un clean architecture
│
│
└── README.md
