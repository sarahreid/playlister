json.array!(@songs) do |song|
  json.extract! song, :id, :title, :artist, :album, :year, :track, :length
  json.url playlist_song_url(@playlist, song, format: :json)
end
