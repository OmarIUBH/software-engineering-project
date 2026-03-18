# MealMate — UML Diagrams

Visual representation of the MealMate system using standard UML notation, rendered with Mermaid.js.

---

## 1. Use Case Diagram

Illustrates the core interactions between the **User** and the MealMate system, including Authentication, Meal Planning, and Pantry management flows.

> ⚠️ **UML Notation**: This diagram is specified in **PlantUML** to comply with UML standards. Use cases are drawn as ovals, the actor is a stick figure, and `<<include>>`/`<<extend>>` stereotypes follow the UML specification. Render at [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/) or any PlantUML-compatible tool.

```plantuml
@startuml MealMate_UseCaseDiagram
left to right direction
skinparam usecase {
  BackgroundColor LightYellow
  BorderColor DarkOliveGreen
  ArrowColor DarkSlateGray
}
skinparam actorStyle awesome

actor "User" as U
actor "Guest User" as Guest
actor "Authenticated User" as AuthUser

Guest --|> U
AuthUser --|> U

rectangle "MealMate System" {
  usecase "Register Account"             as UC_Reg
  usecase "Log In"                       as UC_Login
  usecase "Browse & Search Recipes"      as UC_Browse
  usecase "Filter by Dietary Tags"       as UC_Filter
  usecase "Adjust Serving Sizes"         as UC_Scale

  usecase "Manage Weekly Meal Plan"      as UC_Plan
  usecase "Generate Grocery List"        as UC_List
  usecase "Manage Pantry Inventory"      as UC_Pantry
  usecase "Monitor Weekly Budget"        as UC_Budget
}

U --> UC_Browse

Guest --> UC_Reg
Guest --> UC_Login

UC_Filter .up.> UC_Browse : <<extend>>
UC_Scale .up.> UC_Browse : <<extend>>

AuthUser --> UC_Plan
AuthUser --> UC_List
AuthUser --> UC_Pantry
AuthUser --> UC_Budget

note "Grocery list is derived from the\nweekly meal plan and existing\npantry inventory." as N_List
UC_List .. N_List

@enduml
```


---

## 2. Component Diagram

Shows the **Client-Server architecture**. The React frontend communicates with the Express backend via JWT-authenticated REST API calls, persisting data in SQLite.

> ⚠️ **UML Notation**: This diagram is specified in **PlantUML** to comply with UML Component Diagram standards. Components use the `[ComponentName]` notation (rectangle with the component symbol), provided interfaces are shown as `()` circles, and dependencies use `<<use>>` stereotypes. Render at [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/).

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

> 💡 MealMate follows a classic **Client-Server** pattern. The **React + Vite** frontend runs entirely in the browser, managing state through an `AuthContext` that persists the JWT in `localStorage`. Every protected API call attaches the token as a `Bearer` header. The **Node.js / Express** backend exposes four REST route groups (`/auth`, `/recipes`, `/mealplans`, `/pantry`), all backed by a single **SQLite** file. A dedicated **JWT Middleware** component intercepts all protected requests at the gateway level.

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
