class Song < ActiveRecord::Base
	has_and_belongs_to_many :playlists, after_add: :validate_current_user, after_remove: :validate_current_user
  attr_accessor :current_user

	validates_presence_of :title

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
end
