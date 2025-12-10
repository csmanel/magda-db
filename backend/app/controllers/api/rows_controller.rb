class Api::RowsController < ApplicationController
  before_action :set_table
  before_action :set_row, only: [:show, :update, :destroy]

  def index
    @rows = @table.rows.order(created_at: :desc)
    render json: @rows
  end

  def show
    render json: @row
  end

  def create
    @row = @table.rows.new(row_params)

    if @row.save
      render json: @row, status: :created
    else
      render json: { errors: @row.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @row.update(row_params)
      render json: @row
    else
      render json: { errors: @row.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @row.destroy
    head :no_content
  end

  private

  def set_table
    @table = Table.find(params[:table_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Table not found" }, status: :not_found
  end

  def set_row
    @row = @table.rows.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Row not found" }, status: :not_found
  end

  def row_params
    params.require(:row).permit(data: {})
  end
end
