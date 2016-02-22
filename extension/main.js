// Make GitHub Issues Easier to read

var comments = [];
var userCommentIndexes = {};
var MODE = "normal";

// Parse information
$(".js-discussion .timeline-comment-wrapper").each(function(i) {
  var comment = {
    username: $(this).find(".author").text().toLowerCase(),
    visible: true,
    el: this
  };
  comments.push(comment);

  if (userCommentIndexes[comment.username]) {
    userCommentIndexes[comment.username].push(i);
  } else {
    userCommentIndexes[comment.username] = [i];
  }
});

function renderBindingLine() {
  if (MODE == "clean") {
    $(".discussion-timeline").addClass("discussion-timeline-clean");
  } else {
    $(".discussion-timeline").removeClass("discussion-timeline-clean");
  }
}

// Return the comment by `username` immediately before `beforeIndex`
function findPrevCommentBy(beforeIndex, username) {
  if (!userCommentIndexes[username]) return null;
  if (beforeIndex < _.first(userCommentIndexes[username])) return null;

  if (beforeIndex > _.last(userCommentIndexes[username])) {
    return _.last(userCommentIndexes[username]);
  }

  return _.find(userCommentIndexes[username], function(index, i) {
    var nextIndex = userCommentIndexes[username][i+1];
    return index < beforeIndex && beforeIndex < nextIndex;
  });
}

// Show the mentioned user's last comment
function cleanMode(currIndex, prevIndex) {
  // Remove all existing cloned comments
  $('.cloned-comment-element').remove();

  var $prevClone = $(comments[prevIndex].el).clone();
  var prevHeight = $(comments[prevIndex].el).height();

  $prevClone.addClass("cloned-comment-element");
  $prevClone.css({
    position: "absolute",
    transform: "translateY(-" + (30 + prevHeight) + "px)"
  });

  $(comments[currIndex].el).before($prevClone);

  _.forEach(comments, function(comment, i) {
    if (i >= currIndex) return;

    $(comment.el).css("transition", "opacity .4s");
    $(comment.el).css("opacity", 0);
  });
  MODE = "clean";
  renderBindingLine();
}

// Back to normal viewing mode
function normalMode() {
  $(".cloned-comment-element").remove();
  $(".js-discussion .timeline-comment-wrapper").css("opacity", 1);
  MODE = "normal";
  renderBindingLine();
}

// Set up right click events
// If the mentioned user has a previous comment, enter clean mode
// Otherwise, show a popup saying this user isn't in this thread yet.
$(".comment-body").each(function(i) {
  var $commentBody = $(this);

  $(this).find(".user-mention").each(function() {
    // Clean up comment on right click
    var mentionedUser = $(this).text().toLowerCase().slice(1);
    var prevComment = findPrevCommentBy(i, mentionedUser);

    if (prevComment) {
      $(this).on("mousedown", function(event) {
        // Only for right click
        if (event.which == 3) {
          // Make sure right click doesn't trigger selection
          $commentBody.css("-webkit-user-select", "none");
          cleanMode(i, prevComment);
          setTimeout(function() {
            $commentBody.css("-webkit-user-select", "text");
          }, 400);
        }
      });
    } else {
      $(this).on("mousedown", function(event) {

        // Make sure right click doesn't trigger selection
        $commentBody.css("-webkit-user-select", "none");

        $(this).addClass('mentioned-nothere-popup')
               .attr('data-mentioned-username', '@' + mentionedUser);

        setTimeout(function() {
          $commentBody.css("-webkit-user-select", "text");
        }, 400);

        var $this = $(this);
        setTimeout(function() {
          $this.removeClass('mentioned-nothere-popup');
        }, 2000);
      });
    }

  });
});

// Exit clean mode event
$(".main-content").on("mousedown", function(e) {
  if (e.which == 3 && !$(e.target).parents(".timeline-comment-wrapper").length) {
    normalMode();
  }
});

// Disable context menus
$(document).on("contextmenu", function(event) {
  return false;
});
