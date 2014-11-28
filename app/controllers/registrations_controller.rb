class RegistrationsController < Devise::RegistrationsController
  def new
    if params.key?("user")
      new_user_params = params.fetch("user").permit("email")
      return redirect_to new_user_session_url(params) if new_user_params["email"].present? && User.exists?(email: new_user_params["email"])
      session["new_user"] = new_user_params
    end
    super
  end
end
