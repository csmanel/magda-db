# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_12_10_205849) do
  create_table "rows", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "data", null: false
    t.integer "table_id", null: false
    t.datetime "updated_at", null: false
    t.index ["table_id"], name: "index_rows_on_table_id"
  end

  create_table "tables", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.text "schema", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_tables_on_name"
  end

  add_foreign_key "rows", "tables"
end
