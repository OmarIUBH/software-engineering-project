# MealMate — UML Diagrams

Visual representation of the MealMate system using standard UML notation, rendered with Mermaid.js.

---

## 1. Use Case Diagram

Illustrates the core interactions between the **User** and the MealMate system, including Authentication, Meal Planning, and Pantry management flows.

```mermaid
![Use Case Diagram](https://www.plantuml.com/plantuml/svg/SyfBBl9B249N4hDDZqXJdJ7iEjZ5l_uhfqg4Ca9N4hDDnqwnSYYuG_Z78FpcNEnAifMHDrPR)

> 💡 The **User** is the single actor who drives all interactions. **«include»** arrows show mandatory sub-flows (e.g. a Meal Plan always generates a Grocery List), while **«extend»** arrows show optional behaviour (e.g. Browse Recipes can be extended with Diet Tag filtering). All core features require the user to be authenticated via **Create Account / Login**.

---

## 2. Component Diagram

Shows the **Client-Server architecture**. The React frontend communicates with the Express backend via JWT-authenticated REST API calls, persisting data in SQLite.

```mermaid
flowchart TD
    %% Custom Styling for Component Diagram
    classDef layerBox fill:#f9fafb,stroke:#d1d5db,stroke-width:2px,stroke-dasharray: 5 5;
    classDef compNode fill:#ffffff,stroke:#2563eb,stroke-width:2px;
    classDef dbNode fill:#ffffff,stroke:#16a34a,stroke-width:2px;

    subgraph ClientLayer ["🖥️ Client Tier"]
        SPA["«component»<br/><b>MealMate SPA</b>"]:::compNode
    end

    subgraph ServerLayer ["⚙️ Application Tier (Node.js/Express)"]
        Gateway["«component»<br/><b>API Gateway</b>"]:::compNode
        
        AuthService["«component»<br/><b>Authentication Service</b>"]:::compNode
        RecipeService["«component»<br/><b>Recipe Management</b>"]:::compNode
        MealPlanService["«component»<br/><b>Meal Planning</b>"]:::compNode
        PantryService["«component»<br/><b>Pantry Management</b>"]:::compNode

        Gateway --> AuthService
        Gateway --> RecipeService
        Gateway --> MealPlanService
        Gateway --> PantryService
    end

    subgraph DataLayer ["💾 Data Tier"]
        DB[("«database»<br/><b>SQLite</b>")]:::dbNode
    end

    %% Interactions
    SPA <====>|"REST API (JSON & JWT)"| Gateway
    
    %% Data Operations
    AuthService -.-> DB
    RecipeService -.-> DB
    MealPlanService -.-> DB
    PantryService -.-> DB

    %% Apply structural styling
    class ClientLayer,ServerLayer,DataLayer layerBox
```

> 💡 MealMate follows a classic **Client-Server** pattern. The **React + Vite** frontend runs entirely in the browser, managing state through an `AuthContext` that persists the JWT in `localStorage`. Every protected API call attaches the token as a `Bearer` header. The **Node.js / Express** backend exposes four REST route groups (`/auth`, `/recipes`, `/mealplans`, `/pantry`), all backed by a single **SQLite** file.

---

## 3. Sequence Diagram

Traces the complete flow from **User Login** (JWT acquisition) through to **adding a recipe** to the weekly meal plan using the authenticated session.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Frontend (React)
    participant Auth as AuthContext (State / Storage)
    participant API as API Server (Node / Express)
    participant DB as SQLite DB

    Note over User,DB: 🔐 Authentication Phase

    User->>UI: Enter Email & Password
    UI->>API: POST /api/auth/login
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: Return password_hash & record
    API->>API: bcrypt.compare(password, hash)
    API-->>UI: 200 OK { token, user }
    UI->>Auth: Store JWT in localStorage

    Note over User,DB: 🍽️ Application Execution Phase

    User->>UI: Select Recipe for Meal Plan
    Auth-->>UI: Provide JWT Token
    UI->>API: POST /api/mealplans/items [Authorization: Bearer {token}]
    API->>API: jwt.verify(token, secret)
    API->>DB: CHECK Recipe & Plan exist
    DB-->>API: Validated ✓
    API->>DB: INSERT INTO meal_plan_items
    DB-->>API: 201 { id, ... }
    API-->>UI: 201 Created { item data }
    UI->>UI: Update local state
    UI-->>User: ✅ Visual success feedback
```

> 💡 The flow is split into two phases. In the **Authentication Phase** the frontend POSTs credentials, the server verifies the password hash with `bcrypt`, and returns a signed JWT that is stored in `localStorage`. In the **Application Execution Phase** the stored token is attached to subsequent requests; the server validates the signature with `jwt.verify()` before writing to the database, ensuring only authenticated users can modify meal plan data.

---

## 4. Class Diagram

Depicts the **data model** as stored in SQLite, including Authentication fields on `User`, `expiry_date` on `PantryItem`, and all entity relationships.

```mermaid
classDiagram
    direction TB

    class User {
        <<Entity>>
        +Integer id
        +String name
        +String email
        +String password_hash
        +String preferences
        +DateTime created_at
    }

    class MealPlan {
        <<Entity>>
        +Integer id
        +Integer user_id
        +Date week_start_date
        +Decimal weekly_budget
        +String currency
        +DateTime created_at
    }

    class MealPlanItem {
        <<Entity>>
        +Integer id
        +Integer meal_plan_id
        +Integer day_of_week
        +String meal_type
        +Integer recipe_id
        +Integer servings
    }

    class Recipe {
        <<Entity>>
        +Integer id
        +Integer user_id
        +String title
        +String instructions
        +Integer default_servings
        +DateTime created_at
        +DateTime updated_at
    }

    class RecipeIngredient {
        <<Entity>>
        +Integer recipe_id
        +Integer ingredient_id
        +Double quantity
        +String unit
    }

    class Ingredient {
        <<Entity>>
        +Integer id
        +String name
        +String default_unit
        +DateTime created_at
    }

    class IngredientPrice {
        <<Entity>>
        +Integer id
        +Integer ingredient_id
        +Decimal price_per_unit
        +String currency
        +DateTime updated_at
    }

    class PantryItem {
        <<Entity>>
        +Integer id
        +Integer user_id
        +Integer ingredient_id
        +Double quantity
        +String unit
        +String expiry_date
        +DateTime updated_at
    }

    User "1" --> "0..*" MealPlan
    User "1" --> "0..*" PantryItem
    MealPlan "1" *-- "0..*" MealPlanItem : Contains
    MealPlanItem "0..*" o-- "1" Recipe : References
    Recipe "1" *-- "1..*" RecipeIngredient : Requires
    RecipeIngredient "0..*" o-- "1" Ingredient : Maps To
    PantryItem "0..*" o-- "1" Ingredient : Maps To
    Ingredient "1" *-- "0..*" IngredientPrice : Priced As
```

> 💡 Every **User** owns zero-or-more **MealPlan** and **PantryItem** records. A `MealPlan` is composed of `MealPlanItem` rows (one per meal slot), each referencing a **Recipe**. Recipes are built from `RecipeIngredient` join records that map to shared **Ingredient** entities — keeping ingredient names canonical. Each `Ingredient` has zero-or-more **IngredientPrice** entries used for budget calculation. `PantryItem` links a user's stock to the same `Ingredient` catalogue, and includes an `expiry_date` field for freshness tracking.
