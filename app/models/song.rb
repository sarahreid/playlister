class Song < ActiveRecord::Base
  has_many :playlists_songs
  has_many :playlists, through: :playlists_songs, after_add: :validate_current_user, after_remove: :validate_current_user
  attr_accessor :current_user

	validates_presence_of :title

  def self.playlist_remove(join_id, current_user)
    ps = PlaylistsSong.find(join_id)
    user = ps.playlist.user
    PlaylistsSong.delete(join_id) if user == current_user
  end

  def initialize(args = {})
    args[:playlist_ids].reject!(&:blank?) if args[:playlist_ids].kind_of?(Array)
    self.current_user = args[:current_user] if args[:current_user]
    super(args)
  end

  def validate_current_user(playlist)
    unless playlist.tap{|p| p.current_user = current_user}.valid?
      raise ActiveRecord::RecordNotSaved
    end
  end

  def destroy(args = {})
    self.current_user = args[:current_user]
    super()
  end

  def remove(join_id)
    self.playlists_songs.delete(PlaylistSong.find(join_id))
  end
end
