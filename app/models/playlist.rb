class Playlist < ActiveRecord::Base
  extend FriendlyId
  friendly_id :title, use: :slugged
  has_many :tracks, -> { order("position ASC")}
  has_many :songs, through: :tracks
  belongs_to :user
  attr_accessor :current_user

  alias :user_confirmation :current_user
  validates :user_confirmation, presence: true
  validates :user, presence: true, confirmation: true

  scope :by_user, lambda { |user|
    where(user_id: user.id) if user.respond_to?(:id)
  }

  after_save :notify_track_change
  def notify_track_change
    if playing_track_id_changed?    # ignore changes that don't affect playing_track_id
      # https://github.com/rails/rails/blob/4-1-stable/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb#L13
      ActiveRecord::Base.connection_pool.with_connection do |connection|
        connection.execute "NOTIFY #{channel}, #{connection.quote playing_track_id.to_s}" # executed on a connection thread
      end
    end
  end

  # all possible because of http://www.postgresql.org/docs/9.1/static/libpq-notify.html
  def on_track_change
    ActiveRecord::Base.connection_pool.with_connection do |connection|
      begin
        connection.execute "LISTEN #{channel}"
        loop do
          connection.raw_connection.wait_for_notify do |event, pid, track_id|
            yield track_id
          end
        end
      ensure
        connection.execute "UNLISTEN #{channel}"
      end
    end
  end

  private
  def channel
    "playlist_#{id}"
  end
end
