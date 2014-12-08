require 'json'

class StreamsController < ApplicationController
  include ActionController::Live

  # emits a server sent event stream
  # https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events
  def show
    response.content_type = "text/event-stream"
    begin
      Playlist.friendly.find(params[:id]).on_track_change do |event, track_id|
        response.stream.write(sse({track_id: track_id}, {event: event}))
      end
    rescue IOError
      # gracefully handle client disconnect
    ensure
      response.stream.close
    end
  end

private
  # prints object and options
  def sse(object, options = {})
    (options.map{|k,v| "#{k}: #{v}"} << "data: #{JSON.dump object}").join("\n") + "\n\n"
  end

end
