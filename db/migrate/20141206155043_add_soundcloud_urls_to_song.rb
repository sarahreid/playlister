class AddSoundcloudUrlsToSong < ActiveRecord::Migration
  def change
    add_column :songs, :soundcloud_stream_url, :string
    add_column :songs, :soundcloud_artwork_url, :string
    add_column :songs, :soundcloud_waveform_url, :string
  end
end
