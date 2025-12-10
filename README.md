# Magda DB

A beautiful, user-friendly database manager that's more aesthetically pleasing than Excel. Built for you and your friends to easily create and edit custom tables.

## Features

- Create custom tables with dynamic schemas
- Spreadsheet-like interface for editing data
- Beautiful, modern UI with Tailwind CSS
- Real-time data updates
- Easy-to-use table and row management

## Tech Stack

**Backend:**
- Rails 8.1.1 (API-only)
- SQLite3 database
- RESTful API

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

## Getting Started

### Prerequisites

- Ruby 3.2.2
- Node.js and npm

### Backend Setup

```bash
cd backend
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server
```

Backend will run on http://localhost:3000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## Usage

1. Open http://localhost:5173 in your browser
2. Click "Create New Table" to create a new table
3. Define your columns (name, type: text/number/date)
4. Click "Open Table" to view and edit data
5. Click on any cell to edit it
6. Press Enter or click outside to save changes
7. Add rows with the "+ Add Row" button

## Sample Data

The seed data includes three example tables:
- **Contacts**: Store contact information for friends and family
- **Projects**: Track personal and work projects
- **Monthly Expenses**: Keep track of expenses

## API Endpoints

### Tables
- `GET /api/tables` - List all tables
- `GET /api/tables/:id` - Get a specific table with its rows
- `POST /api/tables` - Create a new table
- `PUT /api/tables/:id` - Update a table
- `DELETE /api/tables/:id` - Delete a table

### Rows
- `GET /api/tables/:table_id/rows` - List all rows in a table
- `GET /api/tables/:table_id/rows/:id` - Get a specific row
- `POST /api/tables/:table_id/rows` - Create a new row
- `PUT /api/tables/:table_id/rows/:id` - Update a row
- `DELETE /api/tables/:table_id/rows/:id` - Delete a row

## Development

Both the backend and frontend support hot-reloading during development.

## License

MIT
