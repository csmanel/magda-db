class Table < ApplicationRecord
  has_many :rows, dependent: :destroy

  serialize :schema, coder: JSON

  validates :name, presence: true, uniqueness: true
  validates :schema, presence: true

  before_validation :initialize_schema, on: :create

  private

  def initialize_schema
    self.schema ||= {}
  end
end
