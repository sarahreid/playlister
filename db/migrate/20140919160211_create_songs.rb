class CreateSongs < ActiveRecord::Migration
  def change
    create_table :songs do |t|
      t.string :title
      t.string :artist
      t.string :album
      t.integer :year
      t.integer :track
      t.float :length

      t.timestamps
    end
  end
end
