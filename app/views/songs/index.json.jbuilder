json.array!(@songs) do |song|
  json.extract! song, :id, :title, :artist, :album, :year, :track, :length
  json.url song_url(song, format: :json)
end
