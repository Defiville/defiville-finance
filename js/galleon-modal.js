function galleonModal(e) {
  var galleonType = $(e).attr('class');
  console.log(galleonType);
  if (galleonType == 'pirate-radio') {
    $('#pirateRadioModal').modal();
  } else if (galleonType == 'ghost-galleon') {
    $('#ghostGalleonModal').modal();
  }
}
