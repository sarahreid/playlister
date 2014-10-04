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
$(document).on('page:change', onPageChange);

function onPageChange() {
  $('form#song').on('submit', onSongFormSubmit);
  $('form.new_playlist, form.edit_playlist').on('submit', onPlaylistFormSubmit);
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

function alertFieldError(message) {
  alert(message);
  return false;
}
