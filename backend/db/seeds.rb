# Clear existing data
Row.destroy_all
Table.destroy_all

puts "Creating sample tables and data..."

# Create a contacts table
contacts_table = Table.create!(
  name: "Contacts",
  description: "My friends and family contact information",
  schema: {
    columns: [
      { name: "name", type: "text" },
      { name: "email", type: "text" },
      { name: "phone", type: "text" },
      { name: "notes", type: "text" }
    ]
  }
)

# Add some contacts
contacts_table.rows.create!([
  { data: { name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", notes: "Best friend from college" } },
  { data: { name: "Bob Smith", email: "bob@example.com", phone: "555-0102", notes: "Coworker" } },
  { data: { name: "Charlie Brown", email: "charlie@example.com", phone: "555-0103", notes: "Neighbor" } }
])

# Create a projects table
projects_table = Table.create!(
  name: "Projects",
  description: "My personal and work projects",
  schema: {
    columns: [
      { name: "project_name", type: "text" },
      { name: "status", type: "text" },
      { name: "priority", type: "text" },
      { name: "deadline", type: "text" }
    ]
  }
)

# Add some projects
projects_table.rows.create!([
  { data: { project_name: "Build database app", status: "In Progress", priority: "High", deadline: "2025-01-15" } },
  { data: { project_name: "Learn React", status: "Completed", priority: "Medium", deadline: "2024-12-01" } },
  { data: { project_name: "Organize garage", status: "Not Started", priority: "Low", deadline: "2025-02-01" } }
])

# Create an expenses table
expenses_table = Table.create!(
  name: "Monthly Expenses",
  description: "Track my monthly expenses",
  schema: {
    columns: [
      { name: "category", type: "text" },
      { name: "amount", type: "number" },
      { name: "date", type: "text" },
      { name: "description", type: "text" }
    ]
  }
)

# Add some expenses
expenses_table.rows.create!([
  { data: { category: "Groceries", amount: "150.50", date: "2024-12-05", description: "Weekly shopping" } },
  { data: { category: "Utilities", amount: "85.00", date: "2024-12-01", description: "Electric bill" } },
  { data: { category: "Entertainment", amount: "45.00", date: "2024-12-08", description: "Movie tickets" } }
])

puts "Seed data created successfully!"
puts "Created #{Table.count} tables with #{Row.count} total rows"
