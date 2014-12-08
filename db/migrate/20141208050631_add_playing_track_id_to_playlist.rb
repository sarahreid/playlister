class AddPlayingTrackIdToPlaylist < ActiveRecord::Migration
  def change
    add_column :playlists, :playing_track_id, :integer
  end
end
