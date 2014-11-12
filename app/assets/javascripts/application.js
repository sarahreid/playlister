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
//= require foundation
//= require turbolinks
//= require_tree .

$(document).foundation();

// Events: https://github.com/rails/turbolinks/#events
$(document).on('ready', onDocumentReady);     // Happens only once
$(document).on('page:change', onPageChange);  // Happens on every page change

function onDocumentReady() {
  $.getScript("//connect.soundcloud.com/sdk.js").done(onSC).fail(onGetScriptFail);
}

function onPageChange() {
  $('form#song').on('submit', onSongFormSubmit);
  $('form.new_playlist, form.edit_playlist').on('submit', onPlaylistFormSubmit);
  $('button#search-soundcloud').on('click', onSearchButtonClick);
}

function onSC(script, textStatus) {
  window.SC.initialize({client_id: "29ae6663c67b45c96926a8d575eeb418"});
}

function onGetScriptFail(jqxhr, settings, exception) {
  alert(exception);
}

function onSongFormSubmit() {
  var songTitle = $(this).find('input#song_title').val();
  if (songTitle.length === 0) return alertFieldError('song title is empty');
  return true;
}

function onPlaylistFormSubmit() {
  var playlistTitle = $(this).find('input#playlist_title').val();
  if (playlistTitle.length === 0) return alertFieldError('playlist title is empty');
  return true;
}

function onSearchButtonClick() {
  var queryInput = $('input#soundcloud-query');
  var resultsList = $('ul#soundcloud-results');

  var trackQuery = {
    q: queryInput.val(),
    limit: 5
  }

  // Call our API using the SDK
  window.SC.get("/tracks", trackQuery, onTracks);
  function onTracks(tracks) {
    // Remove any previous results
    resultsList.empty();

    if (tracks == null) return false;
    if (!Array.isArray(tracks)) return false;

    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    tracks.forEach(showResult);
    function showResult(track) {
      resultsList.append(resultListItem(track));
    }

    $('button.add-to-playlist').on('click', onAddToPlaylistButtonClick);
  }

  return false;
}

function onAddToPlaylistButtonClick() {
  // http://learn.jquery.com/javascript-101/this-keyword/
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
  var id = $(this).data('soundcloud-id'); // <<< weird-ass black magic

  // $(this).html('adding...');
  var renameButton = $(this).html.bind($(this)); // <<<< the devil has sadfljkdfs taken asjlkdflj over 666
  renameButton('adding...');

  window.SC.get('/tracks/' + id, onTrack);
  function onTrack(track) {
    $('form#song input#song_soundcloud_id').val(track.id);
    $('form#song input#song_soundcloud_permalink_url').val(track.permalink_url);
    $('form#song input#song_title').val(track.title);
    $('form#song input#song_year').val(track.release_year);
    $('form#song input#song_artist').val(track.user.username);
    $('form#song input#song_length').val(track.duration * 0.001);
    $('form#song').submit();
    // console.log(track);
  }

  // https://github.com/rails/jquery-ujs/wiki/ajax/
  $('form#song').on('ajax:success', onSongAddSuccess);
  function onSongAddSuccess(data, status, xhr) {
    renameButton('added');
  }

  return false;
}

function resultListItem(track) {
  return $('<li></li>')
    .addClass('player-list-item')
    .attr('id', 'track-'+track.id)
    .html([
      '<div class="row">',
        '<img class="small-1 columns" src="' + (track.artwork_url || '//placehold.it/100x100') + '" />',
        '<div class="small-2 columns">',
          (track.user || {}).username,
        '</div>',
        '<div class="small-6 columns">',
          '<div class="row">',
            '<div class="small-12 columns">',
              track.title,
            '</div>',
          '</div>',
          '<div class="row">',
            '<audio controls="controls" class="small-12 columns">',
              '<source src="' + track.stream_url + '?client_id=29ae6663c67b45c96926a8d575eeb418" type="audio/mpeg">',
            '</audio>',
          '</div>',
        '</div>',
        '<div class="small-3 columns">',
          '<button class="add-to-playlist" data-soundcloud-id="' + track.id + '">Add to Playlist</button>',
        '</div>',
      '</div>'
    ].join('\n'))
}

function alertFieldError(message) {
  alert(message);
  return false;
}

