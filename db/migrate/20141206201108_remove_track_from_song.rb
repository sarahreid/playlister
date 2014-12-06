class RemoveTrackFromSong < ActiveRecord::Migration
  def change
    remove_column :songs, :track, :integer
  end
end
