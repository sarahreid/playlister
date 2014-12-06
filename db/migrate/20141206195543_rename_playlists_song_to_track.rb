class RenamePlaylistsSongToTrack < ActiveRecord::Migration
  def change
    rename_table :playlists_songs, :tracks
  end
end
