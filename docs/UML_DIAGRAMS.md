# MealMate — UML Diagrams

Visual representation of the MealMate system using standard UML notation, rendered with Mermaid.js.

---

## 1. Use Case Diagram

Illustrates core interactions between the **User** and the MealMate system.

> [!IMPORTANT]
> **UML Standard Compliance**: This diagram is rendered using **PlantUML** to ensure perfect mathematical ovals (ellipses) for all use cases, as strictly required by the project tutor.

![UML Use Case Diagram](https://www.plantuml.com/plantuml/svg/~h735232702a5108422108c45455928d2d652d502d622d652d2b512b502d28512dd4c6888b1d3d651d622d645163f5726266e2e2a2a29282b2b1154483034d23348b13034d633324c4a3130d4334fca4c01ca4ac8cc4d2c4905f252084b2c4e2e29e6aa8da9b97a206b0b2b8b9313ea5a62f2730ca78ca9746c19a9504a4e4d4c4a5554303434b23232aa05721111002303030230d12591299c51239c51379c5c93999e525a585711200021a8a29a0029a1a9212002160912061616116122111116161a121516109151121121092520211111112211911110a2606a666e6ea16a6a1aa6616a61a6a66a1a6a61a1154ab1702f32f1ea30c3132cc4b494d4ecb2c0192e2124b4b2c4cd273010b9308cc4c4ed12bef4a520d2972740d1271120a11d27771761611d273771376161a02100)

> 💡 **Explanation:** Two actors model the privilege split: **Guest User** can register, log in, and freely browse recipes; **Authenticated User** gains access to all protected features. `<<extend>>` relationships show that dietary filtering and serving-size scaling are optional extensions to browsing. `<<include>>` relationships on **Generate Grocery List** express that it *always* depends on the Meal Plan and Pantry Inventory data — these are mandatory sub-flows, not optional ones.

---


## 2. Component Diagram

Shows the **Client-Server architecture**. The React frontend communicates with the Express backend via JWT-authenticated REST API calls, persisting data in SQLite.

```mermaid
flowchart TB
    %% ── Client Environment ──────────────────────────────────
    subgraph CE["🖥️  Client Environment"]
        direction TB
        SPA[["&lt;&lt;component&gt;&gt;\nMealMate SPA\n(React.js)"]]
    end

    %% ── Server Environment ──────────────────────────────────
    subgraph SE["⚙️  Server Environment  ·  Node.js / Express"]
        direction TB

        subgraph APIs["Provided Interfaces"]
            direction LR
            IAuth(["🔌 Authentication API"])
            IRecipes(["🔌 Recipe API"])
            IPlans(["🔌 Meal Planning API"])
            IPantry(["🔌 Pantry API"])
        end

        AuthSvc[["&lt;&lt;component&gt;&gt;\nAuthentication\nService"]]
        RecipeSvc[["&lt;&lt;component&gt;&gt;\nRecipe Management\nService"]]
        PlanSvc[["&lt;&lt;component&gt;&gt;\nMeal Planner\nService"]]
        PantrySvc[["&lt;&lt;component&gt;&gt;\nPantry & Budget\nService"]]

        IAuth --- AuthSvc
        IRecipes --- RecipeSvc
        IPlans --- PlanSvc
        IPantry --- PantrySvc
    end

    %% ── Database Host ───────────────────────────────────────
    subgraph DB_ENV["🗃️  Database Host"]
        DB[("SQLite\nDatabase")]
    end

    %% ── Client → Interface connections (REST/JSON) ──────────
    SPA -. "REST/JSON" .-> IAuth
    SPA -. "REST/JSON" .-> IRecipes
    SPA -. "REST/JSON" .-> IPlans
    SPA -. "REST/JSON" .-> IPantry

    %% ── Services → Database (SQL) ───────────────────────────
    AuthSvc -. "SQL" .-> DB
    RecipeSvc -. "SQL" .-> DB
    PlanSvc -. "SQL" .-> DB
    PantrySvc -. "SQL" .-> DB

    %% ── Styling ─────────────────────────────────────────────
    classDef component fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    classDef iface fill:#fef9c3,stroke:#ca8a04,color:#713f12
    classDef db fill:#dcfce7,stroke:#16a34a,color:#14532d

    class SPA,AuthSvc,RecipeSvc,PlanSvc,PantrySvc component
    class IAuth,IRecipes,IPlans,IPantry iface
    class DB db
```

> 💡 **Explanation:** The diagram models a three-tier client-server architecture across distinct execution environments. The **Client Environment** hosts the compiled React SPA. The **Server Environment** exposes four provided interfaces (shown as oval nodes) — each fulfilled by a dedicated `<<component>>` (shown with double-bordered subroutine boxes). The **Database Host** holds the SQLite database accessed by the server-side components via SQL. All client-to-server communication uses JWT-authenticated REST/JSON; server-to-database communication uses parameterised SQL queries via `better-sqlite3`. The **Pantry & Budget Service** is intentionally unified because pantry stock deduction and budget cost calculation share the same ingredient pricing data.


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
