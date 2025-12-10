class Api::TablesController < ApplicationController
  before_action :set_table, only: [:show, :update, :destroy]

  def index
    @tables = Table.all.order(created_at: :desc)
    render json: @tables
  end

  def show
    render json: @table, include: :rows
  end

  def create
    @table = Table.new(table_params)

    if @table.save
      render json: @table, status: :created
    else
      render json: { errors: @table.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @table.update(table_params)
      render json: @table
    else
      render json: { errors: @table.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @table.destroy
    head :no_content
  end

  private

  def set_table
    @table = Table.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Table not found" }, status: :not_found
  end

  def table_params
    params.require(:table).permit(:name, :description, schema: {})
  end
end
