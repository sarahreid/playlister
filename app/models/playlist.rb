class Playlist < ActiveRecord::Base
  has_and_belongs_to_many :songs
  belongs_to :user
  attr_accessor :current_user

  alias :user_confirmation :current_user
  validates :user_confirmation, presence: true
  validates :user, presence: true, confirmation: true

  scope :by_user, lambda { |user|
    where(user_id: user.id) if user.respond_to?(:id)
  }
end
