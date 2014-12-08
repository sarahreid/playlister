class SongsController < ApplicationController
  before_action :set_playlist

  # GET /songs
  # GET /songs.json
  def index
    @songs = @playlist.songs
  end

  # GET /songs/1
  # GET /songs/1.json
  def show
    @song = @playlist.songs.find(params[:id])
  end

  # GET /songs/new
  def new
    @song = @playlist.songs.new
  end

  # GET /songs/1/edit
  def edit
    @song = @playlist.songs.find(params[:id])
  end

  # POST /songs
  # POST /songs.json
  def create
    @song = Song.find_or_initialize_by(soundcloud_id: song_params[:soundcloud_id])
    @song.assign_attributes(song_params)
    @playlist.songs << @song

    respond_to do |format|
      if @song.save
        format.html { redirect_to playlist_url(@playlist), notice: 'Song was successfully created.' }
        format.json { render :show, status: :created, location: @song }
        format.js   { render :show }
      else
        format.html { render :new }
        format.json { render json: @song.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /songs/1
  # PATCH/PUT /songs/1.json
  def update
    @song = @playlist.songs.find(params[:id])
    respond_to do |format|
      if @song.update(song_params)
        format.html { redirect_to playlist_song_url(@playlist, @song), notice: 'Song was successfully updated.' }
        format.json { render :show, status: :ok, location: @song }
      else
        format.html { render :edit }
        format.json { render json: @song.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /songs/1
  # DELETE /songs/1.json
  def destroy
    @song = Song.playlist_remove(params[:id], current_user)
    respond_to do |format|
      format.html { redirect_to playlist_url(@playlist), notice: 'Song was successfully removed.' }
      format.json { head :no_content }
      format.js   { render :show }
    end
  end

  private
  def set_playlist
    @playlist = playlist
  end

  def playlist
    Playlist.friendly.find(params[:playlist_id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def song_params
    params.
      require(:song).
      permit(:soundcloud_id, :soundcloud_permalink_url, :soundcloud_stream_url, :soundcloud_waveform_url, :soundcloud_artwork_url, :title, :artist, :album, :year, :length).
      merge(current_user: current_user)
  end
end

