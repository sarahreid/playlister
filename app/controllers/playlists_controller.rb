class PlaylistsController < ApplicationController
  before_action :authenticate_user!, except: :show

  def index
    @playlists = Playlist.by_user(current_user)
  end

  def show
    @playlist = Playlist.friendly.find(params[:id])
  end

  def new
    @playlist = Playlist.new
  end

  def edit
    @playlist = Playlist.friendly.find(params[:id])
  end

  def create
    @playlist = Playlist.by_user(current_user).new(playlist_params).tap{|p| p.current_user = current_user}

    respond_to do |format|
      if @playlist.save
        format.html { redirect_to @playlist, notice: 'Playlist was successfully created.' }
        format.json { render :show, status: :created, location: @playlist }
      else
        format.html { render :new }
        format.json { render json: @playlist.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @playlist = Playlist.friendly.find(params[:id])
    respond_to do |format|
      if @playlist.tap{|p| p.current_user = current_user}.update(playlist_params)
        format.html { redirect_to @playlist, notice: 'Playlist was successfully updated.' }
        format.json { render :show, status: :ok, location: @playlist }
      else
        format.html { render :edit }
        format.json { render json: @playlist.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    Playlist.friendly.find(params[:id]).tap{|p| p.current_user = current_user}.destroy
    respond_to do |format|
      format.html { redirect_to playlists_url, notice: 'Playlist was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Never trust parameters from the scary internet, only allow the white list through.
    def playlist_params
      params.require(:playlist).permit(:title, :playing_track_id)
    end
end
