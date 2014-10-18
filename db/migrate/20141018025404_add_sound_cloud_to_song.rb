class AddSoundCloudToSong < ActiveRecord::Migration
  def change
    add_column :songs, :soundcloud_id, :integer, default: 0
    add_column :songs, :soundcloud_permalink_url, :string
  end
end
