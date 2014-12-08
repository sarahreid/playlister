// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery.turbolinks
//= require jquery_ujs
// require hammerjs
// require jquery-hammerjs
//= require typeahead.js
//= require foundation
//= require turbolinks
//= require_tree .

(function () {
var soundCloudClientId = "29ae6663c67b45c96926a8d575eeb418";
$(document).foundation();

// Events: https://github.com/rails/turbolinks/#events
$(document).on('ready', onDocumentReady);     // Happens only once
$(document).on('page:change', onPageChange);  // Happens on every page change

function onDocumentReady() {
  $.getScript("//connect.soundcloud.com/sdk.js").done(onSC).fail(onGetScriptFail);
}

function onPageChange() {
  window.player = new Player(soundCloudClientId, '#track-list', 'audio');

  var searchInput = $('#search-soundcloud');
  var searchSoundcloud = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 20,
    remote: {
      url: 'https://api.soundcloud.com/tracks?q=%QUERY&filter=public&limit=20&client_id='+soundCloudClientId+'&format=json&_status_code_map[302]=200',
      filter: function trackFilter(tracks) {
        return tracks.filter(function isStreamable(track) { return track.streamable === true })
      },
      rateLimitBy: 'debounce',
      rateLimitWait: 50
    }
  });

  searchSoundcloud.initialize();

  searchInput.typeahead(null, {
    name: 'search-results',
    displayKey: 'title',
    source: searchSoundcloud.ttAdapter()
  });
  searchInput.on('typeahead:selected typeahead:autocompleted', onSelect);
  function onSelect(evt, track) {
    // console.log('onSelect', evt, track);
    $('form#song input#song_soundcloud_id').val(track.id);
    $('form#song input#song_soundcloud_permalink_url').val(track.permalink_url);
    $('form#song input#song_soundcloud_stream_url').val(track.stream_url);
    $('form#song input#song_soundcloud_artwork_url').val(track.artwork_url);
    $('form#song input#song_soundcloud_waveform_url').val(track.waveform_url);
    $('form#song input#song_title').val(track.title);
    $('form#song input#song_year').val(track.release_year);
    $('form#song input#song_artist').val(track.user.username);
    $('form#song input#song_length').val(track.duration * 0.001);
    // $('form#song').trigger('submit.rails');
    $('form#song').submit();
    searchInput.typeahead('val', null);
  }
}

function onSC(script, textStatus) {
  window.SC.initialize({client_id: soundCloudClientId});
}

function onGetScriptFail(jqxhr, settings, exception) {
  alert(exception);
}

function alertFieldError(message) {
  alert(message);
  return false;
}

})();
