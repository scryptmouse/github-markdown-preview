define(['jquery', 'moment'], function($, moment) {

  $.fn.setTime = function(d) {
    var $this = $(this)
      , m
    ;

    if (d === null) {
      $this.removeAttr('datetime').empty();
    } else if (typeof d === 'number') {
      try {
        m = moment(d);
        $this.attr('datetime', m.format()).text(m.fromNow());
      } catch(e) {}
    }

    return this;
  };

  return $;
});
