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
end
