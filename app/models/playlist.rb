class Playlist < ActiveRecord::Base
  has_and_belongs_to_many :songs
  belongs_to :user

  scope :by_user, lambda { |user|
    where(user_id: user.id) if user.respond_to?(:id)
  }
end
