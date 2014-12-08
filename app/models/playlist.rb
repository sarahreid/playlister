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
    if playing_track_id_changed? # ignore changes that don't affect playing_track_id
      ActiveRecord::Base.connection_pool.with_connection do |connection|
        connection.execute "NOTIFY #{playing_channel}, #{connection.quote playing_track_id.to_s}" # executed on a connection thread
      end
    end
  end

  # Limited by the number of connections in the pool. Connection (thread) limit set in database.yaml
  # As long as a controller is listening on behalf of a browser, one thread from the connection pool is blocked (dedicated) to the listen task
  # see https://github.com/rails/rails/blob/4-1-stable/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb#L13
  #
  # LISTEN is possible because of http://www.postgresql.org/docs/9.1/static/libpq-notify.html
  def on_track_change
    ActiveRecord::Base.connection_pool.with_connection do |connection|
      begin
        connection.execute "LISTEN #{playing_channel}"
        connection.execute "LISTEN #{created_channel}"
        connection.execute "LISTEN #{destroyed_channel}"
        loop do # infinite loop, broken by an IOError
          # Use the raw ruby-pg connection, see http://www.rubydoc.info/github/ged/ruby-pg/PGconn:wait_for_notify
          connection.raw_connection.wait_for_notify(5) do |event, pid, track_id|
            case event
            when playing_channel
              yield 'playing_track', track_id
            when created_channel
              yield 'created_track', track_id
            when destroyed_channel
              yield 'destroyed_track', track_id
            else
              yield event, track_id
            end
          end
          yield 'heartbeat', Time.now
        end
      ensure
        connection.execute "UNLISTEN #{playing_channel}"
        connection.execute "UNLISTEN #{created_channel}"
        connection.execute "UNLISTEN #{destroyed_channel}"
      end
    end
  end

  private
  def playing_channel
    "playlist_#{id}_playing"
  end

  def created_channel
    "playlist_#{id}_created"
  end

  def destroyed_channel
    "playlist_#{id}_destroyed"
  end
end
