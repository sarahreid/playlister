// should have 2 audio elements: currently_playing (visible) and playing_next (invisible)

// should listen on progress events until the media element is buffered before switching playing_next from preload="metadata" to auto
// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio

// playlist should be displayed as a list with data-id attributes
// when the playlist changes or the next track starts playing, playing_next should be computed by finding the
// currently playing track in the list by id and getting the next child with jQuery eg. $(li[data-id=12345] + li)
// http://api.jquery.com/next-siblings-selector/
// access the attributes using http://api.jquery.com/data/

// super cool http://www.waveformjs.org/#options [blog] => https://developers.soundcloud.com/blog/waveforms-let-s-talk-about-them
(function () {
  window.Player = Player;

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

  Player.prototype._load = function (el) {
    this.player[0].load();
  };

  Player.prototype._onTrack = function (evt) {
    this.play($(evt.target));
  };

  Player.prototype._onTrackEnded = function (evt) {
    var next = this._loadedTrackElement().next();
    if (!next.length) next = this._trackElements().first();
    this.play(next);
  };

  Player.prototype._showPlaying = function (evt) {
    this._loadedTrackElement().addClass('playing').siblings().removeClass('playing');
    this.playBtn.hide();
    this.pauseBtn.show();
  };

  Player.prototype._onPause = function (evt) {
    this.playBtn.show();
    this.pauseBtn.hide();
  };

  Player.prototype._trackElements = function () {
    return $(this.trackListId + ' ol li[data-stream-url]')
  };

  Player.prototype._playingTrackElement = function () {
    return $(this.trackListId + ' ol li[data-stream-url].playing')
  };

  Player.prototype._loadedTrackElement = function () {
    return $(this.trackListId + ' ol li[data-id="' + this.loadedId + '"]')
  };

  Player.prototype._extractUrl = function (el) {
    return this._authStreamUrl(el.data('stream-url'));
  };

  Player.prototype._authStreamUrl = function (streamUrl) {
    if (!streamUrl || !streamUrl.length) return undefined;
    return streamUrl + '?client_id=' + this.soundCloudId;
  };

  Player.prototype._sourceTag = function (authedStreamUrl) {
    return '<source src="' + authedStreamUrl + '" type="audio/mpeg">';
  };
})();
