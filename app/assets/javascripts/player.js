// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
// super cool http://www.waveformjs.org/#options [blog] => https://developers.soundcloud.com/blog/waveforms-let-s-talk-about-them

(function () {
  window.Player = Player;

  // set up instance variables
  function Player(soundCloudId, trackListId, playerId, playBtnId, pauseBtnId) {
    this.trackListId = trackListId;
    this.playerId = (playerId || 'audio');
    this.playBtnId = (playBtnId || '.fa-play');
    this.pauseBtnId = (pauseBtnId || '.fa-pause');
    this.soundCloudId = soundCloudId;
    this.trackList = $(this.trackListId);
    this.player = $(this.playerId);
    this.playBtn = $(this.playBtnId);
    this.pauseBtn = $(this.pauseBtnId);
    this.publishTrack = $('#track #playlist_playing_track_id');
    if (!this.player.length) return this._subscribe();
    this.trackList.on('change', this.addListeners.bind(this));
    this.trackList.on('change', this._showPlaying.bind(this));
    this.player.on('ended', this._onTrackEnded.bind(this));
    this.player.on('play', this._showPlaying.bind(this));
    this.player.on('pause', this._onPause.bind(this));
    this.playBtn.on('click', this.play.bind(this));
    this.pauseBtn.on('click', this.pause.bind(this));
    this.addListeners();
    this.load(this._trackElements().first());
  }

  // makes sure every click calls onTrack
  Player.prototype.addListeners = function () {
    this._trackElements().on('click', this._onTrack.bind(this));
  };

  // if called by a jQuery event handler, the first argument is
  // not an element but an event which has an event.type
  Player.prototype.play = function (el) {
    if (el && !el.type) this.load(el);
    this.player[0].play()
  };

  Player.prototype.pause = function () {
    this.player[0].pause()
  };

  // swaps playlist list items into audio player
  // by creating a new source element on each click or track change
  Player.prototype.load = function (el) {
    var url = this._extractUrl(el);
    if (url === undefined) return el;
    this.pause();
    var tag = this._sourceTag(url);
    this.player.html(tag);
    this._load();
    this.loadedId = el.data('id');
    return el;
  };

  // The EventSource interface is used to receive server-sent events.
  // https://developer.mozilla.org/en-US/docs/Web/API/EventSource
  // uses tracklists data attribute eg. <div data-id="4" id="track-list">
  // to listen only for events on this playlist.
  Player.prototype._subscribe = function () {
    var src = new EventSource('/stream/' + this.trackList.data('id'));
    src.addEventListener('track_id', this._onStreamedTrack.bind(this));
  };

  // Parse using JSON to get loaded track element, add "playing" class
  // and add/notify siblings so they know to stop "playing"
  Player.prototype._onStreamedTrack = function (evt) {
    if (!evt.data) return;
    this._loadedTrackElement(JSON.parse(evt.data).track_id).addClass('playing').siblings().removeClass('playing');
  };

  // Proxy to native audio element
  Player.prototype._load = function (el) {
    this.player[0].load();
  };

  Player.prototype._onTrack = function (evt) {
    this.play($(evt.target));
  };

  // Load and play next track, or first track. Should be bound to native
  // audio element
  Player.prototype._onTrackEnded = function (evt) {
    var next = this._loadedTrackElement().next();
    if (!next.length) next = this._trackElements().first();
    this.play(next);
  };

  // Show pause button when playing and
  // Keep UI in sync with audio element
  Player.prototype._showPlaying = function (evt) {
    this._loadedTrackElement().addClass('playing').siblings().removeClass('playing');
    this.playBtn.hide();
    this.pauseBtn.show();
    this.publishTrack.val(this.loadedId).submit();
  };

  // Show play button when paused
  Player.prototype._onPause = function (evt) {
    this.playBtn.show();
    this.pauseBtn.hide();
  };

  // helper query to get all playable tracks
  Player.prototype._trackElements = function () {
    return $(this.trackListId + ' ol li[data-stream-url]')
  };

  // helper query to get currently playing track element
  Player.prototype._playingTrackElement = function () {
    return $(this.trackListId + ' ol li[data-stream-url].playing')
  };

  // helper query to get playlist element by data-id
  Player.prototype._loadedTrackElement = function (id) {
    if (!id) id = this.loadedId
    return $(this.trackListId + ' ol li[data-id="' + id + '"]')
  };

  // builds a playable url from list item
  Player.prototype._extractUrl = function (el) {
    return this._authStreamUrl(el.data('stream-url'));
  };

  // signs url to make it playable
  Player.prototype._authStreamUrl = function (streamUrl) {
    if (!streamUrl || !streamUrl.length) return undefined;
    return streamUrl + '?client_id=' + this.soundCloudId;
  };

  // source element that tells the native audio element how to play the audio
  Player.prototype._sourceTag = function (authedStreamUrl) {
    return '<source src="' + authedStreamUrl + '" type="audio/mpeg">';
  };
})();
