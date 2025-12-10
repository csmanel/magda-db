class CreateTables < ActiveRecord::Migration[8.1]
  def change
    create_table :tables do |t|
      t.string :name, null: false
      t.text :description
      t.text :schema, null: false

      t.timestamps
    end

    add_index :tables, :name
  end
end
