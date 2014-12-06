function Player () {}

// should have 2 audio elements: currently_playing (visible) and playing_next (invisible)

// should listen on progress events until the media element is buffered before switching playing_next from preload="metadata" to auto
// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio

// playlist should be displayed as a list with data-id attributes
// when the playlist changes or the next track starts playing, playing_next should be computed by finding the
// currently playing track in the list by id and getting the next child with jQuery eg. $(li[data-id=12345] + li)
// http://api.jquery.com/next-siblings-selector/
// access the attributes using http://api.jquery.com/data/

// show/hide controls
$('audio').attr('controls', 'controls')
$('audio').attr('controls', null)

// super cool http://www.waveformjs.org/#options [blog] => https://developers.soundcloud.com/blog/waveforms-let-s-talk-about-them
