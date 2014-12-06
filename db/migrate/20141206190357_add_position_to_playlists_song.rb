class AddPositionToPlaylistsSong < ActiveRecord::Migration
  def change
    add_column :playlists_songs, :position, :integer
  end
end
