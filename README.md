
#  CoffeeMachine
Choix de language : javascript 

---

##  Objectif

Créer une application modulaire qui simule les étapes d’utilisation d’une machine à café :
1. Payer
2. Choisir un café
3. Récupérer le café

---

## Cas d’utilisation (Use Cases)
#### (C1) Pay
Entrée : montant

Règle : le montant doit être suffisant

Résultat : solde mis à jour

#### (C2) Choose Coffee
Entrée : type de café (ex: espresso, cappuccino)

Règle : le type doit exister

Résultat : café sélectionné pour préparation

#### (C3 / C4) Get Coffee
Entrée : confirmation utilisateur

Règle : la machine doit avoir assez d’ingrédients

Résultat : café servi

## Business
Règles métiers :

* La machine doit avoir de l’eau, du café, du lait (selon la recette)

* Le paiement doit précéder la sélection

* Si erreur : afficher un message clair

## Gestion des erreurs
Cas à couvrir :

* Montant insuffisant

* Type de café inexistant

* Machine vide

* Séquence incorrecte (choisir café sans payer)

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

