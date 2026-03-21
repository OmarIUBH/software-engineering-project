# MealMate — UML Diagrams

Visual representation of the MealMate system using standard UML notation, rendered with Mermaid.js.

---

## 1. Use Case Diagram

Illustrates the core interactions between the **User** and the MealMate system. A two-actor hierarchy separates **Guest User** (unauthenticated) from **Authenticated User** (logged in), with `<<include>>` and `<<extend>>` relationships shown on the relevant use cases.

```mermaid
flowchart LR
    %% ── Actors ─────────────────────────────────────────────
    Guest([👤 Guest User])
    Auth([👤 Authenticated User])

    %% ── System Boundary ─────────────────────────────────────
    subgraph MealMate [" 🍽️  MealMate System "]
        direction TB

        subgraph Public ["── Public Access ──"]
            UC_Reg(["Register Account"])
            UC_Login(["Log In"])
            UC_Browse(["Browse & Search Recipes"])
        end

        subgraph Auth_Features ["── Authenticated Features ──"]
            UC_Plan(["Manage Weekly Meal Plan"])
            UC_List(["Generate Grocery List"])
            UC_Pantry(["Manage Pantry Inventory"])
            UC_Budget(["Monitor Weekly Budget"])
        end

        subgraph Extensions ["── Extensions ──"]
            UC_Filter(["Filter by Dietary Tags"])
            UC_Scale(["Adjust Serving Sizes"])
        end
    end

    %% ── Guest associations ──────────────────────────────────
    Guest --> UC_Reg
    Guest --> UC_Login
    Guest --> UC_Browse

    %% ── Authenticated associations ──────────────────────────
    Auth --> UC_Browse
    Auth --> UC_Plan
    Auth --> UC_List
    Auth --> UC_Pantry
    Auth --> UC_Budget

    %% ── extend relationships ────────────────────────────────
    UC_Browse -. "<<extend>>" .-> UC_Filter
    UC_Browse -. "<<extend>>" .-> UC_Scale

    %% ── include relationships ───────────────────────────────
    UC_List -. "<<include>>" .-> UC_Plan
    UC_List -. "<<include>>" .-> UC_Pantry

    %% ── Styling ─────────────────────────────────────────────
    classDef actor fill:#2d6a4f,color:#fff,stroke:#1b4332
    classDef usecase fill:#d8f3dc,color:#1b4332,stroke:#74c69d
    classDef ext fill:#fff9c4,color:#5c4a00,stroke:#f0c040

    class Guest actor
    class Auth actor
    class UC_Reg usecase
    class UC_Login usecase
    class UC_Browse usecase
    class UC_Plan usecase
    class UC_List usecase
    class UC_Pantry usecase
    class UC_Budget usecase
    class UC_Filter ext
    class UC_Scale ext
```

> 💡 **Explanation:** Two actors model the privilege split: **Guest User** can register, log in, and freely browse recipes; **Authenticated User** gains access to all protected features. `<<extend>>` relationships show that dietary filtering and serving-size scaling are optional extensions to browsing. `<<include>>` relationships on **Generate Grocery List** express that it *always* depends on the Meal Plan and Pantry Inventory data — these are mandatory sub-flows, not optional ones.

---

## 2. Component Diagram

![Component Diagram](../diagrams/component_diagram.png)

Shows the **Client-Server architecture**. The React frontend communicates with the Express backend via JWT-authenticated REST API calls, persisting data in SQLite.

> ⚠️ **UML Notation**: This diagram is specified in **PlantUML** utilizing the explicit `skinparam componentStyle uml2` configuration to comply rigidly with modern UML 2.0 component diagram standards, guaranteeing formal component icon rendering.

```plantuml
@startuml MealMate_ComponentDiagram
skinparam componentStyle uml2
skinparam nodesep 70
skinparam ranksep 70
skinparam component {
  BackgroundColor LightBlue
  BorderColor SteelBlue
}
skinparam interface {
  BackgroundColor LightYellow
  BorderColor DarkGoldenRod
}
skinparam database {
  BackgroundColor LightYellow
  BorderColor DarkOliveGreen
}

node "Client Environment" <<execution environment>> {
  component "MealMate SPA (React.js)" as Client <<component>>
}

node "Server Environment" <<execution environment>> {
  interface "Authentication API" as IAuth
  interface "Recipe API" as IRecipes
  interface "Meal Planning API" as IPlans
  interface "Pantry API" as IPantry

  component "Authentication Service" as AuthService <<component>>
  component "Recipe Management Service" as RecipeService <<component>>
  component "Meal Planner Service" as PlannerService <<component>>
  component "Pantry & Budget Service" as PantryService <<component>>

  IAuth -down- AuthService
  IRecipes -down- RecipeService
  IPlans -down- PlannerService
  IPantry -down- PantryService
}

node "Database Host" <<execution environment>> {
  database "SQLite Database" as DB
}

Client ..> IAuth : <<use>> REST/JSON
Client ..> IRecipes : <<use>> REST/JSON
Client ..> IPlans : <<use>> REST/JSON
Client ..> IPantry : <<use>> REST/JSON

AuthService ..> DB : <<use>> SQL Dialect
RecipeService ..> DB : <<use>> SQL Dialect
PlannerService ..> DB : <<use>> SQL Dialect
PantryService ..> DB : <<use>> SQL Dialect

@enduml
```

