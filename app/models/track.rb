class Track < ActiveRecord::Base
  belongs_to :playlist
  belongs_to :song
  acts_as_list scope: :playlist

  def playing?
    self.id == playlist.playing_track_id
  end

  #notify playlist channel whenever something changes
  after_create :notify_track_creation
  def notify_track_creation
    ActiveRecord::Base.connection_pool.with_connection do |connection|
      connection.execute "NOTIFY #{created_channel}, #{connection.quote id.to_s}"
    end
  end

  after_destroy :notify_track_destruction
  def notify_track_destruction
    ActiveRecord::Base.connection_pool.with_connection do |connection|
      connection.execute "NOTIFY #{destroyed_channel}, #{connection.quote id.to_s}"
    end
  end

private
  def created_channel
    "playlist_#{playlist.id}_created"
  end

  def destroyed_channel
    "playlist_#{playlist.id}_destroyed"
  end
end
