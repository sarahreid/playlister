class Track < ActiveRecord::Base
  belongs_to :playlist
  belongs_to :song
  acts_as_list scope: :playlist

  def playing?
    self.id == playlist.playing_track_id
  end

end
