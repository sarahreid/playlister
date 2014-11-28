class RegistrationsController < Devise::RegistrationsController
  def new
    session["new_user"] = params.fetch("user").permit("email") if params.key?("user")
    super
  end
end