> 💡 **Explanation:** The component diagram illustrates the high-level structural decomposition of the MealMate system based on a strict multi-tier client-server pattern. The architectural computing load is distributed across discrete execution environments: the client environment hosts the compiled React.js SPA, the server environment hosts a modular monolithic backend, and the database host manages local persistent storage via SQLite. To ensure modular cohesion, interrelated lifecycle operations such as inventory tracking and cost analysis are purposefully encapsulated within a unified Pantry & Budget Service. Furthermore, the frontend acts as a strict consumer, resolving dependencies globally via tightly coupled but deeply abstracted JWT-authenticated RESTful interfaces (**Authentication, Recipe, Meal Planning, and Pantry APIs**).


---

## 3. Sequence Diagram

Traces three end-to-end flows: **Authentication**, **Meal Planning**, and **Grocery / Pantry / Budget Resolution**. Together these flows cover the full critical path of the MealMate application.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI  as Frontend (React)
    participant Auth as AuthContext
    participant API  as API Server (Express)
    participant DB   as SQLite DB

    %% ══════════════════════════════════════════════
    Note over User,DB: 🔐 Phase 1 — Authentication
    %% ══════════════════════════════════════════════

    User->>UI: Submit email & password
    UI->>API: POST /api/auth/login
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: { id, password_hash, name }
    API->>API: bcrypt.compare(password, hash)

    alt Credentials valid
        API-->>UI: 200 OK { token, user }
        UI->>Auth: Store JWT in localStorage
        UI-->>User: ✅ Redirect to Dashboard
    else Credentials invalid
        API-->>UI: 401 Unauthorized
        UI-->>User: ❌ "Invalid email or password"
    end

    %% ══════════════════════════════════════════════
    Note over User,DB: 🍽️ Phase 2 — Meal Planning
    %% ══════════════════════════════════════════════

    User->>UI: Browse recipes, apply dietary filter
    UI->>API: GET /api/recipes?tag=Vegan
    API->>DB: SELECT recipes WHERE tag = 'Vegan'
    DB-->>API: [ Recipe[] ]
    API-->>UI: 200 OK { recipes }
    UI-->>User: Render filtered recipe cards

    User->>UI: Assign recipe to day slot (with servings)
    Auth-->>UI: Attach JWT to request
    UI->>API: POST /api/mealplans/:id/items  [Bearer token]
    API->>API: jwt.verify(token, secret)
    API->>DB: INSERT INTO meal_plan_items (recipe_id, day, servings)
    DB-->>API: { id, recipe_id, day_of_week, servings }
    API-->>UI: 201 Created { item }
    UI->>UI: Update planner state
    UI-->>User: ✅ Slot updated with recipe card

    %% ══════════════════════════════════════════════
    Note over User,DB: 🛒 Phase 3 — Grocery / Pantry / Budget
    %% ══════════════════════════════════════════════

    User->>UI: Open Grocery List
    Auth-->>UI: Attach JWT
    UI->>API: GET /api/grocery  [Bearer token]
    API->>DB: SELECT meal_plan_items JOIN recipe_ingredients (scaled by servings)
    DB-->>API: Raw ingredient rows
    API->>API: Aggregate & merge identical ingredients (case-insensitive)
    API->>DB: SELECT pantry_items WHERE user_id = ?
    DB-->>API: Pantry stock rows
    API->>API: Apply pantry deduction algorithm\n(Full → mark Owned, Partial → subtract qty)
    API-->>UI: 200 OK { groceryList, budgetSummary }
    UI-->>User: Render aggregated list + budget bar

    alt Plan cost > weekly_budget
        UI-->>User: ⚠️ "Over Budget" warning (red bar)
    else Plan cost ≤ weekly_budget
        UI-->>User: ✅ Budget bar green
    end
```

> 💡 **Phase 1** shows the full login flow including the server-side bcrypt check and the JWT storage in `localStorage`, plus the error branch for invalid credentials. **Phase 2** covers recipe filtering and the authenticated meal-plan write — showing the JWT verification guard before any DB write. **Phase 3** models the full grocery resolution pipeline: ingredient aggregation from the planner, pantry deduction, and the budget-alert conditional that drives the visual warning in the UI.

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
