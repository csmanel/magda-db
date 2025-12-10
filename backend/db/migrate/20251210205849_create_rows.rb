class CreateRows < ActiveRecord::Migration[8.1]
  def change
    create_table :rows do |t|
      t.references :table, null: false, foreign_key: true, index: true
      t.text :data, null: false

      t.timestamps
    end
  end
end
