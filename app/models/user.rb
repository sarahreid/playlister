class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  has_many :playlists

  def self.new_with_session(params, session)
    params.merge! session.delete("new_user") if session.include?("new_user")
    super # calls original declaration in `bundle show devise`/lib/devise/models/registerable.rb
  end
end
