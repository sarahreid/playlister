require 'json'

# Emits a server sent event stream for use with EventSource()
# https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events
#
# Example of how to listen to event stream from command line (like `$ tail -f` but for a URI)
#
# $ curl -i http://localhost:5000/stream/partayyyy
# HTTP/1.1 200 OK
# X-Frame-Options: SAMEORIGIN
# X-XSS-Protection: 1; mode=block
# X-Content-Type-Options: nosniff
# Cache-Control: no-cache
# Set-Cookie: request_method=GET; path=/
# Set-Cookie: request_method=GET; path=/
# Content-Type: text/event-stream; charset=utf-8
# X-Request-Id: c9ddf1f9-c341-43af-b712-23775886d0a8
# X-Runtime: 15.656455
# Transfer-Encoding: chunked
#
# event: created_track
# data: {"track_id":"222"}
#
# event: destroyed_track
# data: {"track_id":"222"}
#
# event: destroyed_track
# data: {"track_id":"213"}
#
# ^C
#
#
# Using Puma instead of Webrick so ActionController::Live can leave connections open for
# long periods of time (Webrick fails at this).
#
# Using Rubinius for multiple thread performance. The block passed to Playlist#on_track_change
# is actually run from the ActiveRecord threadpool.
class StreamsController < ApplicationController
  include ActionController::Live

  def show
    response.content_type = "text/event-stream"
    begin
      Playlist.friendly.find(params[:id]).on_track_change do |event, data|
        if event == 'heartbeat'
          response.stream.write(sse({time: data}, {event: event}))
        else
          response.stream.write(sse({track_id: data}, {event: event}))
        end
      end
    rescue IOError => e
      # gracefully handle client disconnect
      logger.info("IOError #{e.message}")
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
