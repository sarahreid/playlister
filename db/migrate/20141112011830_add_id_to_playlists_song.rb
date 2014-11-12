class AddIdToPlaylistsSong < ActiveRecord::Migration
  def change
    add_column :playlists_songs, :id, :primary_key
  end
end
