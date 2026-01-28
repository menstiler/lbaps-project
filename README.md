# LBAPS Project

## Table of Contents

- [Installation](#installation)
- [How to Use](#how-to-use)
- [Database Model Structure](#database-model-structure)
- [API Endpoints](#api-endpoints)
- [Notes](#notes)

## Installation

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:

   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
   ```

5. Run migrations:

   ```bash
   python manage.py migrate
   ```

6. Start the Django development server:

   ```bash
   python manage.py runserver
   ```

   The backend API will be available at `http://localhost:8000/api`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

   The frontend application will be available at `http://localhost:5173`

## How to Use

### 1. Login

- Navigate to the login page `/login` (unauthenticated users will be redirected automatically)
- Enter username and password
  - **Demo credentials:**
    - Username: `demo`
    - Password: `demo123`
- Click "Login"
- Redirected to the tasks list page upon successful login

### 2. View Tasks

- `/tasks` page shows list of all of the current user's tasks
- Each task displays:
  - Title (required)
  - Notes (optional)
  - Due date (optional)
  - High priority indicator (if marked)
  - Custom fields (if any)

### 3. Create a New Task

- Click the "+ New Task" button (or "+ Add Task", or navigate to `/tasks/new`)
- Fill in the task form:
  - **Title** (required)
  - **Notes** (optional)
  - **Due Date** (optional)
  - **High Priority** (optional)
  - **Custom Field** (optional, but will be required if any of the fields are filled out)
    - Field Name
    - Field Type: select the data type of Field Value. (string, number, or boolean)
    - Field Value: Must match the selected Field Type
- Click "Add Task" to save, or "Cancel" to discard (and navigate back to `/tasks`)

### 4. Reorder Form Fields

- On the task creation form, a user can reorder fields in two ways:
  - **Arrow Buttons**: Use the up (^) and down (^) arrows to move fields
  - **Drag and Drop**: Click and hold the drag handle (⋮⋮) on the left, then drag the field to a new position
- The user's field order preference will automatically save and be restored whenever they access the form.

### 5. Logout

- Click the "Logout" button in the header to sign out

## Database Model Structure

### Task Model

- `id` - Primary key (auto-generated)
- `user` - Foreign key to User (who owns the task)
- `title` - CharField (max 255 chars, required)
- `notes` - TextField (optional)
- `due_date` - DateField (optional)
- `high_priority` - BooleanField (default: False)
- `created_at` - DateTimeField (auto-set on creation)

### TaskCustomField Model

- `id` - Primary key (auto-generated)
- `task` - Foreign key to Task (related task)
- `field_name` - CharField (max 100 chars)
- `field_type` - CharField with choices: "string", "boolean", "number"
- `field_value` - JSONField (stores the value matching the field_type)

**Relationships:**

- One Task can have many TaskCustomFields
- TaskCustomField values are validated to match their field_type

### UserSettings Model

- `id` - Primary key (auto-generated)
- `user` - OneToOneField to User (one settings per user)
- `task_form_field_order` - JSONField (array of field names in preferred order)

**Relationships:**

- One User has one UserSettings
- Stores the user's preferred form field order as a JSON array

## API Endpoints

### Authentication

- `POST /api/token/` - Get JWT access token

### Tasks

- `GET /api/tasks/` - List user's tasks
- `POST /api/tasks/` - Create a new task

### Settings (field order)

- `GET /api/settings/` - Get user settings
- `PUT /api/settings/` - Update user settings

## Notes

**Database:** SQLite

**Styling:** Plain CSS

**Authentication:** JWT are used for authentication. Tokens are stored in localStorage and persist until the user logs out or clears browser data. No token refresh mechanism is implemented for the purpose of this application since tokens only expire after 1 year.

**Database Design:** Custom fields are stored in a separate `TaskCustomField` table rather than directly on the `Task` model. This approach allows for multiple custom fields per task (one-to-many relationship) and efficient querying and indexing of custom field names/types.

The `field_value` is stored as a JSONField because it needs to accommodate different data types (string, boolean, number) without requiring separate columns or type-specific tables. This provides flexibility while maintaining type validation at the application layer. The tradeoff is less database-level type safety compared to typed columns, but this is mitigated by validation on the backend.

The form field order preferences are stored in a separate `UserSettings` table with a OneToOne relationship to the User model, rather than modifying Django's built-in User model directly or storing preferences in localStorage/session. This approach keeps the User model clean and unmodified, allows for future extensibility to add other user preferences without cluttering the User model, and ensures persistence across devices and sessions (unlike localStorage). The tradeoffs of this approach include requiring an additional database query/API call to fetch settings, added code complexity to ensure UserSettings records exist for each user, and slightly more storage overhead compared to storing preferences directly on the User model or in browser storage. The JSONField `task_form_field_order` provides flexibility to store an array of field names without schema changes. Validation enforces that only valid field names can be stored in the array.

**Validation:** Zod for client-side, and Django validators for server-side. Zod offers a clean and consistent schema that handles complex validation logic with minimal repetitive boilerplate code and avoids manual type checking. The tradeoff is the added dependency and possible overkill for simple forms.

Django REST Framework serializers are built-in with DRF, requiring no additional dependencies compared to alternatives like Pydantic or Marshmallow. They integrate with Django models for automatic validation on create/update operations and use Django's existing field types and constraints. The tradeoffs include less flexibility for complex custom validation logic, potentially more verbose code for certain scenarios, and being tied to the Django/DRF ecosystem.

The validation checks for the following: The title field is required. When any custom field is provided, all three (name, type, value) must be provided. Custom field values must match their declared field type (string, boolean, or number). All other fields are optional. Validation occurs on both the frontend and backend.
