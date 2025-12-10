class Row < ApplicationRecord
  belongs_to :table

  serialize :data, coder: JSON

  validates :data, presence: true

  before_validation :initialize_data, on: :create

  private

  def initialize_data
    self.data ||= {}
  end
end
